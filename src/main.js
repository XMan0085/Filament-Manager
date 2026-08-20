import { StorageManager } from './data/storage.js';
import { InventoryView } from './components/InventoryView.js';
import { SpoolModal } from './components/SpoolModal.js';

class App {
  constructor() {
    this.spools = [];
    this.filters = { brands: [], materials: [] };
    this.viewMode = 'grid';
    this.init();
  }

  async init() {
    this.setupThemeToggle();
    this.setupViewToggles();
    await this.loadData();
    this.setupSearchAndFilters();
    this.setupModalHandlers();
    this.render();
  }

  async loadData() {
    this.spools = await StorageManager.getSpools();
    this.filters = await StorageManager.getFilters();
    this.populateFilterDropdowns();
  }

  setupThemeToggle() {
    const btn = document.getElementById('themeToggleBtn');
    if (!btn) return;
    const saved = localStorage.getItem('filament_theme') || 'light';
    document.body.setAttribute('data-theme', saved);
    this.updateThemeButton(saved);
    btn.addEventListener('click', () => {
      const next = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.body.setAttribute('data-theme', next);
      localStorage.setItem('filament_theme', next);
      this.updateThemeButton(next);
    });
  }

  updateThemeButton(theme) {
    const btn = document.getElementById('themeToggleBtn');
    if (btn) btn.innerHTML = theme === 'light' ? '🌙' : '☀️';
  }

  setupViewToggles() {
    const gridBtn = document.getElementById('viewGridBtn');
    const listBtn = document.getElementById('viewListBtn');
    const gridArea = document.getElementById('spoolGridArea');

    gridBtn?.addEventListener('click', () => {
      this.viewMode = 'grid';
      gridBtn.classList.add('active');
      listBtn?.classList.remove('active');
      gridArea?.classList.remove('spool-list');
    });

    listBtn?.addEventListener('click', () => {
      this.viewMode = 'list';
      listBtn.classList.add('active');
      gridBtn?.classList.remove('active');
      gridArea?.classList.add('spool-list');
    });
  }

  populateFilterDropdowns() {
    const filterMaterial = document.getElementById('filterMaterial');
    const filterBrand    = document.getElementById('filterBrand');

    if (filterMaterial) {
      const cur = filterMaterial.value;
      filterMaterial.innerHTML = `<option value="ALL">All Materials</option>` +
        this.filters.materials.map(m => `<option value="${m}">${m}</option>`).join('');
      filterMaterial.value = cur;
    }

    if (filterBrand) {
      const cur = filterBrand.value;
      filterBrand.innerHTML = `<option value="ALL">All Brands</option>` +
        this.filters.brands.map(b => `<option value="${b}">${b}</option>`).join('');
      filterBrand.value = cur;
    }
  }

  setupSearchAndFilters() {
    ['searchInput', 'filterMaterial', 'filterBrand', 'filterStatus'].forEach(id => {
      document.getElementById(id)?.addEventListener('input',  () => this.renderInventory());
      document.getElementById(id)?.addEventListener('change', () => this.renderInventory());
    });
  }

