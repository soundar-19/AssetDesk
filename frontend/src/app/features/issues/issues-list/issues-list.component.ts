import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IssueService } from '../../../core/services/issue.service';
import { Issue } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-issues-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './issues-list.component.html',
  styleUrls: ['./issues-list.component.css']
})
export class IssuesListComponent implements OnInit {
  issues: Issue[] = [];
  pagination: any = null;
  showClosedIssues = false;
  statusFilter = '';
  sortColumn = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  columns: TableColumn[] = [
    { key: 'createdAt', label: 'Created Date', pipe: 'date', sortable: true },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
    { key: 'assetTag', label: 'Asset' },
    { key: 'reportedByName', label: 'Reported By' },
    { key: 'assignedToName', label: 'Assigned To' }
  ];

  actions: TableAction[] = [
    {
      label: 'View',
      icon: '👁',
      action: (issue) => this.viewIssue(issue.id)
    },

    {
      label: 'Start Work',
      icon: '🔧',
      action: (issue) => this.startWork(issue.id),
      condition: (issue) => issue.status === 'OPEN' && (this.isITSupport() || this.authService.getCurrentUser()?.role === 'ADMIN')
    },
    {
      label: 'Chat',
      icon: '💬',
      action: (issue) => this.openChat(issue.id),
      condition: (issue) => issue.status === 'IN_PROGRESS' && (this.isITSupport() || this.isIssueReporter(issue))
    },
    {
      label: 'Resolve',
      icon: '✅',
      action: (issue) => this.resolveIssue(issue.id),
      condition: (issue) => issue.status === 'IN_PROGRESS' && this.isITSupport()
    },
    {
      label: 'Close',
      icon: '🔒',
      action: (issue) => this.closeIssue(issue.id),
      condition: (issue) => issue.status === 'RESOLVED' && (this.isIssueReporter(issue) || this.isITSupport())
    },
    {
      label: 'Delete',
      icon: '🗑',
      action: (issue) => this.deleteIssue(issue.id),
      condition: () => this.authService.getCurrentUser()?.role === 'ADMIN'
    }
  ];

  constructor(
    private issueService: IssueService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private toastService: ToastService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit() {
    this.loadIssues();
  }

  loadIssues(page: number = 0) {
    const currentUser = this.authService.getCurrentUser();
    let request;
    
    if (this.authService.getCurrentUser()?.role === 'EMPLOYEE') {
      // Employees see only their issues
      request = this.issueService.getIssuesByReportedBy(currentUser?.id || 0, page, 10);
    } else {
      // IT_SUPPORT and ADMIN see all issues
      request = this.showClosedIssues 
        ? this.issueService.getAllIssuesIncludingClosed(page, 10)
        : this.issueService.getAllIssues(page, 10);
    }
      
    request.subscribe({
      next: (response) => {
        let filteredIssues = response.content;
        
        // Apply status filter
        if (this.statusFilter) {
          filteredIssues = filteredIssues.filter(issue => issue.status === this.statusFilter);
        }
        
        this.issues = this.sortIssues(filteredIssues);
        this.pagination = {
          page: response.number || 0,
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0
        };
      },
      error: (error) => {
        console.error('Error loading issues:', error);
        this.issues = [];
        this.pagination = { page: 0, totalPages: 0, totalElements: 0 };
      }
    });
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

  toggleClosedIssues() {
    this.loadIssues();
  }
  
  onStatusFilterChange() {
    this.loadIssues();
  }

  onPageChange(page: number) {
    this.loadIssues(page);
  }

  createIssue() {
    this.router.navigate(['/issues/new']);
  }

  viewIssue(id: number) {
    this.router.navigate(['/issues', id]);
  }

  viewIssueDetails(issue: Issue) {
    if (issue.status === 'IN_PROGRESS' && (this.isITSupport() || this.isIssueReporter(issue))) {
      this.router.navigate(['/issues', issue.id, 'chat']);
    } else {
      this.router.navigate(['/issues', issue.id]);
    }
  }



  startWork(id: number) {
    const currentUser = this.authService.getCurrentUser();
    this.issueService.updateIssueStatus(id, 'IN_PROGRESS', currentUser?.id).subscribe({
      next: () => {
        this.toastService.success('Issue assigned to you and status changed to In Progress');
        // Send notification to issue reporter
        this.issueService.sendIssueNotification(id, 'Issue In Progress', 
          'Your issue is now being worked on by IT Support.', 'ISSUE_UPDATED').subscribe();
        this.loadIssues();
      },
      error: () => {
        this.toastService.error('Failed to start work on issue');
      }
    });
  }

  isITSupport(): boolean {
    return this.authService.getCurrentUser()?.role === 'IT_SUPPORT';
  }

  isIssueReporter(issue: any): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.id === issue.reportedById;
  }

  isAssignedToMe(issue: any): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.id === issue.assignedToId;
  }

  resolveIssue(id: number) {
    const resolutionNotes = prompt('Enter resolution notes:');
    if (resolutionNotes) {
      this.issueService.resolveIssue(id, resolutionNotes).subscribe({
        next: () => {
          this.toastService.success('Issue resolved successfully');
          // Send notification to issue reporter
          this.issueService.sendIssueNotification(id, 'Issue Resolved', 
            `Your issue has been resolved. Resolution: ${resolutionNotes}`, 'ISSUE_RESOLVED').subscribe();
          this.loadIssues();
        },
        error: () => {
          this.toastService.error('Failed to resolve issue');
        }
      });
    }
  }

  openChat(id: number) {
    this.router.navigate(['/issues', id, 'chat']);
  }

  closeIssue(id: number) {
    this.confirmDialog.confirmAction('Close Issue', 'Are you sure you want to close this resolved issue?', 'Close').subscribe(confirmed => {
      if (confirmed) {
        const currentUser = this.authService.getCurrentUser();
        this.issueService.closeIssue(id, currentUser?.id || 0).subscribe({
          next: () => {
            this.toastService.success('Issue closed successfully');
            this.loadIssues();
          },
          error: (error) => {
            this.toastService.error(error.error?.message || 'Failed to close issue');
          }
        });
      }
    });
  }

  deleteIssue(id: number) {
    this.confirmDialog.confirmDelete('issue').subscribe(confirmed => {
      if (confirmed) {
        this.issueService.deleteIssue(id).subscribe({
          next: () => {
            this.toastService.success('Issue deleted successfully');
            this.loadIssues();
          },
          error: () => {
            this.toastService.error('Failed to delete issue');
          }
        });
      }
    });
  }
}