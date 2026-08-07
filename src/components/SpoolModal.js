export class SpoolModal {
  static renderSpoolForm(spool = null, filters = { brands: [], materials: [] }) {
    const s = spool || {};
    
    const brandOptions = filters.brands.map(b => `<option value="${b}">`).join('');
    const materialOptions = filters.materials.map(m => `<option value="${m}">`).join('');

    const colorHex = s.colorHex || '#FFFFFF';

    // Large filament-focused color grid: 8 columns × 6 rows = 48 colors
    const colors = [
      // Whites & Greys
      '#FFFFFF', '#F5F5F5', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575', '#424242', '#212121',
      // Warm Reds & Pinks
      '#FF1744', '#F44336', '#E53935', '#C62828', '#FF80AB', '#F48FB1', '#E91E63', '#880E4F',
      // Oranges & Yellows
      '#FF6D00', '#FF9100', '#FFB300', '#FFC400', '#FFEB3B', '#FFD600', '#F9A825', '#E65100',
      // Greens
      '#00E676', '#4CAF50', '#2E7D32', '#1B5E20', '#76FF03', '#AEEA00', '#8BC34A', '#33691E',
      // Blues & Cyans
      '#00B0FF', '#2196F3', '#1565C0', '#0D47A1', '#00E5FF', '#00BCD4', '#006064', '#01579B',
      // Purples, Browns & Special
      '#7C4DFF', '#9C27B0', '#4A148C', '#6A1B9A', '#FF6F00', '#5D4037', '#3E2723', '#000000',
    ];

    const colorGrid = colors.map(c => {
      const isSelected = c.toUpperCase() === colorHex.toUpperCase();
      return `<div class="color-swatch-preset ${isSelected ? 'selected' : ''}" data-hex="${c}" title="${c}" style="background-color: ${c};"></div>`;
    }).join('');

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
            <input type="hidden" name="colorHex" id="colorHexInput" value="${colorHex}">
            <div class="color-preview-row">
              <div class="color-preview-swatch" id="colorPreviewSwatch" style="background-color: ${colorHex};"></div>
              <span class="color-preview-hex" id="colorPreviewHex">${colorHex}</span>
            </div>
            <div class="color-grid-palette">
              ${colorGrid}
            </div>
          </div>

          <div class="form-group">
            <label>Initial Net Weight (g)</label>
            <input type="number" name="initialWeightG" class="form-control" value="${s.initialWeightG || 1000}" min="0">
          </div>

          <div class="form-group">
            <label>Remaining Weight (g)</label>
            <input type="number" name="remainingWeightG" class="form-control" value="${s.remainingWeightG !== undefined ? s.remainingWeightG : 1000}" min="0">
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
    const presets = formElement.querySelectorAll('.color-swatch-preset');
    const colorInput = formElement.querySelector('#colorHexInput');
    const previewSwatch = formElement.querySelector('#colorPreviewSwatch');
    const previewHex = formElement.querySelector('#colorPreviewHex');

    const updateColor = (hex) => {
      if (colorInput) colorInput.value = hex;
      if (previewSwatch) previewSwatch.style.backgroundColor = hex;
      if (previewHex) previewHex.textContent = hex;
    };

    presets.forEach(p => {
      p.addEventListener('click', () => {
        const hex = p.getAttribute('data-hex');
        // Clear all selections
        presets.forEach(preset => preset.classList.remove('selected'));
        // Mark this one
        p.classList.add('selected');
        updateColor(hex);
      });
    });
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
