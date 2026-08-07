import express from 'express';
import cors from 'cors';
import { DatabaseSync } from 'node:sqlite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(__dirname, 'filament.db');
const db = new DatabaseSync(dbPath);

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS spools (
    id TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    material TEXT NOT NULL,
    name TEXT,
    colorHex TEXT,
    initialWeightG INTEGER,
    remainingWeightG INTEGER,
    nozzleTemp TEXT,
    bedTemp TEXT,
    unsealedDate TEXT,
    notes TEXT
  )
`);

// Inject Sample Data if empty
const countStmt = db.prepare('SELECT COUNT(*) as count FROM spools');
if (countStmt.get().count === 0) {
  const insertStmt = db.prepare(`
    INSERT INTO spools (id, brand, material, name, colorHex, initialWeightG, remainingWeightG, nozzleTemp, bedTemp, unsealedDate, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const sampleData = [
    ['spool-1', 'Bambu Lab', 'PLA Basic', 'Jade White', '#FFFFFF', 1000, 750, '220', '60', '2026-08-01', 'Standard white, prints well.'],
    ['spool-2', 'Polymaker', 'PolyLite PETG', 'Teal', '#00B0F0', 1000, 420, '235', '70', '2026-07-15', 'Good for mechanical parts.'],
    ['spool-3', 'eSUN', 'ABS+', 'Fire Engine Red', '#FF0000', 1000, 950, '250', '100', '2026-08-03', 'Requires enclosure.'],
    ['spool-4', 'Overture', 'TPU 95A', 'Ninja Black', '#000000', 1000, 1000, '225', '50', '2026-08-04', 'Flexible. Dry before use.'],
    ['spool-5', 'Bambu Lab', 'PLA-CF', 'Carbon Black', '#475569', 1000, 120, '230', '60', '2026-06-10', 'Abrasive! Use hardened steel nozzle.']
  ];

  db.exec('BEGIN TRANSACTION');
  for (const spool of sampleData) {
    insertStmt.run(...spool);
  }
  db.exec('COMMIT');
  console.log('Sample data injected.');
}

// --- API Endpoints ---

// Get all spools
app.get('/api/spools', (req, res) => {
  const stmt = db.prepare('SELECT * FROM spools');
  const spools = stmt.all();
  res.json(spools);
});

// Add or update a spool
app.post('/api/spools', (req, res) => {
  const spool = req.body;
  if (!spool.id) {
    spool.id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
  }

  const stmt = db.prepare(`
    INSERT INTO spools (id, brand, material, name, colorHex, initialWeightG, remainingWeightG, nozzleTemp, bedTemp, unsealedDate, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      brand = excluded.brand,
      material = excluded.material,
      name = excluded.name,
      colorHex = excluded.colorHex,
      initialWeightG = excluded.initialWeightG,
      remainingWeightG = excluded.remainingWeightG,
      nozzleTemp = excluded.nozzleTemp,
      bedTemp = excluded.bedTemp,
      unsealedDate = excluded.unsealedDate,
      notes = excluded.notes
  `);

  try {
    stmt.run(
      spool.id,
      spool.brand,
      spool.material,
      spool.name || '',
      spool.colorHex || '#000000',
      spool.initialWeightG || 1000,
      spool.remainingWeightG || 1000,
      spool.nozzleTemp || '',
      spool.bedTemp || '',
      spool.unsealedDate || '',
      spool.notes || ''
    );
    res.json({ success: true, id: spool.id });
  } catch (error) {
    console.error('Error saving spool:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a spool
app.delete('/api/spools/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM spools WHERE id = ?');
  stmt.run(req.params.id);
  res.json({ success: true });
});

// Deduct weight from multiple spools (Log Print Job replacement)
app.post('/api/spools/deduct', (req, res) => {
  const { deductions } = req.body; // Array of { id, weightUsed }
  
  if (!deductions || !Array.isArray(deductions)) {
    return res.status(400).json({ error: 'Invalid deductions array' });
  }

  // Use a transaction for atomic updates
  db.exec('BEGIN TRANSACTION');
  try {
    const stmt = db.prepare('UPDATE spools SET remainingWeightG = MAX(0, remainingWeightG - ?) WHERE id = ?');
    for (const d of deductions) {
      stmt.run(Number(d.weightUsed), d.id);
    }
    db.exec('COMMIT');
    res.json({ success: true });
  } catch (error) {
    db.exec('ROLLBACK');
    console.error('Error deducting weights:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get unique filter values
app.get('/api/filters', (req, res) => {
  const brands = db.prepare("SELECT DISTINCT brand FROM spools WHERE brand IS NOT NULL AND brand != ''").all().map(r => r.brand);
  const materials = db.prepare("SELECT DISTINCT material FROM spools WHERE material IS NOT NULL AND material != ''").all().map(r => r.material);
  res.json({ brands, materials });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Filament Manager API running on http://localhost:${PORT}`);
});
