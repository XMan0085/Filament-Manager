export class PrintLogger {
  static renderPrintHistoryTable(prints) {
    if (!prints || prints.length === 0) {
      return `
        <div style="text-align: center; padding: 3rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🖨️</div>
          <p>No print jobs logged yet. Log your first print to automatically track spool weight usage!</p>
        </div>
      `;
    }

    let rowsHtml = prints.map(print => `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding: 0.85rem; font-weight: 600;">${escapeHtml(print.date)}</td>
        <td style="padding: 0.85rem; font-weight: 700; color: var(--text-main);">${escapeHtml(print.printName)}</td>
        <td style="padding: 0.85rem;">
          <span class="badge badge-material">${escapeHtml(print.spoolName || 'Selected Spool')}</span>
        </td>
        <td style="padding: 0.85rem; font-weight: 700; color: var(--accent-red);">- ${print.weightUsedG} g</td>
        <td style="padding: 0.85rem; color: var(--text-muted);">${escapeHtml(print.printTime || 'N/A')}</td>
        <td style="padding: 0.85rem; color: var(--text-muted); font-size: 0.85rem;">${escapeHtml(print.notes || '-')}</td>
        <td style="padding: 0.85rem; text-align: right;">
          <button class="btn btn-secondary btn-sm delete-print-btn" data-print-id="${print.id}" style="color: var(--accent-red);">
            🗑️ Delete
          </button>
        </td>
      </tr>
    `).join('');

    return `
      <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-card);">
        <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
          <h3 style="font-size: 1.1rem; font-weight: 700;">Print Usage History</h3>
          <span class="badge badge-location">${prints.length} Logged Prints</span>
        </div>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
            <thead>
              <tr style="background: var(--bg-subtle); color: var(--text-muted); font-size: 0.775rem; text-transform: uppercase; letter-spacing: 0.05em;">
                <th style="padding: 0.85rem;">Date</th>
                <th style="padding: 0.85rem;">Print Job Name</th>
                <th style="padding: 0.85rem;">Spool Used</th>
                <th style="padding: 0.85rem;">Weight Used</th>
                <th style="padding: 0.85rem;">Print Duration</th>
                <th style="padding: 0.85rem;">Notes</th>
                <th style="padding: 0.85rem; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
