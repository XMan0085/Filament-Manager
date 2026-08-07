export class InventoryView {
  static renderSpoolCard(spool) {
    const remaining = spool.remainingWeightG || 0;
    const initial   = spool.initialWeightG  || 1000;
    const pct       = Math.max(0, Math.min(100, Math.round((remaining / initial) * 100)));
    const isEmpty   = remaining <= 0;

    // Determine gauge colour
    let gaugeColor;
    if (isEmpty)       gaugeColor = '#9ca3af';
    else if (pct <= 15) gaugeColor = '#ef4444';
    else if (pct <= 30) gaugeColor = '#f59e0b';
    else                gaugeColor = '#10b981';

    const isLow   = !isEmpty && (pct <= 15 || remaining <= 150);
    const cardClass = isEmpty ? 'empty-spool' : (isLow ? 'low-stock' : '');

    const lowBadge   = isLow   ? `<span class="badge badge-warning">⚠️ Low</span>` : '';
    const emptyBadge = isEmpty ? `<span class="badge badge-empty">⬜ Empty</span>` : '';

    const colorHex   = spool.colorHex || '#cccccc';
    const swatchStyle = `background-color: ${colorHex}; --spool-color: ${colorHex};`;

    return `
      <div class="spool-card ${cardClass} spool-card-clickable"
           data-spool-id="${spool.id}"
           style="--spool-color: ${colorHex};">

        <div class="spool-card-header">
          <div>
            <div class="spool-brand">${this.escapeHtml(spool.brand)}</div>
            <div class="spool-name">${this.escapeHtml(spool.name || spool.material)}</div>
            <div class="badge-group">
              <span class="badge badge-material">${this.escapeHtml(spool.material)}</span>
              ${lowBadge}${emptyBadge}
            </div>
          </div>
          <div class="color-swatch" style="${swatchStyle}"></div>
        </div>

        <div class="gauge-section">
          <div class="gauge-labels">
            <span>Remaining</span>
            <strong style="color:${gaugeColor};">${remaining}g · ${pct}%</strong>
          </div>
          <div class="gauge-bar-bg">
            <div class="gauge-bar-fill" style="width:${pct}%; background-color:${gaugeColor};"></div>
          </div>
        </div>

        <div class="spool-specs-grid">
          <div class="spec-item">🌡️ Nozzle: <span>${this.escapeHtml(spool.nozzleTemp || '—')}</span></div>
          <div class="spec-item">🔥 Bed: <span>${this.escapeHtml(spool.bedTemp || '—')}</span></div>
          <div class="spec-item" style="grid-column:span 2;">
            📅 Opened: <span>${this.escapeHtml(spool.unsealedDate || 'Unknown')}</span>
          </div>
        </div>

        <div class="spool-card-actions">
          <span style="font-size:0.75rem; color:var(--text-light);">Click to edit</span>
          <button class="btn btn-danger btn-icon btn-delete-spool"
                  data-spool-id="${spool.id}"
                  title="Delete Spool"
                  onclick="event.stopPropagation()">🗑️</button>
        </div>
      </div>
    `;
  }

  static escapeHtml(str) {
    if (!str) return '';
    return str.toString()
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
}
