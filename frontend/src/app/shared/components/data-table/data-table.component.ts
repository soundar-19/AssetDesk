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
              <button *ngFor="let action of getVisibleActions(item)"
                      class="btn btn-sm"
                      (click)="action.action(item)">
                <span *ngIf="action.icon" class="icon">{{ action.icon }}</span>
                {{ action.label }}
              </button>
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
      overflow: hidden;
    }
    
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
    }
    
    .table th, .table td {
      padding: var(--space-4) var(--space-6);
      border-bottom: 1px solid var(--gray-100);
      text-align: left;
      vertical-align: middle;
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
      white-space: nowrap;
    }
    
    .btn {
      padding: var(--space-2) var(--space-4);
      margin-right: var(--space-2);
      border: 1px solid var(--primary-200);
      background: var(--primary-600);
      color: white;
      cursor: pointer;
      border-radius: var(--radius-md);
      font-size: 0.75rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      transition: all var(--transition-fast);
      text-decoration: none;
    }
    
    .btn:hover:not(:disabled) {
      background: var(--primary-700);
      border-color: var(--primary-300);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
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
}