  setupModalHandlers() {
    document.getElementById('addSpoolBtn')?.addEventListener('click', () => this.openEditModal(null));
    document.getElementById('globalLogPrintBtn')?.addEventListener('click', () => this.openPrintModal());

    document.getElementById('saveSpoolSubmitBtn')?.addEventListener('click', () => this.handleSaveSpoolForm());
    document.getElementById('submitPrintJobBtn')?.addEventListener('click', () => this.handleSubmitPrintJob());

    // Detail modal "Edit" button (delegated)
    document.getElementById('detailModalOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'detailEditBtn') {
        const id = e.target.getAttribute('data-spool-id');
        const spool = this.spools.find(s => s.id === id);
        this.closeAllModals();
        if (spool) this.openEditModal(spool);
      }
      if (e.target.id === 'detailDeleteBtn') {
        const id = e.target.getAttribute('data-spool-id');
        const spool = this.spools.find(s => s.id === id);
        const label = spool ? `${spool.brand} ${spool.material}${spool.name ? ' — ' + spool.name : ''}` : '';
        this.handleDelete(id, label);
      }
    });

    // Close buttons
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => { e.preventDefault(); this.closeAllModals(); });
    });

    // Card click delegation
    document.addEventListener('click', async (e) => {
      const deleteBtn = e.target.closest('.btn-delete-spool');
      const card = e.target.closest('.spool-card-clickable');

      if (deleteBtn) {
        e.stopPropagation();
        const id = deleteBtn.getAttribute('data-spool-id');
        const spool = this.spools.find(s => s.id === id);
        const label = spool ? `${spool.brand} ${spool.material}${spool.name ? ' — ' + spool.name : ''}` : '';
        await this.handleDelete(id, label);
      } else if (card) {
        const id = card.getAttribute('data-spool-id');
        const spool = this.spools.find(s => s.id === id);
        if (spool) this.openDetailModal(spool);
      }
    });
  }

  async handleDelete(id, spoolLabel = '') {
    if (!id) return;
    const confirmed = await this.showDeleteConfirm(spoolLabel);
    if (confirmed) {
      await StorageManager.deleteSpool(id);
      await this.loadData();
      this.render();
      this.closeAllModals();
    }
  }

  showDeleteConfirm(spoolLabel = '') {
    return new Promise((resolve) => {
      const overlay   = document.getElementById('deleteConfirmOverlay');
      const msgEl     = document.getElementById('deleteConfirmMessage');
      const confirmBtn = document.getElementById('deleteConfirmBtn');
      const cancelBtn  = document.getElementById('deleteCancelBtn');

      if (msgEl) {
        msgEl.innerHTML = spoolLabel
          ? `Permanently remove <strong>${this._esc(spoolLabel)}</strong> from your inventory? This cannot be undone.`
          : `Permanently remove this spool from your inventory? This cannot be undone.`;
      }

      overlay?.classList.add('active');

      const cleanup = (result) => {
        overlay?.classList.remove('active');
        confirmBtn?.removeEventListener('click', onConfirm);
        cancelBtn?.removeEventListener('click', onCancel);
        resolve(result);
      };

      const onConfirm = () => cleanup(true);
      const onCancel  = () => cleanup(false);

      confirmBtn?.addEventListener('click', onConfirm, { once: true });
      cancelBtn?.addEventListener('click',  onCancel,  { once: true });
    });
  }

  /* ── Render ── */
  render() {
    this.renderMetrics();
    this.renderInventory();
  }

  renderMetrics() {
    const total  = this.spools.length;
    const empty  = this.spools.filter(s => (s.remainingWeightG || 0) <= 0).length;
    const low    = this.spools.filter(s => {
      const rem = s.remainingWeightG || 0;
      if (rem <= 0) return false;
      const init = s.initialWeightG || 1000;
      return (rem / init) <= 0.15 || rem <= 150;
    }).length;

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('statTotalSpools', total);
    set('statEmptySpools', empty);
    set('statLowAlerts',   low);
  }

  renderInventory() {
    const gridArea = document.getElementById('spoolGridArea');
    if (!gridArea) return;

    const q        = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const matVal   = document.getElementById('filterMaterial')?.value || 'ALL';
    const brandVal = document.getElementById('filterBrand')?.value || 'ALL';
    const status   = document.getElementById('filterStatus')?.value || 'ALL';

    const filtered = this.spools.filter(s => {
      const search =
        s.brand?.toLowerCase().includes(q) ||
        s.material?.toLowerCase().includes(q) ||
        s.name?.toLowerCase().includes(q)   ||
        s.notes?.toLowerCase().includes(q);
      const mat    = matVal   === 'ALL' || s.material === matVal;
      const brand  = brandVal === 'ALL' || s.brand    === brandVal;
      let st = true;
      if (status === 'LOW') {
        const rem = s.remainingWeightG || 0;
        st = rem > 0 && ((rem / (s.initialWeightG || 1000)) <= 0.15 || rem <= 150);
      } else if (status === 'EMPTY') {
        st = (s.remainingWeightG || 0) <= 0;
      }
      return search && mat && brand && st;
    });

    if (!filtered.length) {
      gridArea.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3>No spools found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>`;
      return;
    }

    gridArea.innerHTML = filtered.map(s => InventoryView.renderSpoolCard(s)).join('');
  }

  /* ── Detail Modal ── */
  openDetailModal(spool) {
    const overlay = document.getElementById('detailModalOverlay');
    const body    = document.getElementById('detailModalBody');
    if (!overlay || !body) return;

    const rem    = spool.remainingWeightG || 0;
    const init   = spool.initialWeightG  || 1000;
    const pct    = Math.max(0, Math.min(100, Math.round((rem / init) * 100)));
    const isEmpty = rem <= 0;

    let gaugeColor = '#10b981';
    if (isEmpty)       gaugeColor = '#9ca3af';
    else if (pct <= 15) gaugeColor = '#ef4444';
    else if (pct <= 30) gaugeColor = '#f59e0b';

    const hex    = spool.colorHex || '#888888';
    const isLight = this._isLight(hex);
    const textOnColor = isLight ? '#111' : '#fff';

    body.innerHTML = `
      <!-- Color Banner -->
      <div class="detail-banner" style="background:${hex};">
        <div class="detail-banner-swatch" style="border-color:${textOnColor}33;"></div>
        <div>
          <div class="detail-banner-brand" style="color:${textOnColor}99;">${this._esc(spool.brand)}</div>
          <div class="detail-banner-name"  style="color:${textOnColor};">${this._esc(spool.name || spool.material)}</div>
          <span class="detail-banner-badge" style="background:${textOnColor}22; color:${textOnColor};">
            ${this._esc(spool.material)}
          </span>
        </div>
      </div>

      <!-- Weight -->
      <div class="detail-section">
        <div class="detail-section-label">Current Weight</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
          <span style="font-size:1.5rem; font-weight:800; color:var(--text-main);">${rem}g</span>
          <span style="font-size:0.9rem; font-weight:700; color:${gaugeColor};">${isEmpty ? 'Empty' : pct + '%'}</span>
        </div>
        <div class="gauge-bar-bg">
          <div class="gauge-bar-fill" style="width:${pct}%; background:${gaugeColor};"></div>
        </div>
      </div>

      <!-- Specs -->
      <div class="detail-section">
        <div class="detail-section-label">Print Settings</div>
        <div class="detail-specs">
          <div class="detail-spec-item">
            <span class="detail-spec-icon">🌡️</span>
            <div>
              <div class="detail-spec-label">Nozzle Temp</div>
              <div class="detail-spec-value">${this._esc(spool.nozzleTemp) || '—'}</div>
            </div>
          </div>
          <div class="detail-spec-item">
            <span class="detail-spec-icon">🔥</span>
            <div>
              <div class="detail-spec-label">Bed Temp</div>
              <div class="detail-spec-value">${this._esc(spool.bedTemp) || '—'}</div>
            </div>
          </div>
          <div class="detail-spec-item">
            <span class="detail-spec-icon">📅</span>
            <div>
              <div class="detail-spec-label">Date Opened</div>
              <div class="detail-spec-value">${this._esc(spool.unsealedDate) || '—'}</div>
            </div>
          </div>
          <div class="detail-spec-item">
            <span class="detail-spec-icon">📦</span>
            <div>
              <div class="detail-spec-label">Hex Color</div>
              <div class="detail-spec-value" style="font-family:monospace;">${hex}</div>
            </div>
          </div>
        </div>
      </div>

      ${spool.notes ? `
      <div class="detail-section">
        <div class="detail-section-label">Notes</div>
        <div class="detail-notes">${this._esc(spool.notes)}</div>
      </div>` : ''}

      <!-- Actions -->
      <div class="detail-actions">
        <button id="detailDeleteBtn" class="btn btn-danger" data-spool-id="${spool.id}">🗑️ Delete</button>
        <button id="detailEditBtn"   class="btn btn-primary" data-spool-id="${spool.id}">✏️ Edit Spool</button>
      </div>
    `;

    overlay.classList.add('active');
  }

  /* ── Edit Modal ── */
  openEditModal(spool = null) {
    const titleEl = document.getElementById('spoolModalTitle');
    const bodyEl  = document.getElementById('spoolModalBody');
    const overlay = document.getElementById('spoolModalOverlay');

    if (titleEl) titleEl.textContent = spool ? 'Edit Spool' : 'Add New Spool';
    if (bodyEl) {
      bodyEl.innerHTML = SpoolModal.renderSpoolForm(spool, this.filters);
      SpoolModal.attachFormListeners(document.getElementById('spoolForm'));
    }
    overlay?.classList.add('active');
  }

  async handleSaveSpoolForm() {
    const form = document.getElementById('spoolForm');
    if (!form) return;

    const formData = new FormData(form);
    const brand    = formData.get('brand')?.trim();
    const material = formData.get('material')?.trim();

    if (!brand || !material) {
      // Shake the save button and show inline message
      const btn = document.getElementById('saveSpoolSubmitBtn');
      btn?.classList.add('btn-shake');
      setTimeout(() => btn?.classList.remove('btn-shake'), 600);
      document.getElementById('saveValidationMsg')?.remove();
      const msg = document.createElement('p');
      msg.id = 'saveValidationMsg';
      msg.style.cssText = 'color:var(--accent-red);font-size:0.85rem;margin:0.5rem 1.75rem 0;';
      msg.textContent = '⚠️ Brand and Material Type are required.';
      document.getElementById('spoolModalBody')?.after(msg);
      return;
    }

    const weight = Number(formData.get('weightG')) || 0;
    const existId = formData.get('id') || undefined;
    const existing = this.spools.find(s => s.id === existId);

    const spoolData = {
      id: existId,
      brand,
      material,
      name:        formData.get('name'),
      colorHex:    formData.get('colorHex') || '#cccccc',
      initialWeightG: existing ? (existing.initialWeightG || weight) : weight,
      remainingWeightG: weight,
      nozzleTemp:  formData.get('nozzleTemp'),
      bedTemp:     formData.get('bedTemp'),
      unsealedDate: formData.get('unsealedDate'),
      notes:       formData.get('notes')
    };

    await StorageManager.updateSpool(spoolData);
    this.closeAllModals();
    await this.loadData();
    this.render();
  }

  /* ── Print Modal ── */
  openPrintModal() {
    const overlay = document.getElementById('logPrintModalOverlay');
    const form    = document.getElementById('printJobForm');
    if (form) form.reset();
    this._renderSpoolSelection('');
    overlay?.classList.add('active');

    // Search filter inside print modal
    document.getElementById('printSpoolSearch')?.addEventListener('input', (e) => {
      this._renderSpoolSelection(e.target.value.toLowerCase());
    });
  }

  _renderSpoolSelection(query) {
    const area = document.getElementById('multiSpoolSelectionArea');
    if (!area) return;

    const activeSpools = this.spools.filter(s => {
      const hasWeight = (s.remainingWeightG || 0) > 0;
      if (!hasWeight) return false;
      if (!query) return true;
      return (
        s.brand?.toLowerCase().includes(query) ||
        s.material?.toLowerCase().includes(query) ||
        s.name?.toLowerCase().includes(query)
      );
    });

    if (!activeSpools.length) {
      area.innerHTML = `<div class="empty-state" style="padding:1.5rem;">
        <div class="empty-state-icon" style="font-size:2rem;">📦</div>
        <p>${query ? 'No spools match your search.' : 'No filament with remaining weight.'}</p>
      </div>`;
      return;
    }

    area.innerHTML = activeSpools.map(s => `
      <div class="spool-selection-item" id="sel-item-${s.id}">
        <input type="checkbox" name="spoolCheck" value="${s.id}" id="check_${s.id}"
               style="width:18px;height:18px;flex-shrink:0;cursor:pointer;">
        <div class="spool-selection-dot" style="background-color:${s.colorHex || '#888'};"></div>
        <label for="check_${s.id}" style="flex:1;cursor:pointer;font-size:0.875rem;font-weight:500;color:var(--text-main);">
          ${this._esc(s.brand)} ${this._esc(s.material)}${s.name ? ` — ${this._esc(s.name)}` : ''}
          <span style="color:var(--text-muted);font-size:0.8rem;margin-left:0.35rem;">(${s.remainingWeightG}g left)</span>
        </label>
        <input type="number" name="weight_${s.id}" placeholder="g used"
               min="1" max="${s.remainingWeightG}"
               class="form-control btn-sm" style="width:85px;flex-shrink:0;" disabled>
      </div>
    `).join('');

    // Re-attach checkbox listeners
    area.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const wi = document.querySelector(`input[name="weight_${e.target.value}"]`);
        if (!wi) return;
        wi.disabled = !e.target.checked;
        wi.required = e.target.checked;
        if (e.target.checked) { wi.focus(); }
        else { wi.value = ''; }
      });
    });
  }

  async handleSubmitPrintJob() {
    const form = document.getElementById('printJobForm');
    if (!form) return;

    const checked = [...form.querySelectorAll('input[name="spoolCheck"]:checked')];
    if (!checked.length) { alert('Please select at least one spool.'); return; }

    const deductions = [];
    let hasErr = false;
    checked.forEach(cb => {
      const wi = form.querySelector(`input[name="weight_${cb.value}"]`);
      const w  = Number(wi?.value);
      if (!w || w <= 0) { hasErr = true; return; }
      deductions.push({ id: cb.value, weightUsed: w });
    });

    if (hasErr) { alert('Please enter a valid weight for all selected spools.'); return; }

    await StorageManager.deductWeights(deductions);
    this.closeAllModals();
    await this.loadData();
    this.render();
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    document.getElementById('saveValidationMsg')?.remove();
  }

  /* ── Helpers ── */
  _esc(str) {
    if (!str) return '';
    return str.toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  _isLight(hex) {
    try {
      const r = parseInt(hex.slice(1,3),16);
      const g = parseInt(hex.slice(3,5),16);
      const b = parseInt(hex.slice(5,7),16);
      return (r*299 + g*587 + b*114) / 1000 > 128;
    } catch { return true; }
  }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new App(); });
