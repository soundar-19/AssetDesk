import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyStateComponent } from '../../ui/empty-state.component';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  pipe?: string;
  render?: (item: any) => string;
}

export interface TableAction {
  label: string;
  icon?: string;
  action: (item: any) => void;
  condition?: (item: any) => boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent],
  template: `
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th *ngIf="selectable">
              <input type="checkbox" (change)="toggleSelectAll($event)">
            </th>
            <th *ngFor="let column of columns" 
                [class.sortable]="column.sortable"
                (click)="onSort(column)">
              {{ column.label }}
              <span *ngIf="column.sortable && sortColumn === column.key" class="sort-icon">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th *ngIf="actions.length > 0">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of data" 
              [class.clickable]="rowClickAction"
              (click)="onRowClick(item)">
            <td *ngIf="selectable" (click)="$event.stopPropagation()">
              <input type="checkbox" 
                     [checked]="selectedItems.has(item.id)"
                     (change)="toggleSelection(item.id, $event)">
            </td>
            <td *ngFor="let column of columns">
              <span *ngIf="!column.render">{{ formatColumnValue(item, column) }}</span>
              <span *ngIf="column.render" [innerHTML]="formatColumnValue(item, column)"></span>
            </td>
            <td *ngIf="actions.length > 0" class="actions" (click)="$event.stopPropagation()">
              <div class="dropdown-container" (click)="$event.stopPropagation()">
                <button class="dropdown-btn" 
                        (click)="toggleDropdown(item.id)">
                  ⋯
                </button>
                <div class="dropdown-menu" 
                     *ngIf="openDropdown === item.id">
                  <button *ngFor="let action of getVisibleActions(item)"
                          class="dropdown-item"
                          (click)="executeAction(action, item)">
                    <span *ngIf="action.icon" class="action-icon">{{ action.icon }}</span>
                    {{ action.label }}
                  </button>
                </div>
              </div>
            </td>
          </tr>
          <tr *ngIf="data.length === 0">
            <td [attr.colspan]="columns.length + (actions.length > 0 ? 1 : 0)" class="no-data">
              <app-empty-state
                icon="📊"
                title="No data found"
                description="There are no records to display.">
              </app-empty-state>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div *ngIf="pagination" class="pagination">
        <button class="btn" 
                [disabled]="(pagination.page || pagination.number || 0) === 0"
                (click)="onPageChange((pagination.page || pagination.number || 0) - 1)">
          Previous
        </button>
        <span class="page-info">
          Page {{ pagination.totalPages > 0 ? (pagination.page || pagination.number || 0) + 1 : 0 }} of {{ pagination.totalPages || 0 }}
          ({{ pagination.totalElements || 0 }} total)
        </span>
        <button class="btn"
                [disabled]="(pagination.page || pagination.number || 0) >= (pagination.totalPages || 1) - 1"
                (click)="onPageChange((pagination.page || pagination.number || 0) + 1)">
          Next
        </button>
      </div>
    </div>
  `,
  styles: [`
    .table-container {
      background: white;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      overflow-x: auto;
      width: 100%;
    }
    
    .table {
      width: 100%;
      min-width: 800px;
      border-collapse: collapse;
      margin: 0;
      table-layout: fixed;
    }
    
    .table th, .table td {
      padding: var(--space-4) var(--space-6);
      border-bottom: 1px solid var(--gray-100);
      text-align: left;
      vertical-align: middle;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .table th {
      background-color: var(--gray-50);
      font-weight: 600;
      color: var(--gray-900);
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    
    .table td {
      color: var(--gray-700);
      font-size: 0.875rem;
    }
    
    .table tbody tr:hover {
      background-color: var(--gray-25);
    }
    
    .table tbody tr.clickable {
      cursor: pointer;
    }
    
    .table tbody tr.clickable:hover {
      background-color: var(--primary-50);
    }
    
    .sortable {
      cursor: pointer;
      user-select: none;
      transition: background-color var(--transition-fast);
      position: relative;
    }
    
    .sortable:hover {
      background-color: var(--gray-100);
    }
    
    .sort-icon {
      margin-left: var(--space-2);
      color: var(--primary-600);
      font-weight: bold;
    }
    
    .actions {
      width: 60px;
      text-align: center;
    }
    
    .dropdown-container {
      position: relative;
      display: inline-block;
    }
    
    .dropdown-btn {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 18px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--gray-100);
      color: var(--gray-600);
      transition: all 0.2s;
    }
    
    .dropdown-btn:hover,
    .dropdown-btn.active {
      background: var(--gray-200);
      color: var(--gray-800);
    }
    
    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 1px solid var(--gray-200);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      min-width: 150px;
      overflow: hidden;
    }
    
    .dropdown-item {
      width: 100%;
      padding: 8px 12px;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      font-size: 0.875rem;
      color: var(--gray-700);
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background-color 0.15s;
    }
    
    .dropdown-item:hover {
      background: var(--gray-50);
    }
    
    .action-icon {
      font-size: 0.75rem;
      width: 16px;
      text-align: center;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      margin-right: 0.5rem;
      border: 1px solid #d1d5db;
      background: #2563eb;
      color: white;
      cursor: pointer;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.15s ease;
      text-decoration: none;
    }
    
    .btn:hover:not(:disabled) {
      background: #1d4ed8;
      border-color: #9ca3af;
      transform: translateY(-1px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .btn:active {
      transform: translateY(0);
    }
    
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    
    .icon {
      font-size: 0.875rem;
    }
    
    .no-data {
      padding: var(--space-12) var(--space-6);
    }
    
    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-4) var(--space-6);
      background: var(--gray-50);
      border-top: 1px solid var(--gray-200);
    }
    
    .pagination .btn {
      background: var(--gray-600);
      border-color: var(--gray-300);
      color: white;
    }
    
    .pagination .btn:hover:not(:disabled) {
      background: var(--gray-700);
      border-color: var(--gray-400);
    }
    
    .page-info {
      color: var(--gray-600);
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    @media (max-width: 768px) {
      .table-container {
        overflow-x: auto;
      }
      
      .table th, .table td {
        padding: var(--space-3) var(--space-4);
        font-size: 0.75rem;
      }
      
      .pagination {
        flex-direction: column;
        gap: var(--space-3);
      }
    }
  `]
})
export class DataTableComponent {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() pagination: any = null;
  @Input() sortColumn: string = '';
  @Input() sortDirection: 'asc' | 'desc' = 'asc';
  @Input() rowClickAction?: (item: any) => void;
  @Input() selectable = false;
  @Input() selectedItems: Set<number> = new Set();
  
