import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IssueService } from '../../../core/services/issue.service';
import { AuthService } from '../../../core/services/auth.service';
import { RoleService } from '../../../core/services/role.service';
import { Issue } from '../../../core/models';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-my-issues',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ getPageTitle() }}</h1>
          <p class="page-description">
            {{ getPageDescription() }}
          </p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="refreshIssues()">
            🔄 Refresh
          </button>
          <button class="btn btn-primary" (click)="createIssue()">
            + New Issue
          </button>
        </div>
      </div>

      <!-- Issue Statistics -->
      <div class="issue-stats">
        <div class="stats-grid">
          <div class="stat-card open">
            <div class="stat-icon">🔓</div>
            <div class="stat-content">
              <div class="stat-value">{{ getIssueCount('OPEN') }}</div>
              <div class="stat-label">Open</div>
            </div>
          </div>
          <div class="stat-card in-progress">
            <div class="stat-icon">⚙️</div>
            <div class="stat-content">
              <div class="stat-value">{{ getIssueCount('IN_PROGRESS') }}</div>
              <div class="stat-label">In Progress</div>
            </div>
          </div>
          <div class="stat-card resolved">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-value">{{ getIssueCount('RESOLVED') }}</div>
              <div class="stat-label">Resolved</div>
            </div>
          </div>
          <div class="stat-card closed">
            <div class="stat-icon">🔒</div>
            <div class="stat-content">
              <div class="stat-value">{{ getIssueCount('CLOSED') }}</div>
              <div class="stat-label">Closed</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Section with Filters -->
      <div class="table-section">
        <!-- Filters -->
        <div class="filters-section">
          <div class="filters">
            <select class="form-select" [(ngModel)]="statusFilter" (change)="applyFilters()">
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            
            <select class="form-select" [(ngModel)]="priorityFilter" (change)="applyFilters()">
              <option value="">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            
            <select class="form-select" [(ngModel)]="typeFilter" (change)="applyFilters()">
              <option value="">All Types</option>
              <option value="HARDWARE">Hardware</option>
              <option value="SOFTWARE">Software</option>
              <option value="NETWORK">Network</option>
              <option value="ACCESS">Access</option>
              <option value="OTHER">Other</option>
            </select>
            
            <input type="text" 
                   class="form-control" 
                   placeholder="Search issues..." 
                   [(ngModel)]="searchTerm"
                   (input)="onSearchChange()">
          </div>
          
          <div class="filter-actions">
            <button class="btn btn-outline btn-sm" (click)="clearFilters()" *ngIf="hasActiveFilters()">
              Clear Filters
            </button>
          </div>
        </div>

        <!-- Issues Table -->
        <div class="issues-table" *ngIf="!loading && filteredIssues.length > 0" style="overflow: visible;">
          <app-data-table
            [data]="filteredIssues"
            [columns]="columns"
            [actions]="actions"
            [pagination]="pagination"
            [sortColumn]="sortColumn"
            [sortDirection]="sortDirection"
            [rowClickAction]="true"
            [singleActionButton]="true"
            (rowClick)="viewIssueDetail($event)"
            (pageChange)="onPageChange($event)"
            (sort)="onSort($event)">
          </app-data-table>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && filteredIssues.length === 0" class="empty-state">
          <div class="empty-icon">🎫</div>
          <h3>No issues found</h3>
          <p *ngIf="hasActiveFilters()">No issues match your current filters.</p>
          <p *ngIf="!hasActiveFilters() && roleService.isEmployee()">You haven't reported any issues yet.</p>
          <p *ngIf="!hasActiveFilters() && !roleService.isEmployee()">No issues have been assigned to you yet.</p>
          <button class="btn btn-primary" (click)="createIssue()" *ngIf="!hasActiveFilters()">
            {{ roleService.isEmployee() ? 'Report Your First Issue' : 'Create First Issue' }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading issues...</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: var(--container-xl);
      margin: 0 auto;
      padding: var(--space-6);
      min-height: 100vh;
      box-sizing: border-box;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-6);
      padding: var(--space-6);
      background: white;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      gap: var(--space-4);
    }
    .page-title {
      font-size: var(--text-2xl);
      font-weight: var(--font-bold);
      color: var(--gray-900);
      margin: 0 0 var(--space-1) 0;
      line-height: var(--leading-tight);
    }
    .page-description {
      color: var(--gray-600);
      margin: 0;
      font-size: var(--text-sm);
      line-height: var(--leading-relaxed);
    }
    .header-actions {
      display: flex;
      gap: var(--space-3);
      align-items: center;
      flex-shrink: 0;
    }
    .issue-stats {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      padding: var(--space-4);
      margin-bottom: var(--space-4);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--space-3);
    }
    .stat-card {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3);
      border-radius: var(--radius-md);
      transition: var(--transition-all);
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .stat-card.open {
      background: linear-gradient(135deg, var(--warning-25) 0%, var(--warning-50) 100%);
      border: 1px solid var(--warning-200);
    }
    .stat-card.in-progress {
      background: linear-gradient(135deg, var(--info-25) 0%, var(--info-50) 100%);
      border: 1px solid var(--info-200);
    }
    .stat-card.resolved {
      background: linear-gradient(135deg, var(--success-25) 0%, var(--success-50) 100%);
      border: 1px solid var(--success-200);
    }
    .stat-card.closed {
      background: linear-gradient(135deg, var(--gray-25) 0%, var(--gray-50) 100%);
      border: 1px solid var(--gray-200);
    }
    .stat-icon {
      font-size: var(--text-xl);
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.8);
      border-radius: var(--radius-lg);
      backdrop-filter: blur(10px);
    }
    .stat-content {
      flex: 1;
      min-width: 0;
    }
    .stat-value {
      font-size: var(--text-2xl);
      font-weight: var(--font-bold);
      color: var(--gray-900);
      line-height: var(--leading-tight);
      margin-bottom: var(--space-0-5);
    }
    .stat-label {
      color: var(--gray-600);
      font-size: var(--text-xs);
      font-weight: var(--font-medium);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      line-height: var(--leading-tight);
    }
    .table-section {
      background: white;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      overflow: hidden;
    }
    .filters-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-4);
      background: var(--gray-25);
      border-bottom: 1px solid var(--gray-200);
      gap: var(--space-4);
    }
    .filters {
      display: flex;
      gap: var(--space-3);
      flex: 1;
      align-items: center;
      flex-wrap: nowrap;
    }
    .form-select, .form-control {
      flex: 1;
      min-width: 120px;
      padding: var(--space-3);
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      background: white;
      transition: var(--transition-all);
      font-family: inherit;
    }
    .form-control {
      flex: 1.5;
      min-width: 150px;
    }
    .filter-actions {
      display: flex;
      gap: var(--space-2);
      flex-shrink: 0;
    }
    .issues-table {
      background: white;
      overflow-x: auto;
    }
    .empty-state {
      text-align: center;
      padding: var(--space-16);
      color: var(--gray-600);
      background: white;
    }
    .empty-icon {
      font-size: var(--text-5xl);
      margin-bottom: var(--space-4);
      opacity: 0.6;
    }
    .empty-state h3 {
      margin: 0 0 var(--space-2) 0;
      color: var(--gray-900);
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
    }
    .empty-state p {
      margin: 0 0 var(--space-6) 0;
      color: var(--gray-600);
      font-size: var(--text-sm);
      line-height: var(--leading-relaxed);
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }
    .loading-state {
      text-align: center;
      padding: var(--space-16);
      color: var(--gray-600);
      background: white;
    }
    .loading-spinner {
      width: var(--space-8);
      height: var(--space-8);
      border: 3px solid var(--gray-200);
      border-top: 3px solid var(--primary-600);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto var(--space-4);
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .btn {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: var(--font-medium);
      font-size: var(--text-sm);
      cursor: pointer;
      transition: var(--transition-all);
      border: 1px solid transparent;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      white-space: nowrap;
      font-family: inherit;
      line-height: var(--leading-tight);
    }
    .btn-sm {
      padding: var(--space-2) var(--space-3);
      font-size: var(--text-xs);
      gap: var(--space-1-5);
    }
    .btn-primary {
      background: var(--primary-600);
      color: white;
      border-color: var(--primary-600);
      box-shadow: var(--shadow-xs);
    }
    .btn-primary:hover:not(:disabled) {
      background: var(--primary-700);
      border-color: var(--primary-700);
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }
    .btn-outline {
      background: white;
      color: var(--gray-700);
      border-color: var(--gray-300);
      box-shadow: var(--shadow-xs);
    }
    .btn-outline:hover:not(:disabled) {
      background: var(--gray-50);
      border-color: var(--gray-400);
      color: var(--gray-900);
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }
    @media (max-width: 768px) {
      .page-container {
        padding: var(--space-3);
      }
      .page-header {
        flex-direction: column;
        gap: var(--space-4);
        align-items: stretch;
        padding: var(--space-4);
      }
      .header-actions {
        justify-content: stretch;
        flex-wrap: wrap;
      }
      .header-actions .btn {
        flex: 1;
        min-width: 0;
      }
      .filters-section {
        flex-direction: column;
        gap: var(--space-3);
        align-items: stretch;
      }
      .filters {
        flex-direction: column;
        gap: var(--space-2);
      }
      .form-select, .form-control {
        min-width: auto;
        width: 100%;
      }
      .stats-grid {
        grid-template-columns: 1fr;
        gap: var(--space-3);
      }
    }
  `]
})
export class MyIssuesComponent implements OnInit {
  loading = true;
  issues: Issue[] = [];
  filteredIssues: Issue[] = [];
  pagination: any = null;
  sortColumn = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Filters
  statusFilter = '';
  priorityFilter = '';
  typeFilter = '';
  searchTerm = '';
  searchTimeout: any;
  
  columns: TableColumn[] = [
    { key: 'createdAt', label: 'Created', pipe: 'date', sortable: true },
    { key: 'title', label: 'Title', sortable: true, render: (issue: Issue) => this.truncateText(issue.title, 30) },
    { key: 'assetTag', label: 'Asset' },
    { key: 'type', label: 'Type' },
    { key: 'priority', label: 'Priority', render: (issue: Issue) => this.getPriorityBadge(issue.priority) },
    { key: 'status', label: 'Status', render: (issue: Issue) => this.getStatusBadge(issue.status) },
    { key: 'assignedToName', label: 'Assigned To', render: (issue: Issue) => issue.assignedToName || 'Unassigned' }
  ];

  actions: TableAction[] = [
    {
      label: (issue) => {
        if (this.canDeleteIssue(issue)) {
          return 'Delete';
        }
        return 'View';
      },
      icon: (issue) => {
        if (this.canDeleteIssue(issue)) {
          return '🗑';
        }
        return '👁️';
      },
      action: (issue) => {
        if (this.canDeleteIssue(issue)) {
          this.deleteIssue(issue.id);
        } else {
          this.viewIssueDetail(issue);
        }
      },
      condition: () => true
    }
  ];

  constructor(
    private issueService: IssueService,
    private authService: AuthService,
    public roleService: RoleService,
    private router: Router,
    private confirmDialog: ConfirmDialogService
  ) {}

  canDeleteIssue(issue: Issue): boolean {
    const currentUser = this.authService.getCurrentUser();
    const canDelete = currentUser?.role === 'ADMIN' || 
           (currentUser?.id === issue.reportedById && issue.status === 'OPEN');
    console.log('Can delete issue:', issue.id, 'User:', currentUser?.id, 'Reporter:', issue.reportedById, 'Status:', issue.status, 'Result:', canDelete);
    return canDelete;
  }

  deleteIssue(id: number) {
    console.log('Delete issue called with ID:', id);
    this.confirmDialog.confirmDelete('issue').subscribe(confirmed => {
      if (confirmed) {
        this.issueService.deleteIssue(id).subscribe({
          next: () => {
            console.log('Issue deleted successfully');
            this.loadMyIssues();
          },
          error: (error) => {
            console.error('Failed to delete issue:', error);
          }
        });
      }
    });
  }

  ngOnInit() {
    this.loadMyIssues();
  }

  loadMyIssues(page: number = 0) {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const request = this.roleService.isEmployee()
        ? this.issueService.getIssuesByReportedBy(currentUser.id, page, 10)
        : this.issueService.getIssuesByAssignedTo(currentUser.id, page, 10);
        
      request.subscribe({
        next: (response) => {
          this.issues = this.sortIssues(response.content);
          this.applyFilters();
          this.pagination = response;
          this.loading = false;
        },
        error: () => {
          console.error('Failed to load issues');
          this.issues = [];
          this.filteredIssues = [];
          this.loading = false;
        }
      });
    }
  }

  onSort(event: {column: string, direction: 'asc' | 'desc'}) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.issues = this.sortIssues(this.issues);
    this.applyFilters();
  }

  private sortIssues(issues: Issue[]): Issue[] {
    return [...issues].sort((a, b) => {
      const aValue = this.getColumnValue(a, this.sortColumn);
      const bValue = this.getColumnValue(b, this.sortColumn);
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      let comparison = 0;
      if (this.sortColumn === 'createdAt') {
        comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }
      
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  private getColumnValue(item: any, key: string): any {
    return key.split('.').reduce((obj, prop) => obj?.[prop], item);
  }

  applyFilters() {
    this.filteredIssues = this.issues.filter(issue => {
      // Status filter
      if (this.statusFilter && issue.status !== this.statusFilter) {
        return false;
      }
      
      // Priority filter
      if (this.priorityFilter && issue.priority !== this.priorityFilter) {
        return false;
      }
      
      // Type filter
      if (this.typeFilter && issue.type !== this.typeFilter) {
        return false;
      }
      
      // Search filter
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        const matchesTitle = issue.title.toLowerCase().includes(searchLower);
        const matchesAsset = issue.assetTag?.toLowerCase().includes(searchLower);
        const matchesDescription = issue.description?.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesAsset && !matchesDescription) {
          return false;
        }
      }
      
      return true;
    });
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  hasActiveFilters(): boolean {
    return !!(this.statusFilter || this.priorityFilter || this.typeFilter || this.searchTerm);
  }

  clearFilters() {
    this.statusFilter = '';
    this.priorityFilter = '';
    this.typeFilter = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  getIssueCount(status: string): number {
    return this.issues.filter(issue => issue.status === status).length;
  }

  getPriorityBadge(priority: string): string {
    const badges: { [key: string]: string } = {
      'URGENT': '<span class="badge badge-error">Urgent</span>',
      'HIGH': '<span class="badge badge-warning">High</span>',
      'MEDIUM': '<span class="badge badge-info">Medium</span>',
      'LOW': '<span class="badge badge-success">Low</span>'
    };
    return badges[priority] || `<span class="badge badge-secondary">${priority}</span>`;
  }

  getStatusBadge(status: string): string {
    const badges: { [key: string]: string } = {
      'OPEN': '<span class="badge badge-warning">Open</span>',
      'IN_PROGRESS': '<span class="badge badge-info">In Progress</span>',
      'RESOLVED': '<span class="badge badge-success">Resolved</span>',
      'CLOSED': '<span class="badge badge-secondary">Closed</span>'
    };
    return badges[status] || `<span class="badge badge-secondary">${status}</span>`;
  }

  getPageTitle(): string {
    return this.roleService.isEmployee() ? 'My Reported Issues' : 'My Assigned Issues';
  }

  getPageDescription(): string {
    return this.roleService.isEmployee() 
      ? 'Issues you have reported to IT support'
      : 'Issues assigned to you for resolution';
  }

  refreshIssues() {
    this.loadMyIssues();
  }

  createIssue() {
    this.router.navigate(['/issues/new']);
  }

  onPageChange(page: number) {
    this.loadMyIssues(page);
  }

  viewIssueDetail(issue: Issue) {
    this.router.navigate(['/issues', issue.id]);
  }

  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}