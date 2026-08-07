import { AMS_SLOTS } from '../data/presets.js';

export class AmsMap {
  static renderAmsView(spools) {
    const slotGroupings = {
      'AMS Unit 1': ['AMS 1 - Slot 1', 'AMS 1 - Slot 2', 'AMS 1 - Slot 3', 'AMS 1 - Slot 4'],
      'AMS Unit 2': ['AMS 2 - Slot 1', 'AMS 2 - Slot 2', 'AMS 2 - Slot 3', 'AMS 2 - Slot 4'],
      'Dryboxes & External': ['External Spool Holder', 'Drybox #1', 'Drybox #2']
    };

    let html = `<div class="ams-container">`;

    for (const [groupName, slots] of Object.entries(slotGroupings)) {
      html += `
        <div class="ams-unit-card">
          <div class="ams-unit-header">
            <div class="ams-unit-title">
              <span>🖨️ ${groupName}</span>
            </div>
            <span class="badge badge-material">${slots.length} Slots</span>
          </div>

          <div class="ams-slots-grid">
      `;

      slots.forEach(slotName => {
        const loadedSpool = spools.find(s => s.location === slotName);
        
        if (loadedSpool) {
          const percentRemaining = Math.round((loadedSpool.remainingWeightG / loadedSpool.initialWeightG) * 100);
          html += `
            <div class="ams-slot-card occupied">
              <div>
                <div class="slot-number">${slotName}</div>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                  <div class="color-swatch" style="width: 24px; height: 24px; background-color: ${loadedSpool.colorHex};"></div>
                  <div>
                    <div style="font-weight: 700; font-size: 0.85rem;">${escapeHtml(loadedSpool.brand)} ${escapeHtml(loadedSpool.material)}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(loadedSpool.colorName || '')}</div>
                  </div>
                </div>
              </div>

              <div style="margin-top: 0.75rem;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.25rem;">
                  <span>${loadedSpool.remainingWeightG}g left</span>
                  <span>${percentRemaining}%</span>
                </div>
                <div class="gauge-bar-bg" style="height: 6px;">
                  <div class="gauge-bar-fill" style="width: ${percentRemaining}%; background-color: ${loadedSpool.colorHex};"></div>
                </div>
                <button class="btn btn-secondary btn-sm assign-slot-btn" data-slot-name="${slotName}" style="width: 100%; margin-top: 0.5rem; font-size: 0.75rem;">
                  Change Spool
                </button>
              </div>
            </div>
          `;
        } else {
          html += `
            <div class="ams-slot-card">
              <div class="slot-number">${slotName}</div>
              <div style="text-align: center; margin: 1.5rem 0; color: var(--text-light); font-size: 0.85rem;">
                Empty Slot
              </div>
              <button class="btn btn-primary btn-sm assign-slot-btn" data-slot-name="${slotName}" style="width: 100%; font-size: 0.75rem;">
                + Load Spool
              </button>
            </div>
          `;
        }
      });

      html += `
          </div>
        </div>
      `;
    }

    html += `</div>`;
    return html;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