  @Output() sort = new EventEmitter<{column: string, direction: 'asc' | 'desc'}>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() selectionChange = new EventEmitter<Set<number>>();
  
  openDropdown: number | null = null;

  onSort(column: TableColumn) {
    if (!column.sortable) return;
    
    const direction = this.sortColumn === column.key && this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortColumn = column.key;
    this.sortDirection = direction;
    this.sort.emit({ column: column.key, direction });
  }

  onPageChange(page: number) {
    this.pageChange.emit(page);
  }

  getColumnValue(item: any, key: string): any {
    return key.split('.').reduce((obj, prop) => obj?.[prop], item);
  }

  formatColumnValue(item: any, column: TableColumn): any {
    if (column.render) {
      return column.render(item);
    }
    
    const value = this.getColumnValue(item, column.key);
    
    if (column.pipe === 'date' && value) {
      return new Date(value).toLocaleDateString();
    }
    
    return value;
  }

  getVisibleActions(item: any): TableAction[] {
    return this.actions.filter(action => !action.condition || action.condition(item));
  }

  onRowClick(item: any) {
    if (this.rowClickAction) {
      this.rowClickAction(item);
    }
  }
  
  toggleSelection(id: number, event: any) {
    if (event.target.checked) {
      this.selectedItems.add(id);
    } else {
      this.selectedItems.delete(id);
    }
    this.selectionChange.emit(this.selectedItems);
  }
  
  toggleSelectAll(event: any) {
    if (event.target.checked) {
      this.data.forEach(item => this.selectedItems.add(item.id));
    } else {
      this.selectedItems.clear();
    }
    this.selectionChange.emit(this.selectedItems);
  }
  
  toggleDropdown(itemId: number) {
    this.openDropdown = this.openDropdown === itemId ? null : itemId;
    if (this.openDropdown) {
      setTimeout(() => {
        document.addEventListener('click', () => {
          this.openDropdown = null;
        }, { once: true });
      }, 100);
    }
  }
  
  executeAction(action: TableAction, item: any) {
    action.action(item);
    this.openDropdown = null;
  }
}