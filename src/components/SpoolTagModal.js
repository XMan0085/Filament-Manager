export class SpoolTagModal {
  static renderTag(spool) {
    if (!spool) return '';

    return `
      <div id="printable-tag-area" class="printable-tag-card">
        <div class="tag-header">
          <div>
            <div style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">${escapeHtml(spool.brand)}</div>
            <div class="tag-title">${escapeHtml(spool.material)} - ${escapeHtml(spool.colorName || 'Default')}</div>
          </div>
          <div class="color-swatch" style="width: 44px; height: 44px; background-color: ${spool.colorHex}; border: 2px solid #000;"></div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; font-size: 0.85rem; margin: 0.75rem 0;">
          <div><strong>Nozzle Temp:</strong> ${escapeHtml(spool.nozzleTemp || '200-220°C')}</div>
          <div><strong>Bed Temp:</strong> ${escapeHtml(spool.bedTemp || '55-65°C')}</div>
          <div><strong>Net Weight:</strong> ${spool.initialWeightG}g</div>
          <div><strong>Location:</strong> ${escapeHtml(spool.location || 'Storage')}</div>
          <div><strong>Tare Weight:</strong> ${spool.tareWeightG || 200}g</div>
          <div><strong>Opened:</strong> ${escapeHtml(spool.unsealedDate || 'N/A')}</div>
        </div>

        <div class="barcode-simulated">
          ||||| ||| |||| || |||||| |||| | |||
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700;">
          <span>ID: ${escapeHtml(spool.id)}</span>
          <span>TAG: ${escapeHtml(spool.qrCode || 'SPOOL-TAG')}</span>
        </div>
      </div>
    `;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
