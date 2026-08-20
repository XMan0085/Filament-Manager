export class SpoolModal {
  static renderSpoolForm(spool = null, filters = { brands: [], materials: [] }) {
    const s = spool || {};
    
    const brandOptions = filters.brands.map(b => `<option value="${b}">`).join('');
    const materialOptions = filters.materials.map(m => `<option value="${m}">`).join('');

    const colorHex = s.colorHex || '#2563eb'; // Default to a premium blue
    const currentWeight = s.remainingWeightG !== undefined ? s.remainingWeightG : 1000;

    return `
      <form id="spoolForm">
        <input type="hidden" name="id" value="${s.id || ''}">
        
        <div class="form-grid">
          <div class="form-group">
            <label>Brand</label>
            <input type="text" name="brand" class="form-control" list="brandList" value="${this.escapeHtml(s.brand || '')}" placeholder="e.g. Bambu Lab" autocomplete="off">
            <datalist id="brandList">${brandOptions}</datalist>
          </div>

          <div class="form-group">
            <label>Material Type</label>
            <input type="text" name="material" class="form-control" list="materialList" value="${this.escapeHtml(s.material || '')}" placeholder="e.g. PLA" autocomplete="off">
            <datalist id="materialList">${materialOptions}</datalist>
          </div>

          <div class="form-group full-width">
            <label>Spool Title <span style="font-weight:400; color: var(--text-muted);">(Optional)</span></label>
            <input type="text" name="name" class="form-control" value="${this.escapeHtml(s.name || '')}" placeholder="e.g. Matte Olive Green">
          </div>

          <div class="form-group full-width">
            <label>Filament Color</label>
            <div class="color-picker-wrapper">
              <input type="color" name="colorHex" id="colorHexInput" class="color-picker-input" value="${colorHex}">
              <div class="color-picker-info">
                <span class="color-preview-hex" id="colorPreviewHex">${colorHex.toUpperCase()}</span>
                <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">Click swatch to pick custom color</span>
              </div>
            </div>
          </div>

          <div class="form-group full-width">
            <label>Weight (g)</label>
            <input type="number" name="weightG" class="form-control" value="${currentWeight}" min="0" placeholder="e.g. 1000">
          </div>

          <div class="form-group">
            <label>Nozzle Temp</label>
            <input type="text" name="nozzleTemp" class="form-control" value="${this.escapeHtml(s.nozzleTemp || '')}" placeholder="e.g. 200-220°C">
          </div>

          <div class="form-group">
            <label>Bed Temp</label>
            <input type="text" name="bedTemp" class="form-control" value="${this.escapeHtml(s.bedTemp || '')}" placeholder="e.g. 55-65°C">
          </div>

          <div class="form-group full-width">
            <label>Date Unsealed</label>
            <input type="date" name="unsealedDate" class="form-control" value="${this.escapeHtml(s.unsealedDate || '')}">
          </div>

          <div class="form-group full-width">
            <label>Notes <span style="font-weight:400; color: var(--text-muted);">(Optional)</span></label>
            <textarea name="notes" class="form-control" rows="2" placeholder="e.g. Needs drying, use hardened nozzle...">${this.escapeHtml(s.notes || '')}</textarea>
          </div>
        </div>
      </form>
    `;
  }

  static attachFormListeners(formElement) {
    const colorInput = formElement.querySelector('#colorHexInput');
    const previewHex = formElement.querySelector('#colorPreviewHex');

    if (colorInput && previewHex) {
      colorInput.addEventListener('input', (e) => {
        previewHex.textContent = e.target.value.toUpperCase();
      });
    }
  }

  static escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
