import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IssueService } from '../../../core/services/issue.service';
import { AssetService } from '../../../core/services/asset.service';
import { Issue, Asset } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { IssueChatComponent } from '../issue-chat/issue-chat.component';

@Component({
  selector: 'app-issue-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, IssueChatComponent],
  template: `
    <div class="issue-detail" *ngIf="issue">
      <div class="header">
        <div class="title-section">
          <h1>{{ issue.title }}</h1>
          <div class="issue-meta">
            <span class="issue-id">#{{ issue.id }}</span>
            <span class="status" [class]="'status-' + issue.status.toLowerCase().replace('_', '-')">{{ issue.status.replace('_', ' ') }}</span>
          </div>
        </div>
        <div class="actions">
          <button class="btn btn-secondary" (click)="goBack()">
            <i class="icon-arrow-left"></i> Back
          </button>

          <button *ngIf="canAssign()" class="btn btn-primary" (click)="assignIssue()">
            <i class="icon-play"></i> Start Work
          </button>
          <button *ngIf="canResolve()" class="btn btn-success" (click)="resolveIssue()">
            <i class="icon-check"></i> Resolve
          </button>
          <button *ngIf="canClose()" class="btn btn-warning" (click)="closeIssue()">
            <i class="icon-x"></i> Close
          </button>
        </div>
      </div>

      <div class="content">
        <div class="main-content">
          <div class="tabs">
            <button class="tab" [class.active]="activeTab === 'overview'" (click)="setActiveTab('overview')">Overview</button>
            <button class="tab" [class.active]="activeTab === 'messages'" (click)="setActiveTab('messages')">Messages</button>
            <button *ngIf="!isEmployee()" class="tab" [class.active]="activeTab === 'history'" (click)="setActiveTab('history')">History</button>
          </div>

          <div class="tab-content">
            <!-- Overview Tab -->
            <div *ngIf="activeTab === 'overview'" class="tab-panel">
              <div class="info-sections">
                <div class="info-section">
                  <h3><i class="icon-info"></i> Issue Information</h3>
                  <div class="info-grid">
                    <div class="info-item">
                      <label>Priority:</label>
                      <span class="badge priority" [class]="'priority-' + issue.priority.toLowerCase()">{{ issue.priority }}</span>
                    </div>
                    <div class="info-item">
                      <label>Type:</label>
                      <span class="badge type">{{ issue.type || 'General' }}</span>
                    </div>
                    <div class="info-item">
                      <label>Reported By:</label>
                      <span>{{ issue.reportedByName }}</span>
                    </div>
                    <div class="info-item">
                      <label>Assigned To:</label>
                      <span class="assigned-info">
                        <span class="assigned-name">{{ issue.assignedToName || 'Unassigned' }}</span>
                        <span *ngIf="issue.assignedToName" class="assigned-status">• Solving</span>
                      </span>
                    </div>
                    <div class="info-item">
                      <label>Reported Date:</label>
                      <span>{{ formatDate(issue.createdAt) }}</span>
                    </div>
                    <div class="info-item" *ngIf="issue.resolvedAt">
                      <label>Resolved Date:</label>
                      <span>{{ formatDate(issue.resolvedAt) }}</span>
                    </div>
                  </div>
                </div>

                <div class="info-section" *ngIf="relatedAsset">
                  <h3><i class="icon-monitor"></i> Related Asset</h3>
                  <div class="asset-card">
                    <div class="asset-icon">
                      <span class="icon">{{ getAssetIcon(relatedAsset.type) }}</span>
                    </div>
                    <div class="asset-info">
                      <div class="asset-name">{{ relatedAsset.name }}</div>
                      <div class="asset-details">{{ relatedAsset.assetTag }} • {{ relatedAsset.category }}</div>
                    </div>
                    <div class="asset-status">
                      <span class="status" [class]="'status-' + relatedAsset.status.toLowerCase()">{{ relatedAsset.status }}</span>
                    </div>
                    <button class="btn btn-outline" (click)="viewAsset()">
                      <i class="icon-external-link"></i> View Asset
                    </button>
                  </div>
                </div>

                <div class="info-section">
                  <h3><i class="icon-file-text"></i> Description</h3>
                  <div class="description-content">
                    <p class="description">{{ issue.description }}</p>
                  </div>
                </div>

                <div class="info-section" *ngIf="issue.resolutionNotes">
                  <h3><i class="icon-check-circle"></i> Resolution</h3>
                  <div class="resolution-content">
                    <p class="resolution">{{ issue.resolutionNotes }}</p>
                    <div class="resolution-meta">
                      <span class="resolved-date">Resolved on {{ formatDate(issue.resolvedAt) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Messages Tab -->
            <div *ngIf="activeTab === 'messages'" class="tab-panel messages-tab">
              <div class="chat-container" [class.fullscreen]="isFullscreen">
                <div class="chat-header">
                  <button class="fullscreen-btn" (click)="toggleFullscreen()">
                    <span *ngIf="!isFullscreen">⛶</span>
                    <span *ngIf="isFullscreen">⛶</span>
                  </button>
                </div>
                <app-issue-chat [issueId]="issue.id"></app-issue-chat>
              </div>
            </div>

            <!-- History Tab -->
            <div *ngIf="activeTab === 'history' && !isEmployee()" class="tab-panel">
              <div class="section-header">
                <h3><i class="icon-clock"></i> Issue History</h3>
              </div>
              <div class="history-timeline">
                <div class="timeline-item">
                  <div class="timeline-marker created"></div>
                  <div class="timeline-content">
                    <div class="timeline-title">Issue Created</div>
                    <div class="timeline-meta">{{ formatDate(issue.createdAt) }} by {{ issue.reportedByName }}</div>
                  </div>
                </div>
                <div class="timeline-item" *ngIf="issue.assignedToName">
                  <div class="timeline-marker assigned"></div>
                  <div class="timeline-content">
                    <div class="timeline-title">Issue Assigned</div>
                    <div class="timeline-meta">Assigned to {{ issue.assignedToName }}</div>
                  </div>
                </div>
                <div class="timeline-item" *ngIf="issue.resolvedAt">
                  <div class="timeline-marker resolved"></div>
                  <div class="timeline-content">
                    <div class="timeline-title">Issue Resolved</div>
                    <div class="timeline-meta">{{ formatDate(issue.resolvedAt) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar">
          <div class="quick-actions">
            <h4>Quick Actions</h4>
            <button class="action-btn" *ngIf="canAssign()" (click)="assignIssue()">
              <i class="icon-user"></i> Assign Issue
            </button>
            <button class="action-btn" *ngIf="canResolve()" (click)="resolveIssue()">
              <i class="icon-check"></i> Resolve Issue
            </button>
            <button class="action-btn" *ngIf="canClose()" (click)="closeIssue()">
              <i class="icon-x"></i> Close Issue
            </button>
            <button class="action-btn" (click)="printIssue()">
              <i class="icon-printer"></i> Print Issue
            </button>
            <button class="action-btn" *ngIf="relatedAsset" (click)="viewAsset()">
              <i class="icon-monitor"></i> View Asset
            </button>
          </div>

          <div class="issue-stats">
            <h4>Statistics</h4>

            <div class="stat-item">
              <label>Age:</label>
              <span>{{ getIssueAge() }} days</span>
            </div>
            <div class="stat-item" *ngIf="issue.resolvedAt">
              <label>Resolution Time:</label>
              <span>{{ getResolutionTime() }} days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .issue-detail { 
      padding: var(--space-6); 
      max-width: 1400px; 
      margin: 0 auto;
      background-color: var(--gray-50);
      min-height: 100vh;
    }
    
    .header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start; 
      margin-bottom: var(--space-8); 
      padding: var(--space-6);
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
    }
    
    .title-section h1 { 
      margin: 0 0 var(--space-2) 0; 
      color: var(--gray-900); 
      font-size: 1.875rem; 
      font-weight: 700;
      line-height: 1.2;
    }
    
    .issue-meta { 
      display: flex; 
      gap: var(--space-4); 
      align-items: center; 
    }
    
    .issue-id { 
      background: var(--gray-100); 
      color: var(--gray-700);
      padding: var(--space-2) var(--space-3); 
      border-radius: var(--radius-md); 
      font-family: var(--font-family-mono); 
      font-weight: 500;
      font-size: 0.875rem;
    }
    
    .actions { 
      display: flex; 
      gap: var(--space-3); 
    }
    
    .content { 
      display: grid; 
      grid-template-columns: 1fr 320px; 
      gap: var(--space-8); 
    }
    
    .main-content { 
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      overflow: hidden;
    }
    
    .tabs { 
      display: flex; 
      border-bottom: 1px solid var(--gray-200); 
      background: var(--gray-50);
    }
    
    .tab { 
      padding: var(--space-4) var(--space-6); 
      border: none; 
      background: none; 
      cursor: pointer; 
      font-weight: 500; 
      color: var(--gray-600); 
      border-bottom: 2px solid transparent; 
      transition: all var(--transition-fast);
      font-size: 0.875rem;
    }
    
    .tab.active { 
      color: var(--primary-600); 
      border-bottom-color: var(--primary-600);
      background: white;
    }
    
    .tab:hover:not(.active) { 
      color: var(--primary-500); 
      background: var(--gray-100); 
    }
    
    .tab-panel { 
      animation: fadeIn 0.3s ease-in;
      padding: var(--space-6);
    }
    
    @keyframes fadeIn { 
      from { opacity: 0; transform: translateY(8px); } 
      to { opacity: 1; transform: translateY(0); } 
    }
    
    .info-sections { 
      display: flex; 
      flex-direction: column; 
      gap: var(--space-6); 
    }
    
    .info-section { 
      background: var(--gray-50); 
      padding: var(--space-6); 
      border-radius: var(--radius-lg); 
      border: 1px solid var(--gray-200);
    }
    
    .info-section h3 { 
      margin: 0 0 var(--space-5) 0; 
      color: var(--gray-900); 
      font-size: 1.125rem; 
      font-weight: 600; 
      display: flex; 
      align-items: center; 
      gap: var(--space-2); 
    }
    
    .info-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
      gap: var(--space-5); 
    }
    
    .info-item { 
      display: flex; 
      flex-direction: column; 
      gap: var(--space-2);
    }
    
    .info-item label { 
      font-weight: 500; 
      color: var(--gray-600); 
      font-size: 0.75rem; 
      text-transform: uppercase; 
      letter-spacing: 0.05em; 
    }
    
    .info-item span { 
      color: var(--gray-900); 
      font-weight: 500;
      font-size: 0.875rem;
    }
    
    .badge { 
      display: inline-flex;
      align-items: center;
      padding: var(--space-1) var(--space-3); 
      border-radius: var(--radius-xl); 
      font-size: 0.75rem; 
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.025em;
      width: fit-content;
    }
    
    .badge.priority { 
      background: var(--gray-100); 
      color: var(--gray-700); 
    }
    
    .priority-high { 
      background: var(--error-50); 
      color: var(--error-600); 
    }
    
    .priority-medium { 
      background: var(--warning-50); 
      color: var(--warning-600); 
    }
    
    .priority-low { 
      background: var(--success-50); 
      color: var(--success-600); 
    }
    
    .badge.type { 
      background: var(--primary-50); 
      color: var(--primary-600); 
    }
    
    .status { 
      display: inline-flex;
      align-items: center;
      padding: var(--space-1) var(--space-3); 
      border-radius: var(--radius-xl); 
      color: white; 
      font-size: 0.75rem; 
      font-weight: 500; 
      text-transform: uppercase;
      letter-spacing: 0.025em;
      width: fit-content;
    }
    
    .status-open { 
      background: var(--error-500); 
    }
    
    .status-in-progress { 
      background: var(--warning-500); 
    }
    
    .status-resolved { 
      background: var(--success-500); 
    }
    
    .status-closed { 
      background: var(--gray-500); 
    }
    
    .asset-card { 
      display: flex; 
      gap: var(--space-4); 
      align-items: center; 
      padding: var(--space-4); 
      background: white; 
      border-radius: var(--radius-md); 
      border: 1px solid var(--gray-200);
    }

    .asset-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--gray-100);
      border-radius: var(--radius-md);
      font-size: 1.5rem;
    }

    .assigned-info {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .assigned-status {
      color: var(--success-600);
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .asset-info { 
      flex: 1;
    }
    
    .asset-name { 
      font-weight: 600; 
      color: var(--gray-900); 
    }
    
    .asset-details { 
      color: var(--gray-600); 
      font-size: 0.875rem; 
    }
    
    .description-content, .resolution-content { 
      padding: var(--space-4);
      background: white;
      border-radius: var(--radius-md);
      border: 1px solid var(--gray-200);
    }
    
    .description, .resolution { 
      line-height: 1.6; 
      color: var(--gray-900); 
      margin: 0;
    }
    
    .resolution-meta { 
      margin-top: var(--space-3);
      padding-top: var(--space-3);
      border-top: 1px solid var(--gray-200);
    }
    
    .resolved-date { 
      color: var(--gray-600); 
      font-size: 0.875rem; 
    }
    
    .section-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start; 
      margin-bottom: var(--space-6); 
    }
    
    .section-header h3 { 
      margin: 0; 
      display: flex; 
      align-items: center; 
      gap: var(--space-2); 
    }
    
    .messages-list { 
      display: flex; 
      flex-direction: column; 
      gap: var(--space-4); 
    }
    
    .message-card { 
      background: white; 
      padding: var(--space-4); 
      border-radius: var(--radius-md); 
      border: 1px solid var(--gray-200);
    }
    
    .message-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: var(--space-3); 
    }
    
    .sender-name { 
      font-weight: 600; 
      color: var(--gray-900); 
    }
    
    .message-date { 
      color: var(--gray-600); 
      font-size: 0.875rem; 
    }
    
    .message-content p { 
      margin: 0; 
      line-height: 1.6; 
      color: var(--gray-900); 
    }
    
    .history-timeline { 
      position: relative;
      padding-left: var(--space-8);
    }
    
    .timeline-item { 
      position: relative;
      padding-bottom: var(--space-6);
    }
    
    .timeline-item:not(:last-child)::before { 
      content: '';
      position: absolute;
      left: -22px;
      top: 24px;
      bottom: -24px;
      width: 2px;
      background: var(--gray-200);
    }
    
    .timeline-marker { 
      position: absolute;
      left: -28px;
      top: 4px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 0 2px var(--gray-300);
    }
    
    .timeline-marker.created { 
      background: var(--primary-500);
      box-shadow: 0 0 0 2px var(--primary-200);
    }
    
    .timeline-marker.assigned { 
      background: var(--warning-500);
      box-shadow: 0 0 0 2px var(--warning-200);
    }
    
    .timeline-marker.resolved { 
      background: var(--success-500);
      box-shadow: 0 0 0 2px var(--success-200);
    }
    
    .timeline-title { 
      font-weight: 600;
      color: var(--gray-900);
      margin-bottom: var(--space-1);
    }
    
    .timeline-meta { 
      color: var(--gray-600);
      font-size: 0.875rem;
    }
    
    .sidebar { 
      display: flex; 
      flex-direction: column; 
      gap: var(--space-6); 
    }
    
    .quick-actions, .issue-stats { 
      background: white; 
      padding: var(--space-6); 
      border-radius: var(--radius-lg); 
      box-shadow: var(--shadow-sm); 
      border: 1px solid var(--gray-200); 
    }
    
    .quick-actions h4, .issue-stats h4 { 
      margin: 0 0 var(--space-4) 0; 
      color: var(--gray-900); 
      font-weight: 600;
      font-size: 1rem;
    }
    
    .action-btn { 
      width: 100%; 
      padding: var(--space-3); 
      border: none; 
      background: var(--gray-50); 
      border-radius: var(--radius-md); 
      cursor: pointer; 
      display: flex; 
      align-items: center; 
      gap: var(--space-2); 
      margin-bottom: var(--space-2); 
      transition: all var(--transition-fast);
      color: var(--gray-700);
      font-weight: 500;
      font-size: 0.875rem;
    }
    
    .action-btn:hover { 
      background: var(--gray-100); 
      transform: translateX(2px); 
      color: var(--gray-900);
    }
    
    .stat-item { 
      display: flex; 
      justify-content: space-between; 
      padding: var(--space-2) 0; 
      border-bottom: 1px solid var(--gray-200); 
    }
    
    .stat-item:last-child { 
      border-bottom: none; 
    }
    
    .stat-item label { 
      color: var(--gray-600); 
    }
    
    .stat-item span { 
      font-weight: 600; 
    }
    
    .empty-state { 
      text-align: center; 
      padding: var(--space-12); 
      color: var(--gray-600); 
    }
    
    .empty-state i { 
      font-size: 3rem; 
      margin-bottom: var(--space-4); 
      color: var(--gray-400); 
    }
    
    .empty-state h4 { 
      margin: 0 0 var(--space-2) 0; 
      color: var(--gray-900); 
    }
    
    .empty-state p { 
      margin: 0 0 var(--space-4) 0;
      font-size: 0.875rem;
      line-height: 1.5;
    }
    
    .btn { 
      padding: var(--space-3) var(--space-4); 
      border: none; 
      border-radius: var(--radius-md); 
      cursor: pointer; 
      font-weight: 500;
      font-size: 0.875rem;
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      transition: all var(--transition-fast);
    }
    
    .btn-primary { 
      background: var(--primary-600); 
      color: white; 
    }
    
    .btn-primary:hover { 
      background: var(--primary-700); 
      transform: translateY(-1px);
    }
    
    .btn-secondary { 
      background: var(--gray-600); 
      color: white; 
    }
    
    .btn-secondary:hover { 
      background: var(--gray-700); 
    }
    
    .btn-success { 
      background: var(--success-600); 
      color: white; 
    }
    
    .btn-success:hover { 
      background: var(--success-700); 
    }
    
    .btn-warning { 
      background: var(--warning-600); 
      color: white; 
    }
    
    .btn-warning:hover { 
      background: var(--warning-700); 
    }
    
    .btn-outline { 
      background: transparent; 
      color: var(--primary-600); 
      border: 1px solid var(--primary-600); 
    }
    
    .btn-outline:hover { 
      background: var(--primary-50); 
    }
    
    @media (max-width: 1024px) {
      .content {
        grid-template-columns: 1fr;
        gap: var(--space-6);
      }
      
      .sidebar {
        order: -1;
      }
    }
    
    @media (max-width: 640px) {
      .issue-detail {
        padding: var(--space-4);
      }
      
      .header {
        flex-direction: column;
        gap: var(--space-4);
        align-items: stretch;
      }
      
      .actions {
        justify-content: stretch;
      }
      
      .actions .btn {
        flex: 1;
        justify-content: center;
      }
      
      .tabs {
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      
      .tabs::-webkit-scrollbar {
        display: none;
      }
      
      .tab {
        white-space: nowrap;
        min-width: fit-content;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
      }
    }

    .messages-tab {
      padding: 0 !important;
    }

    .chat-container {
      height: 600px;
      border-radius: var(--radius-md);
      overflow: hidden;
      position: relative;
    }

    .chat-container.fullscreen {
      position: fixed;
      top: 80px;
      left: 280px;
      right: 0;
      bottom: 0;
      z-index: 1000;
      border-radius: 0;
      background: white;
      height: auto;
    }

    .chat-header {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      z-index: 10;
    }

    .fullscreen-btn {
      background: rgba(0, 0, 0, 0.1);
      border: none;
      border-radius: 4px;
      padding: 0.5rem;
      cursor: pointer;
      font-size: 1rem;
      color: #666;
      transition: background 0.2s;
    }

    .fullscreen-btn:hover {
      background: rgba(0, 0, 0, 0.2);
    }
  `]
})
export class IssueDetailComponent implements OnInit {
  issue: Issue | null = null;
  relatedAsset: Asset | null = null;
  activeTab = 'overview';
  isFullscreen = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private issueService: IssueService,
    private assetService: AssetService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const numericId = +id;
      if (isNaN(numericId) || numericId <= 0) {
        this.toastService.error('Invalid issue ID');
        this.router.navigate(['/issues']);
        return;
      }
      this.loadIssue(numericId);
    } else {
      this.router.navigate(['/issues']);
    }
  }

  loadIssue(id: number) {
    this.issueService.getIssueById(id).subscribe({
      next: (issue) => {
        this.issue = issue;
        this.loadRelatedAsset();
      },
      error: () => {
        this.toastService.error('Issue not found');
        this.router.navigate(['/issues']);
      }
    });
  }

  loadRelatedAsset() {
    // Asset relationship would need to be implemented via assetTag or separate service
    // For now, we'll skip loading the related asset
  }



  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  getIssueAge(): number {
    if (!this.issue?.createdAt) return 0;
    const created = new Date(this.issue.createdAt);
    const today = new Date();
    const diffTime = today.getTime() - created.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getResolutionTime(): number {
    if (!this.issue?.createdAt || !this.issue?.resolvedAt) return 0;
    const created = new Date(this.issue.createdAt);
    const resolved = new Date(this.issue.resolvedAt);
    const diffTime = resolved.getTime() - created.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  canAssign(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'IT_SUPPORT' && 
           this.issue?.status === 'OPEN' && 
           !this.issue?.assignedToName;
  }

  canResolve(): boolean {
    const user = this.authService.getCurrentUser();
    return this.issue?.status === 'IN_PROGRESS' && 
           user?.role === 'IT_SUPPORT' && 
           this.issue?.assignedToId === user?.id;
  }

  canClose(): boolean {
    const user = this.authService.getCurrentUser();
    return this.issue?.status === 'RESOLVED' && 
           this.issue?.reportedById === user?.id;
  }

  assignIssue() {
    if (this.issue) {
      const user = this.authService.getCurrentUser();
      if (user?.role === 'IT_SUPPORT') {
        const issueId = this.issue.id;
        console.log('=== FRONTEND ASSIGN DEBUG ===');
        console.log('Issue ID:', issueId);
        console.log('User ID:', user.id);
        console.log('User Name:', user.name);
        console.log('Current issue assigned to:', this.issue.assignedToName);
        
        // Backend assignIssue already updates status to IN_PROGRESS
        this.issueService.assignIssue(issueId, user.id).subscribe({
          next: (updatedIssue) => {
            console.log('Response from backend:', updatedIssue);
            console.log('Updated issue assigned to name:', updatedIssue.assignedToName);
            console.log('Updated issue assigned to ID:', updatedIssue.assignedToId);
            
            this.issue = updatedIssue;
            console.log('Frontend issue after assignment:', this.issue.assignedToName);
            
            this.toastService.success('Issue assigned and status updated to In Progress');
          },
          error: (error) => {
            console.error('Assignment error:', error);
            this.toastService.error('Failed to assign issue');
          }
        });
      }
    }
  }

  resolveIssue() {
    if (this.issue) {
      const resolutionNotes = prompt('Enter resolution notes:');
      if (resolutionNotes) {
        const costStr = prompt('Enter approximate cost (optional):');
        const cost = costStr ? parseFloat(costStr) : undefined;
        
        this.issueService.resolveIssueWithCost(this.issue.id, resolutionNotes, cost).subscribe({
          next: () => {
            this.toastService.success('Issue resolved successfully');
            if (this.issue) {
              this.loadIssue(this.issue.id);
            }
          },
          error: (error) => {
            this.toastService.error(error.error?.message || 'Failed to resolve issue');
          }
        });
      }
    }
  }

  closeIssue() {
    if (this.issue) {
      const user = this.authService.getCurrentUser();
      this.issueService.closeIssue(this.issue.id, user?.id || 0).subscribe({
        next: () => {
          this.toastService.success('Issue closed successfully');
          this.loadIssue(this.issue!.id);
        },
        error: (error) => {
          this.toastService.error(error.error?.message || 'Failed to close issue');
        }
      });
    }
  }

  printIssue() {
    window.print();
  }

  viewAsset() {
    if (this.relatedAsset) {
      this.router.navigate(['/assets', this.relatedAsset.id]);
    }
  }

  goBack() {
    this.router.navigate(['/issues']);
  }

  isITSupport(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'IT_SUPPORT' || user?.role === 'ADMIN';
  }

  isEmployee(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'EMPLOYEE';
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
  }



  getAssetIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'LAPTOP': '💻',
      'DESKTOP': '🖥️',
      'MONITOR': '🖥️',
      'KEYBOARD': '⌨️',
      'MOUSE': '🖱️',
      'PRINTER': '🖨️',
      'PHONE': '📱',
      'TABLET': '📱',
      'SERVER': '🖥️',
      'ROUTER': '📡',
      'SWITCH': '📡',
      'CABLE': '🔌',
      'HEADSET': '🎧',
      'WEBCAM': '📹',
      'SPEAKER': '🔊'
    };
    return icons[type?.toUpperCase()] || '📦';
  }
}