import Chart from 'chart.js/auto';

export class AnalyticsView {
  static materialChartInstance = null;
  static brandChartInstance = null;

  static renderAnalyticsContainer() {
    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem;">
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 1.5rem; box-shadow: var(--shadow-card);">
          <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">Material Type Breakdown</h3>
          <div style="height: 300px; position: relative;">
            <canvas id="materialChart"></canvas>
          </div>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 1.5rem; box-shadow: var(--shadow-card);">
          <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">Brand Distribution (Remaining Weight g)</h3>
          <div style="height: 300px; position: relative;">
            <canvas id="brandChart"></canvas>
          </div>
        </div>
      </div>
    `;
  }

  static initializeCharts(spools) {
    if (this.materialChartInstance) {
      this.materialChartInstance.destroy();
    }
    if (this.brandChartInstance) {
      this.brandChartInstance.destroy();
    }

    // Process material distribution
    const materialMap = {};
    const brandMap = {};

    spools.forEach(s => {
      materialMap[s.material] = (materialMap[s.material] || 0) + s.remainingWeightG;
      brandMap[s.brand] = (brandMap[s.brand] || 0) + s.remainingWeightG;
    });

    const materialCanvas = document.getElementById('materialChart');
    if (materialCanvas) {
      this.materialChartInstance = new Chart(materialCanvas, {
        type: 'doughnut',
        data: {
          labels: Object.keys(materialMap),
          datasets: [{
            data: Object.values(materialMap),
            backgroundColor: [
              '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b', '#14b8a6'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }

    const brandCanvas = document.getElementById('brandChart');
    if (brandCanvas) {
      this.brandChartInstance = new Chart(brandCanvas, {
        type: 'bar',
        data: {
          labels: Object.keys(brandMap),
          datasets: [{
            label: 'Remaining Weight (g)',
            data: Object.values(brandMap),
            backgroundColor: '#2563eb',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
            x: { grid: { display: false } }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }
  }
}
