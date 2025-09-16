import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="report-generator">
      <div class="generator-header">
        <h2 class="generator-title">Report Generation</h2>
        <p class="generator-description">Create detailed reports with custom filters and export options</p>
      </div>
      
      <div class="generator-tabs">
        <button 
          *ngFor="let tab of tabs" 
          class="tab-btn" 
          [class.active]="activeTab === tab.id"
          (click)="activeTab = tab.id">
          <span class="tab-icon">{{tab.icon}}</span>
          {{tab.label}}
        </button>
      </div>
      
      <div class="generator-content">
        <!-- Asset Reports Tab -->
        <div *ngIf="activeTab === 'assets'" class="tab-content">
          <div class="content-grid">
            <div class="filters-panel">
              <div class="panel-header">
                <h3>Filters</h3>
                <button class="btn-clear" (click)="clearFilters.emit()" [disabled]="loading">Clear All</button>
              </div>
              <div class="filter-row">
                <select [(ngModel)]="filters.category" (ngModelChange)="onFilterChange.emit()" class="filter-control">
                  <option value="">All Categories</option>
                  <option value="HARDWARE">Hardware</option>
                  <option value="SOFTWARE">Software</option>
                  <option value="ACCESSORIES">Accessories</option>
                </select>
                <select [(ngModel)]="filters.type" (ngModelChange)="onFilterChange.emit()" class="filter-control">
                  <option value="">All Types</option>
                  <option value="LAPTOP">Laptop</option>
                  <option value="DESKTOP">Desktop</option>
                  <option value="MONITOR">Monitor</option>
                  <option value="PRINTER">Printer</option>
                  <option value="LICENSE">License</option>
                </select>
                <select [(ngModel)]="filters.status" (ngModelChange)="onFilterChange.emit()" class="filter-control">
                  <option value="">All Statuses</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="ALLOCATED">Allocated</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="RETIRED">Retired</option>
                </select>
              </div>
              <div class="filter-row">
                <input type="date" [(ngModel)]="filters.dateFrom" (ngModelChange)="onFilterChange.emit()" class="filter-control" placeholder="From Date">
                <input type="date" [(ngModel)]="filters.dateTo" (ngModelChange)="onFilterChange.emit()" class="filter-control" placeholder="To Date">
                <input type="number" [(ngModel)]="filters.costMin" (ngModelChange)="onFilterChange.emit()" class="filter-control" placeholder="Min Cost">
                <input type="number" [(ngModel)]="filters.costMax" (ngModelChange)="onFilterChange.emit()" class="filter-control" placeholder="Max Cost">
              </div>
            </div>
            
            <div class="results-panel">
              <div class="results-info">
                <span class="results-count">{{filteredAssetCount}} assets match your filters</span>
              </div>
              <div class="export-actions">
                <button class="btn btn-outline" (click)="exportToCsv.emit()" [disabled]="loading">
                  📄 Export CSV
                </button>
                <button class="btn btn-primary" (click)="exportToPdf.emit()" [disabled]="loading">
                  📋 Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Service Records Tab -->
        <div *ngIf="activeTab === 'service'" class="tab-content">
          <div class="content-grid">
            <div class="filters-panel">
              <div class="panel-header">
                <h3>Service Filters</h3>
                <button class="btn-clear" (click)="clearServiceFilters.emit()" [disabled]="loading">Clear All</button>
              </div>
              <div class="filter-row">
                <select [(ngModel)]="serviceFilters.type" (ngModelChange)="onServiceFilterChange.emit()" class="filter-control">
                  <option value="">All Types</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="REPAIR">Repair</option>
                  <option value="UPGRADE">Upgrade</option>
                  <option value="INSPECTION">Inspection</option>
                </select>
                <select [(ngModel)]="serviceFilters.dateRange" (ngModelChange)="onServiceFilterChange.emit()" class="filter-control">
                  <option value="">All Time</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              <div class="filter-row">
                <input type="number" [(ngModel)]="serviceFilters.costMin" (ngModelChange)="onServiceFilterChange.emit()" class="filter-control" placeholder="Min Cost">
                <input type="number" [(ngModel)]="serviceFilters.costMax" (ngModelChange)="onServiceFilterChange.emit()" class="filter-control" placeholder="Max Cost">
              </div>
            </div>
            
            <div class="results-panel">
              <div class="results-info">
                <span class="results-count">{{filteredServiceCount}} records match your filters</span>
              </div>
              <div class="export-actions">
                <button class="btn btn-outline" (click)="exportServiceRecords.emit()" [disabled]="loading">
                  📄 Export CSV
                </button>
                <button class="btn btn-primary" (click)="exportServiceRecordsPdf.emit()" [disabled]="loading">
                  📋 Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
        

      </div>
    </div>
  `,
  styles: [`
    .report-generator {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      overflow: hidden;
    }
    
    .generator-header {
      padding: var(--space-5);
      border-bottom: 1px solid var(--gray-200);
      background: var(--gray-25);
    }
    
    .generator-title {
      font-size: var(--text-xl);
      font-weight: var(--font-semibold);
      color: var(--gray-900);
      margin: 0 0 var(--space-1) 0;
    }
    
    .generator-description {
      font-size: var(--text-sm);
      color: var(--gray-600);
      margin: 0;
    }
    
    .generator-tabs {
      display: flex;
      border-bottom: 1px solid var(--gray-200);
      background: var(--gray-50);
    }
    
    .tab-btn {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-4);
      border: none;
      background: transparent;
      color: var(--gray-600);
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      cursor: pointer;
      transition: var(--transition-all);
      border-bottom: 2px solid transparent;
    }
    
    .tab-btn:hover {
      background: var(--gray-100);
      color: var(--gray-900);
    }
    
    .tab-btn.active {
      background: white;
      color: var(--primary-600);
      border-bottom-color: var(--primary-500);
    }
    
    .tab-icon {
      font-size: var(--text-base);
    }
    
    .generator-content {
      padding: var(--space-5);
    }
    
    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--space-6);
      align-items: start;
    }
    
    .filters-panel, .options-panel {
      background: var(--gray-25);
      border-radius: var(--radius-md);
      padding: var(--space-4);
      border: 1px solid var(--gray-200);
    }
    
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-4);
    }
    
    .panel-header h3 {
      font-size: var(--text-base);
      font-weight: var(--font-semibold);
      color: var(--gray-900);
      margin: 0;
    }
    
    .btn-clear {
      background: none;
      border: none;
      color: var(--primary-600);
      font-size: var(--text-xs);
      cursor: pointer;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      transition: var(--transition-all);
    }
    
    .btn-clear:hover:not(:disabled) {
      background: var(--primary-50);
    }
    
    .btn-clear:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .filter-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--space-3);
      margin-bottom: var(--space-3);
    }
    
    .filter-row:last-child {
      margin-bottom: 0;
    }
    
    .filter-control {
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      background: white;
      transition: var(--transition-all);
    }
    
    .filter-control:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px var(--primary-100);
    }
    
    .options-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-3);
    }
    
    .option-item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      cursor: pointer;
      font-size: var(--text-sm);
      color: var(--gray-700);
    }
    
    .option-item input[type="checkbox"] {
      accent-color: var(--primary-500);
    }
    
    .results-panel {
      background: white;
      border-radius: var(--radius-md);
      padding: var(--space-4);
      border: 1px solid var(--gray-200);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    
    .results-info {
      text-align: center;
      padding: var(--space-3);
      background: var(--gray-25);
      border-radius: var(--radius-sm);
    }
    
    .results-count {
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      color: var(--gray-700);
    }
    
    .export-actions {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    
    @media (max-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr;
        gap: var(--space-4);
      }
      
      .generator-tabs {
        flex-wrap: wrap;
      }
      
      .tab-btn {
        flex: 1;
        min-width: 120px;
      }
    }
    
    @media (max-width: 768px) {
      .filter-row {
        grid-template-columns: 1fr;
      }
      
      .export-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ReportGeneratorComponent {
  @Input() loading = false;
  @Input() filteredAssetCount = 0;
  @Input() filteredServiceCount = 0;
  @Input() filters: any = {};
  @Input() serviceFilters: any = {};
  
  @Output() onFilterChange = new EventEmitter<void>();
  @Output() onServiceFilterChange = new EventEmitter<void>();
  @Output() clearFilters = new EventEmitter<void>();
  @Output() clearServiceFilters = new EventEmitter<void>();
  @Output() exportToCsv = new EventEmitter<void>();
  @Output() exportToPdf = new EventEmitter<void>();
  @Output() exportServiceRecords = new EventEmitter<void>();
  @Output() exportServiceRecordsPdf = new EventEmitter<void>();
  
  activeTab = 'assets';
  
  tabs = [
    { id: 'assets', label: 'Asset Reports', icon: '📊' },
    { id: 'service', label: 'Service Records', icon: '🔧' }
  ];
}