import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyStateComponent } from '../../ui/empty-state.component';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  pipe?: string;
  render?: (item: any) => string;
  badge?: boolean;
}

export interface TableAction {
  label: string | ((item: any) => string);
  icon?: string | ((item: any) => string);
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
              <span *ngIf="!column.render && !column.badge">{{ formatColumnValue(item, column) }}</span>
              <span *ngIf="column.render && !column.badge" [innerHTML]="formatColumnValue(item, column)"></span>
              <span *ngIf="column.badge" 
                    class="badge" 
                    [class]="'badge-' + formatColumnValue(item, column).toLowerCase()">
                {{ formatColumnValue(item, column) }}
              </span>
            </td>
            <td *ngIf="actions.length > 0" class="actions" (click)="$event.stopPropagation()">
              <ng-container *ngIf="singleActionButton; else multipleActions">
                <ng-container *ngFor="let action of getVisibleActions(item)">
                  <button class="action-btn" 
                          [class]="'action-btn ' + getActionClass(action, item)"
                          (click)="executeAction(action, item)">
                    {{ getActionLabel(action, item) }}
                  </button>
                </ng-container>
              </ng-container>
              <ng-template #multipleActions>
                <ng-container *ngIf="getVisibleActions(item).length === 1; else dropdownMenu">
                  <button class="action-btn" 
                          *ngFor="let action of getVisibleActions(item)"
                          (click)="executeAction(action, item)">
                    <span *ngIf="getActionIcon(action, item)" class="action-icon">{{ getActionIcon(action, item) }}</span>
                    {{ getActionLabel(action, item) }}
                  </button>
                </ng-container>
                <ng-template #dropdownMenu>
                  <div class="dropdown-container">
                    <button class="dropdown-btn" 
                            [class.active]="openDropdown === item.id"
                            (click)="toggleDropdown(item.id, $event)">
                      ⋯
                    </button>
                    <div class="dropdown-menu" 
                         *ngIf="openDropdown === item.id">
                      <button *ngFor="let action of getVisibleActions(item)"
                              class="dropdown-item"
                              (click)="executeAction(action, item, $event)">
                        <span *ngIf="getActionIcon(action, item)" class="action-icon">{{ getActionIcon(action, item) }}</span>
                        {{ getActionLabel(action, item) }}
                      </button>
                    </div>
                  </div>
                </ng-template>
              </ng-template>
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
      overflow-y: visible;
      width: 100%;
      padding-right: 1rem;
    }
    
    .table {
      width: 100%;
      min-width: 800px;
      border-collapse: collapse;
      margin: 0;
      table-layout: auto;
      font-size: 0.875rem;
    }
    
    .table th, .table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--gray-100);
      text-align: left;
      vertical-align: middle;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 200px;
    }
    
    .table th:first-child, .table td:first-child {
      padding-left: 1.5rem;
    }
    
    .table th:last-child, .table td:last-child {
      padding-right: 2rem;
    }
    
    .table td.actions {
      overflow: visible;
      position: relative;
      z-index: 1000;
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
      width: 120px;
      text-align: center;
    }
    
    .dropdown-container {
      position: relative;
      display: inline-block;
      z-index: 1001;
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
      border-radius: var(--radius-lg);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      z-index: 10000;
      min-width: 160px;
      overflow: visible;
      margin-top: 4px;
      animation: fadeIn 0.15s ease-out;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .dropdown-item {
      width: 100%;
      padding: var(--space-3) var(--space-4);
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      font-size: var(--text-sm);
      color: var(--gray-700);
      display: flex;
      align-items: center;
      gap: var(--space-2);
      transition: var(--transition-fast);
      font-weight: var(--font-medium);
    }
    
    .dropdown-item:hover {
      background: var(--gray-50);
      color: var(--gray-900);
    }
    
    .dropdown-item:first-child {
      border-top-left-radius: var(--radius-lg);
      border-top-right-radius: var(--radius-lg);
    }
    
    .dropdown-item:last-child {
      border-bottom-left-radius: var(--radius-lg);
      border-bottom-right-radius: var(--radius-lg);
    }
    
    .action-icon {
      font-size: 0.75rem;
      width: 16px;
      text-align: center;
    }
    
    .dropdown-container {
      position: relative;
      display: inline-block;
      z-index: 1001;
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
      border-radius: var(--radius-lg);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      z-index: 10000;
      min-width: 160px;
      overflow: visible;
      margin-top: 4px;
      animation: fadeIn 0.15s ease-out;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .dropdown-item {
      width: 100%;
      padding: var(--space-3) var(--space-4);
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      font-size: var(--text-sm);
      color: var(--gray-700);
      display: flex;
      align-items: center;
      gap: var(--space-2);
      transition: var(--transition-fast);
      font-weight: var(--font-medium);
    }
    
    .dropdown-item:hover {
      background: var(--gray-50);
      color: var(--gray-900);
    }
    
    .dropdown-item:first-child {
      border-top-left-radius: var(--radius-lg);
      border-top-right-radius: var(--radius-lg);
    }
    
    .dropdown-item:last-child {
      border-bottom-left-radius: var(--radius-lg);
      border-bottom-right-radius: var(--radius-lg);
    }
    
    .action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-1-5) var(--space-2-5);
      font-size: var(--text-xs);
      font-weight: 500;
      border-radius: var(--radius-md);
      border: 1px solid transparent;
      cursor: pointer;
      transition: var(--transition-all);
      text-decoration: none;
      white-space: nowrap;
      font-family: var(--font-family);
      width: 90px;
      height: 32px;
    }
    
    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .action-btn.start-work {
      background: var(--success-50);
      color: var(--success-700);
      border-color: var(--success-200);
    }
    
    .action-btn.start-work:hover:not(:disabled) {
      background: var(--success-100);
      border-color: var(--success-300);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    
    .action-btn.resolve {
      background: var(--success-50);
      color: var(--success-700);
      border-color: var(--success-200);
    }
    
    .action-btn.resolve:hover:not(:disabled) {
      background: var(--success-100);
      border-color: var(--success-300);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    
    .action-btn.close {
      background: var(--primary-50);
      color: var(--primary-700);
      border-color: var(--primary-200);
    }
    
    .action-btn.close:hover:not(:disabled) {
      background: var(--primary-100);
      border-color: var(--primary-300);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    
    .action-btn.view {
      background: var(--gray-100);
      color: var(--gray-700);
      border-color: var(--gray-200);
    }
    
    .action-btn.view:hover:not(:disabled) {
      background: var(--gray-200);
      border-color: var(--gray-300);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    
    .action-btn.delete {
      background: var(--error-50);
      color: var(--error-700);
      border-color: var(--error-200);
    }
    
    .action-btn.delete:hover:not(:disabled) {
      background: var(--error-100);
      border-color: var(--error-300);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
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
      padding: 0.75rem 1rem;
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
    
    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }
    
    .badge-available {
      background-color: var(--success-100);
      color: var(--success-700);
    }
    
    .badge-allocated {
      background-color: var(--primary-100);
      color: var(--primary-700);
    }
    
    .badge-maintenance {
      background-color: var(--warning-100);
      color: var(--warning-700);
    }
    
    .badge-retired {
      background-color: var(--gray-100);
      color: var(--gray-700);
    }
    
    .badge-lost {
      background-color: var(--error-100);
      color: var(--error-700);
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
export class DataTableComponent implements OnInit, OnDestroy {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() pagination: any = null;
  @Input() sortColumn: string = '';
  @Input() sortDirection: 'asc' | 'desc' = 'asc';
  @Input() rowClickAction = false;
  @Input() selectable = false;
  @Input() selectedItems: Set<number> = new Set();
  @Input() singleActionButton = false;
  
  @Output() sort = new EventEmitter<{column: string, direction: 'asc' | 'desc'}>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() selectionChange = new EventEmitter<Set<number>>();
  @Output() rowClick = new EventEmitter<any>();
  
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
    
    if (column.pipe === 'currency' && value) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    }
    
    // Handle warranty column fallback
    if (column.key === 'warrantyExpiryDate' && (!value || value === null)) {
      return 'No Warranty';
    }
    
    return value || '';
  }

  getVisibleActions(item: any): TableAction[] {
    const visibleActions = this.actions.filter(action => !action.condition || action.condition(item));
    console.log('Visible actions for item:', item.id, visibleActions);
    return visibleActions;
  }

  onRowClick(item: any) {
    if (this.rowClickAction) {
      this.rowClick.emit(item);
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
  
  toggleDropdown(itemId: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.openDropdown = this.openDropdown === itemId ? null : itemId;
  }
  
  executeAction(action: TableAction, item: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    action.action(item);
    this.openDropdown = null;
  }
  
  ngOnInit() {}
  
  ngOnDestroy() {}
  
  getActionLabel(action: TableAction, item: any): string {
    return typeof action.label === 'function' ? action.label(item) : action.label;
  }

  getActionIcon(action: TableAction, item: any): string {
    if (!action.icon) return '';
    return typeof action.icon === 'function' ? action.icon(item) : action.icon;
  }

  getActionClass(action: TableAction, item: any): string {
    const label = this.getActionLabel(action, item).toLowerCase().replace(' ', '-');
    return label;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.openDropdown = null;
    }
  }
}