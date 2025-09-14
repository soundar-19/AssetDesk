import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface SearchFilters {
  [key: string]: any;
}

@Component({
  selector: 'app-search-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-filter-container">
      <div class="search-bar">
        <div class="search-input-group">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
          </svg>
          <input 
            type="text" 
            class="search-input"
            [placeholder]="searchPlaceholder"
            [(ngModel)]="searchTerm"
            (input)="onSearchChange()"
            (keyup.enter)="onSearch()">
          <button 
            *ngIf="searchTerm" 
            class="clear-btn"
            (click)="clearSearch()"
            type="button">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
            </svg>
          </button>
        </div>
        <button 
          class="filter-toggle-btn"
          (click)="toggleFilters()"
          [class.active]="showFilters">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"/>
          </svg>
          Filters
          <span *ngIf="activeFiltersCount > 0" class="filter-count">{{ activeFiltersCount }}</span>
        </button>
      </div>

      <div class="filters-panel" [class.show]="showFilters">
        <div class="filters-grid">
          <div *ngFor="let filter of filterOptions" class="filter-item">
            <label [for]="filter.key" class="filter-label">{{ filter.label }}</label>
            
            <input 
              *ngIf="filter.type === 'text'"
              [id]="filter.key"
              type="text"
              class="filter-input"
              [placeholder]="filter.placeholder || ''"
              [(ngModel)]="filters[filter.key]"
              (input)="onFilterChange()">
            
            <input 
              *ngIf="filter.type === 'date'"
              [id]="filter.key"
              type="date"
              class="filter-input"
              [(ngModel)]="filters[filter.key]"
              (change)="onFilterChange()">
            
            <select 
              *ngIf="filter.type === 'select'"
              [id]="filter.key"
              class="filter-select"
              [(ngModel)]="filters[filter.key]"
              (change)="onFilterChange()">
              <option value="">All {{ filter.label }}</option>
              <option *ngFor="let option of filter.options" [value]="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="filters-actions">
          <button class="btn btn-outline btn-sm" (click)="clearFilters()">
            Clear All
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-filter-container {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      margin-bottom: var(--space-6);
    }

    .search-bar {
      display: flex;
      gap: var(--space-3);
      padding: var(--space-4);
      align-items: center;
    }

    .search-input-group {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: var(--space-3);
      color: var(--gray-400);
      z-index: 1;
    }

    .search-input {
      width: 100%;
      padding: var(--space-3) var(--space-10) var(--space-3) var(--space-10);
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      transition: all var(--transition-fast);
    }

    .search-input:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px var(--primary-100);
    }

    .clear-btn {
      position: absolute;
      right: var(--space-3);
      background: none;
      border: none;
      color: var(--gray-400);
      cursor: pointer;
      padding: var(--space-1);
      border-radius: var(--radius-sm);
      transition: color var(--transition-fast);
    }

    .clear-btn:hover {
      color: var(--gray-600);
    }

    .filter-toggle-btn {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-4);
      border: 1px solid var(--gray-300);
      background: white;
      color: var(--gray-700);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
      position: relative;
    }

    .filter-toggle-btn:hover {
      background: var(--gray-50);
      border-color: var(--gray-400);
    }

    .filter-toggle-btn.active {
      background: var(--primary-50);
      border-color: var(--primary-300);
      color: var(--primary-700);
    }

    .filter-count {
      background: var(--primary-600);
      color: white;
      font-size: 0.75rem;
      padding: 2px 6px;
      border-radius: var(--radius-full);
      min-width: 18px;
      text-align: center;
    }

    .filters-panel {
      border-top: 1px solid var(--gray-200);
      padding: 0;
      max-height: 0;
      overflow: hidden;
      transition: all var(--transition-normal);
    }

    .filters-panel.show {
      padding: var(--space-4);
      max-height: 500px;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-4);
      margin-bottom: var(--space-4);
    }

    .filter-item {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .filter-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--gray-700);
    }

    .filter-input,
    .filter-select {
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      transition: border-color var(--transition-fast);
    }

    .filter-input:focus,
    .filter-select:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px var(--primary-100);
    }

    .filters-actions {
      display: flex;
      gap: var(--space-3);
      justify-content: flex-end;
      padding-top: var(--space-4);
      border-top: 1px solid var(--gray-200);
    }

    .btn {
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
      border: 1px solid transparent;
    }

    .btn-outline {
      background: white;
      border-color: var(--gray-300);
      color: var(--gray-700);
    }

    .btn-outline:hover {
      background: var(--gray-50);
      border-color: var(--gray-400);
    }

    .btn-primary {
      background: var(--primary-600);
      color: white;
    }

    .btn-primary:hover {
      background: var(--primary-700);
    }

    .btn-sm {
      padding: var(--space-2) var(--space-3);
      font-size: 0.75rem;
    }

    @media (max-width: 768px) {
      .search-bar {
        flex-direction: column;
        gap: var(--space-3);
      }

      .filters-grid {
        grid-template-columns: 1fr;
      }

      .filters-actions {
        flex-direction: column;
      }
    }
  `]
})
export class SearchFilterComponent implements OnInit {
  @Input() searchPlaceholder = 'Search...';
  @Input() filterOptions: FilterOption[] = [];
  @Input() initialFilters: SearchFilters = {};
  
  @Output() search = new EventEmitter<string>();
  @Output() filtersChange = new EventEmitter<SearchFilters>();

  searchTerm = '';
  filters: SearchFilters = {};
  showFilters = false;
  activeFiltersCount = 0;

  ngOnInit() {
    this.filters = { ...this.initialFilters };
    this.updateActiveFiltersCount();
  }

  onSearchChange() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.onSearch();
    }, 300);
  }

  private searchTimeout: any;

  onSearch() {
    this.search.emit(this.searchTerm);
  }

  clearSearch() {
    this.searchTerm = '';
    this.onSearch();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  onFilterChange() {
    this.updateActiveFiltersCount();
    this.applyFilters();
  }

  applyFilters() {
    this.filtersChange.emit({ ...this.filters });
  }

  clearFilters() {
    this.filters = {};
    this.updateActiveFiltersCount();
    this.applyFilters();
  }

  private updateActiveFiltersCount() {
    this.activeFiltersCount = Object.values(this.filters)
      .filter(value => value !== null && value !== undefined && value !== '').length;
  }
}