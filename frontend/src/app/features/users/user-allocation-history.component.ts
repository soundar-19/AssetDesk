import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AllocationService } from '../../core/services/allocation.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-user-allocation-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="allocation-history-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <div class="breadcrumb">
              <button class="btn-back" (click)="goBack()">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                </svg>
                Back to User
              </button>
            </div>
            <h1 class="page-title">Allocation History</h1>
            <p class="page-description" *ngIf="user">{{ user.name }} • Asset allocation timeline</p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="content-section">
        <div class="history-card" *ngIf="allocations.length > 0">
          <div class="card-header">
            <h3>Asset Allocation Timeline</h3>
          </div>
          <div class="timeline">
            <div class="timeline-item" *ngFor="let allocation of allocations">
              <div class="timeline-marker" [class]="getStatusClass(allocation.status)"></div>
              <div class="timeline-content">
                <div class="allocation-header">
                  <h4 class="asset-name">{{ allocation.assetTag }}</h4>
                  <span class="status-badge" [class]="'badge-' + allocation.status.toLowerCase()">{{ allocation.status }}</span>
                </div>
                <p class="allocation-details">{{ allocation.assetName }}</p>
                <div class="allocation-dates">
                  <span class="date-item">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                    </svg>
                    Allocated: {{ allocation.allocationDate | date:'mediumDate' }}
                  </span>
                  <span class="date-item" *ngIf="allocation.returnDate">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                    </svg>
                    Returned: {{ allocation.returnDate | date:'mediumDate' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="allocations.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="empty-title">No allocation history</h3>
          <p class="empty-description">This user has no asset allocation history yet.</p>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading allocation history...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .allocation-history-container {
      padding: var(--space-6);
      max-width: 1200px;
      margin: 0 auto;
      background: var(--gray-50);
      min-height: 100vh;
    }

    .page-header {
      background: white;
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      margin-bottom: var(--space-6);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-4);
    }

    .title-section {
      display: flex;
      flex-direction: column;
    }

    .breadcrumb {
      margin-bottom: var(--space-3);
    }

    .btn-back {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      background: var(--gray-100);
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      color: var(--gray-700);
      font-size: var(--text-sm);
      cursor: pointer;
      transition: var(--transition-fast);
    }

    .btn-back:hover {
      background: var(--gray-200);
    }

    .page-title {
      font-size: var(--text-2xl);
      font-weight: var(--font-bold);
      color: var(--gray-900);
      margin: 0 0 var(--space-1-5) 0;
      line-height: var(--leading-tight);
    }

    .page-description {
      color: var(--gray-600);
      font-size: var(--text-base);
      margin: 0;
      line-height: 1.5;
    }

    .content-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .history-card {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
    }

    .card-header {
      padding: var(--space-6) var(--space-6) 0 var(--space-6);
      border-bottom: 1px solid var(--gray-200);
      margin-bottom: var(--space-6);
    }

    .card-header h3 {
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
      color: var(--gray-900);
      margin: 0;
      padding-bottom: var(--space-4);
    }

    .timeline {
      padding: 0 var(--space-6) var(--space-6) var(--space-6);
      position: relative;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: calc(var(--space-6) + 8px);
      top: 0;
      bottom: var(--space-6);
      width: 2px;
      background: var(--gray-200);
    }

    .timeline-item {
      display: flex;
      gap: var(--space-4);
      margin-bottom: var(--space-6);
      position: relative;
    }

    .timeline-item:last-child {
      margin-bottom: 0;
    }

    .timeline-marker {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: var(--shadow-sm);
      flex-shrink: 0;
      z-index: 1;
      background: var(--success-500);
    }

    .timeline-content {
      flex: 1;
      background: var(--gray-25);
      border-radius: var(--radius-md);
      padding: var(--space-4);
      border: 1px solid var(--gray-100);
    }

    .allocation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-2);
    }

    .asset-name {
      font-size: var(--text-base);
      font-weight: var(--font-semibold);
      color: var(--gray-900);
      margin: 0;
    }

    .status-badge {
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      font-weight: var(--font-medium);
      text-transform: uppercase;
      background: var(--success-100);
      color: var(--success-700);
    }

    .allocation-details {
      color: var(--gray-600);
      font-size: var(--text-sm);
      margin: 0 0 var(--space-3) 0;
    }

    .allocation-dates {
      display: flex;
      gap: var(--space-4);
      flex-wrap: wrap;
    }

    .date-item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-xs);
      color: var(--gray-500);
    }

    .empty-state, .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-16);
      text-align: center;
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
    }

    .empty-icon {
      color: var(--gray-400);
      margin-bottom: var(--space-4);
    }

    .empty-title {
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
      color: var(--gray-900);
      margin: 0 0 var(--space-2) 0;
    }

    .empty-description {
      color: var(--gray-600);
      font-size: var(--text-sm);
      margin: 0;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--gray-200);
      border-top: 3px solid var(--primary-500);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: var(--space-4);
    }

    .loading-text {
      color: var(--gray-600);
      font-size: var(--text-sm);
      margin: 0;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .allocation-history-container {
        padding: var(--space-4);
      }

      .page-header {
        padding: var(--space-4);
      }

      .allocation-dates {
        flex-direction: column;
        gap: var(--space-2);
      }

      .timeline::before {
        left: calc(var(--space-4) + 8px);
      }

      .timeline {
        padding: 0 var(--space-4) var(--space-4) var(--space-4);
      }
    }

    @media (max-width: 480px) {
      .allocation-history-container {
        padding: var(--space-3);
      }

      .page-header {
        padding: var(--space-3);
      }

      .page-title {
        font-size: var(--text-xl);
      }

      .allocation-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-2);
      }
    }
  `]
})
export class UserAllocationHistoryComponent implements OnInit {
  userId: string | null = null;
  user: User | null = null;
  allocations: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private allocationService: AllocationService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.loadUser(+this.userId);
      this.loadAllocationHistory(+this.userId);
    }
  }

  loadUser(id: number) {
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (error) => {
        console.error('Failed to load user:', error);
      }
    });
  }

  loadAllocationHistory(userId: number) {
    this.loading = true;
    // Mock data for now since service might not exist
    setTimeout(() => {
      this.allocations = [
        {
          assetTag: 'LT-001',
          assetName: 'Dell Laptop XPS 13',
          status: 'ALLOCATED',
          allocationDate: new Date('2024-01-15'),
          returnDate: null
        },
        {
          assetTag: 'KB-045',
          assetName: 'Wireless Keyboard',
          status: 'RETURNED',
          allocationDate: new Date('2023-12-01'),
          returnDate: new Date('2024-01-10')
        }
      ];
      this.loading = false;
    }, 1000);
  }

  goBack() {
    if (this.userId) {
      this.router.navigate(['/users', this.userId]);
    } else {
      this.router.navigate(['/users']);
    }
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }
}