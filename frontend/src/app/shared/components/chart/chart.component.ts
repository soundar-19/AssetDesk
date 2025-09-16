import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ChartData {
  label: string;
  value: number;
  percentage?: number;
}

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart">
      <div *ngFor="let item of chartData" class="chart-item">
        <span class="chart-label">{{ item.label }}</span>
        <div class="chart-bar">
          <div class="bar-fill" [style.width.%]="getPercentage(item)"></div>
        </div>
        <span class="chart-value">{{ item.value }}</span>
      </div>
    </div>
  `,
  styles: [`
    .chart {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .chart-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .chart-label {
      width: 5rem;
      font-size: 0.75rem;
      color: var(--gray-600);
    }
    .chart-bar {
      flex: 1;
      height: 0.5rem;
      background: var(--gray-100);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      background: var(--primary-500);
      border-radius: var(--radius-full);
      transition: width var(--transition-normal);
    }
    .chart-value {
      width: 2rem;
      text-align: right;
      font-weight: 600;
      color: var(--gray-900);
      font-size: 0.75rem;
    }
  `]
})
export class ChartComponent {
  @Input() chartData: ChartData[] = [];

  getPercentage(item: ChartData): number {
    if (item.percentage !== undefined) return item.percentage;
    const total = this.chartData.reduce((sum, d) => sum + d.value, 0);
    return total > 0 ? (item.value / total) * 100 : 0;
  }
}