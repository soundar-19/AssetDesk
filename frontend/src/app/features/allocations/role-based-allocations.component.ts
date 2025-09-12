import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllocationService } from '../../core/services/allocation.service';
import { RoleService } from '../../core/services/role.service';
import { AuthService } from '../../core/services/auth.service';
import { AssetAllocation } from '../../core/models/allocation.model';
import { ROLES } from '../../core/constants/role.constants';

@Component({
  selector: 'app-role-based-allocations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="role-based-dashboard">
      <!-- Admin/IT Support View -->
      <div *ngIf="isAdminOrITSupport" class="admin-view">
        <div class="view-header">
          <h2>🛠️ Management Dashboard</h2>
          <p>Complete overview and control of all asset allocations</p>
        </div>
        
        <div class="management-features">
          <div class="feature-card">
            <h3>📊 Analytics & Insights</h3>
            <ul>
              <li>Real-time allocation metrics</li>
              <li>Asset utilization trends</li>
              <li>Department-wise distribution</li>
              <li>Overdue return alerts</li>
            </ul>
          </div>
          
          <div class="feature-card">
            <h3>⚡ Quick Actions</h3>
            <ul>
              <li>Bulk asset allocation</li>
              <li>Force return assets</li>
              <li>Generate reports</li>
              <li>Audit trail access</li>
            </ul>
          </div>
          
          <div class="feature-card">
            <h3>🔧 Advanced Management</h3>
            <ul>
              <li>Asset lifecycle tracking</li>
              <li>Maintenance scheduling</li>
              <li>Vendor management</li>
              <li>Compliance monitoring</li>
            </ul>
          </div>
        </div>
      </div>



      <!-- Employee View -->
      <div *ngIf="isEmployee" class="employee-view">
        <div class="view-header">
          <h2>💼 My Assets</h2>
          <p>View and manage your allocated assets</p>
        </div>
        
        <div class="employee-features">
          <div class="feature-card">
            <h3>📱 My Allocations</h3>
            <ul>
              <li>Currently assigned assets</li>
              <li>Asset return process</li>
              <li>Usage guidelines</li>
              <li>Support requests</li>
            </ul>
          </div>
          
          <div class="feature-card">
            <h3>🔄 Self-Service</h3>
            <ul>
              <li>Request new assets</li>
              <li>Report issues</li>
              <li>Schedule returns</li>
              <li>Access documentation</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Benefits Section -->
      <div class="benefits-section">
        <h2>🎯 Key Benefits of Modern Asset Allocation</h2>
        
        <div class="benefits-grid">
          <div class="benefit-card">
            <div class="benefit-icon">⚡</div>
            <h3>Increased Efficiency</h3>
            <p>Streamlined allocation process reduces manual work by 70% and eliminates paperwork</p>
          </div>
          
          <div class="benefit-card">
            <div class="benefit-icon">📊</div>
            <h3>Better Visibility</h3>
            <p>Real-time tracking and analytics provide complete visibility into asset utilization</p>
          </div>
          
          <div class="benefit-card">
            <div class="benefit-icon">💰</div>
            <h3>Cost Optimization</h3>
            <p>Optimize asset usage and reduce unnecessary purchases through better tracking</p>
          </div>
          
          <div class="benefit-card">
            <div class="benefit-icon">🔒</div>
            <h3>Enhanced Security</h3>
            <p>Complete audit trail and role-based access ensure asset security and compliance</p>
          </div>
          
          <div class="benefit-card">
            <div class="benefit-icon">🚀</div>
            <h3>Scalable Solution</h3>
            <p>Grows with your organization and adapts to changing business needs</p>
          </div>
          
          <div class="benefit-card">
            <div class="benefit-icon">📱</div>
            <h3>Mobile Ready</h3>
            <p>Access and manage allocations from anywhere with responsive design</p>
          </div>
        </div>
      </div>

      <!-- Modernization Features -->
      <div class="modernization-section">
        <h2>🔄 Modernization Features</h2>
        
        <div class="feature-comparison">
          <div class="comparison-column old">
            <h3>❌ Old System</h3>
            <ul>
              <li>Manual paper-based tracking</li>
              <li>No real-time visibility</li>
              <li>Limited reporting capabilities</li>
              <li>Prone to human errors</li>
              <li>Time-consuming processes</li>
              <li>No mobile access</li>
            </ul>
          </div>
          
          <div class="comparison-column new">
            <h3>✅ Modern System</h3>
            <ul>
              <li>Digital workflow automation</li>
              <li>Real-time tracking & alerts</li>
              <li>Advanced analytics & insights</li>
              <li>Automated validation & checks</li>
              <li>Instant processing & updates</li>
              <li>Mobile-first responsive design</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-section">
        <button class="btn btn-primary btn-lg" (click)="navigateToAllocations()">
          <span class="icon">🚀</span>
          Explore Modern Allocations
        </button>
        
        <button *ngIf="canManageAllocations" class="btn btn-outline btn-lg" (click)="navigateToAnalytics()">
          <span class="icon">📊</span>
          View Analytics Dashboard
        </button>
      </div>
    </div>
  `,
  styles: [`
    .role-based-dashboard {
      padding: var(--space-6);
      max-width: 1200px;
      margin: 0 auto;
    }

    .view-header {
      text-align: center;
      margin-bottom: var(--space-8);
      padding: var(--space-6);
      background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
      color: white;
      border-radius: var(--radius-lg);
    }

    .view-header h2 {
      font-size: 2rem;
      margin: 0 0 var(--space-2) 0;
    }

    .view-header p {
      font-size: 1.125rem;
      opacity: 0.9;
      margin: 0;
    }

    .management-features, .employee-features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--space-6);
      margin-bottom: var(--space-8);
    }

    .feature-card {
      background: white;
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      box-shadow: var(--shadow-md);
      border: 1px solid var(--gray-200);
    }

    .feature-card h3 {
      color: var(--gray-900);
      margin: 0 0 var(--space-4) 0;
      font-size: 1.25rem;
    }

    .feature-card ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .feature-card li {
      padding: var(--space-2) 0;
      color: var(--gray-700);
      border-bottom: 1px solid var(--gray-100);
    }

    .feature-card li:last-child {
      border-bottom: none;
    }

    .feature-card li:before {
      content: "✓";
      color: var(--success-500);
      font-weight: bold;
      margin-right: var(--space-2);
    }

    .benefits-section {
      margin: var(--space-12) 0;
      text-align: center;
    }

    .benefits-section h2 {
      color: var(--gray-900);
      margin-bottom: var(--space-8);
      font-size: 2rem;
    }

    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--space-6);
    }

    .benefit-card {
      background: white;
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      text-align: center;
      transition: transform 0.2s ease;
    }

    .benefit-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .benefit-icon {
      font-size: 3rem;
      margin-bottom: var(--space-4);
    }

    .benefit-card h3 {
      color: var(--gray-900);
      margin: 0 0 var(--space-3) 0;
      font-size: 1.25rem;
    }

    .benefit-card p {
      color: var(--gray-600);
      line-height: 1.6;
      margin: 0;
    }

    .modernization-section {
      margin: var(--space-12) 0;
      background: var(--gray-50);
      padding: var(--space-8);
      border-radius: var(--radius-lg);
    }

    .modernization-section h2 {
      text-align: center;
      color: var(--gray-900);
      margin-bottom: var(--space-8);
      font-size: 2rem;
    }

    .feature-comparison {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-8);
    }

    .comparison-column {
      background: white;
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      box-shadow: var(--shadow-sm);
    }

    .comparison-column.old {
      border-left: 4px solid var(--error-500);
    }

    .comparison-column.new {
      border-left: 4px solid var(--success-500);
    }

    .comparison-column h3 {
      margin: 0 0 var(--space-4) 0;
      font-size: 1.25rem;
    }

    .comparison-column ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .comparison-column li {
      padding: var(--space-2) 0;
      color: var(--gray-700);
      border-bottom: 1px solid var(--gray-100);
    }

    .comparison-column li:last-child {
      border-bottom: none;
    }

    .action-section {
      text-align: center;
      margin-top: var(--space-12);
      padding: var(--space-8);
      background: linear-gradient(135deg, var(--primary-50), var(--primary-100));
      border-radius: var(--radius-lg);
    }

    .btn-lg {
      padding: var(--space-4) var(--space-8);
      font-size: 1.125rem;
      margin: 0 var(--space-3);
    }

    .btn .icon {
      margin-right: var(--space-2);
    }

    @media (max-width: 768px) {
      .role-based-dashboard {
        padding: var(--space-4);
      }

      .management-features, .employee-features {
        grid-template-columns: 1fr;
      }

      .benefits-grid {
        grid-template-columns: 1fr;
      }

      .feature-comparison {
        grid-template-columns: 1fr;
      }

      .btn-lg {
        display: block;
        margin: var(--space-2) 0;
        width: 100%;
      }
    }
  `]
})
export class RoleBasedAllocationsComponent implements OnInit {
  currentUser: any = null;

  constructor(
    private allocationService: AllocationService,
    private roleService: RoleService,
    private authService: AuthService
  ) {}

  get isAdminOrITSupport(): boolean {
    return this.roleService.hasAnyRole([ROLES.ADMIN, ROLES.IT_SUPPORT]);
  }

  get isManager(): boolean {
    return this.roleService.hasRole(ROLES.IT_SUPPORT);
  }

  get isEmployee(): boolean {
    return this.roleService.hasRole(ROLES.EMPLOYEE);
  }

  get canManageAllocations(): boolean {
    return this.roleService.hasAnyRole([ROLES.ADMIN, ROLES.IT_SUPPORT]);
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }

  navigateToAllocations() {
    window.location.href = '/allocations';
  }

  navigateToAnalytics() {
    // Navigate to analytics dashboard
    console.log('Navigate to analytics');
  }
}