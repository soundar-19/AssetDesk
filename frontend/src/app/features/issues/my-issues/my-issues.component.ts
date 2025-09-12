import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IssueService } from '../../../core/services/issue.service';
import { AuthService } from '../../../core/services/auth.service';
import { RoleService } from '../../../core/services/role.service';
import { Issue } from '../../../core/models';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-my-issues',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  template: `
    <div class="my-issues">
      <div class="header">
        <h2>{{ getPageTitle() }}</h2>
      </div>

      <app-data-table
        [data]="issues"
        [columns]="columns"
        [actions]="actions"
        [pagination]="pagination"
        [sortColumn]="sortColumn"
        [sortDirection]="sortDirection"
        [rowClickAction]="openChat.bind(this)"
        (pageChange)="onPageChange($event)"
        (sort)="onSort($event)">
      </app-data-table>
    </div>
  `,
  styles: [`
    .my-issues { padding: 1rem; }
    .header { margin-bottom: 1rem; }
    .header h2 { margin: 0; color: #333; }
  `]
})
export class MyIssuesComponent implements OnInit {
  issues: Issue[] = [];
  pagination: any = null;
  sortColumn = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  columns: TableColumn[] = [
    { key: 'createdAt', label: 'Created', pipe: 'date', sortable: true },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'assetTag', label: 'Asset' },
    { key: 'type', label: 'Type' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' }
  ];

  actions: TableAction[] = [];

  constructor(
    private issueService: IssueService,
    private authService: AuthService,
    private roleService: RoleService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMyIssues();
  }

  loadMyIssues(page: number = 0) {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const request = this.roleService.isEmployee()
        ? this.issueService.getIssuesByReportedBy(currentUser.id, page, 10)
        : this.issueService.getIssuesByAssignedTo(currentUser.id, page, 10);
        
      request.subscribe({
        next: (response) => {
          this.issues = this.sortIssues(response.content);
          this.pagination = response;
        },
        error: () => {
          console.error('Failed to load issues');
        }
      });
    }
  }

  onSort(event: {column: string, direction: 'asc' | 'desc'}) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.issues = this.sortIssues(this.issues);
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

  getPageTitle(): string {
    return this.roleService.isEmployee() ? 'My Reported Issues' : 'My Assigned Issues';
  }

  onPageChange(page: number) {
    this.loadMyIssues(page);
  }

  openChat(issue: Issue) {
    this.router.navigate(['/issues', issue.id, 'chat']);
  }
}