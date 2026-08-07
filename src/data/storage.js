const API_BASE = 'http://localhost:3001/api';

export class StorageManager {
  static async getSpools() {
    try {
      const res = await fetch(`${API_BASE}/spools`);
      if (!res.ok) throw new Error('Failed to fetch spools');
      return await res.json();
    } catch (e) {
      console.error('Error loading spools from API', e);
      return [];
    }
  }

  static async addSpool(spool) {
    try {
      const res = await fetch(`${API_BASE}/spools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spool)
      });
      if (!res.ok) throw new Error('Failed to save spool');
      return await res.json(); // returns { success, id }
    } catch (e) {
      console.error('Error saving spool via API', e);
      return null;
    }
  }

  static async updateSpool(updatedSpool) {
    return this.addSpool(updatedSpool); // Backend handles upsert
  }

  static async deleteSpool(spoolId) {
    try {
      const res = await fetch(`${API_BASE}/spools/${spoolId}`, { method: 'DELETE' });
      return res.ok;
    } catch (e) {
      console.error('Error deleting spool', e);
      return false;
    }
  }

  static async deductWeights(deductions) {
    try {
      const res = await fetch(`${API_BASE}/spools/deduct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deductions })
      });
      return res.ok;
    } catch (e) {
      console.error('Error deducting weights', e);
      return false;
    }
  }

  static async getFilters() {
    try {
      const res = await fetch(`${API_BASE}/filters`);
      if (!res.ok) throw new Error('Failed to fetch filters');
      return await res.json();
    } catch (e) {
      console.error('Error loading filters from API', e);
      return { brands: [], materials: [] };
    }
  }
}
