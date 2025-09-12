import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';
import { AssetService } from '../../core/services/asset.service';
import { Asset, PageResponse } from '../../core/models';
import { StatusBadgePipe } from '../../shared/pipes/status-badge.pipe';


interface WarrantyStats {
  totalAssets: number;
  expiredWarranties: number;
  expiringIn30Days: number;
  expiringIn90Days: number;
  validWarranties: number;
}

@Component({
  selector: 'app-warranty-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    RouterModule,
    StatusBadgePipe
  ],
  template: `
    <div class="warranty-management">
      <div class="header">
        <h1>Warranty Management</h1>
        <p>Monitor asset warranties and track expiration dates</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card total">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>inventory</mat-icon>
            </div>
            <div class="stat-info">
              <h3>{{stats.totalAssets}}</h3>
              <p>Total Assets with Warranty</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card expired">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>error</mat-icon>
            </div>
            <div class="stat-info">
              <h3>{{stats.expiredWarranties}}</h3>
              <p>Expired Warranties</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card warning">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>warning</mat-icon>
            </div>
            <div class="stat-info">
              <h3>{{stats.expiringIn30Days}}</h3>
              <p>Expiring in 30 Days</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card valid">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="stat-info">
              <h3>{{stats.validWarranties}}</h3>
              <p>Valid Warranties</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Tabs for different warranty views -->
      <mat-card class="data-card">
        <mat-tab-group>
          <mat-tab label="Expiring Soon (30 Days)">
            <div class="tab-content">
              <mat-table [dataSource]="expiringSoonAssets" class="warranty-table">
                <ng-container matColumnDef="assetTag">
                  <mat-header-cell *matHeaderCellDef>Asset Tag</mat-header-cell>
                  <mat-cell *matCellDef="let asset">
                    <a [routerLink]="['/assets', asset.id]" class="asset-link">
                      {{asset.assetTag}}
                    </a>
                  </mat-cell>
                </ng-container>

                <ng-container matColumnDef="name">
                  <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
                  <mat-cell *matCellDef="let asset">{{asset.name}}</mat-cell>
                </ng-container>

                <ng-container matColumnDef="category">
                  <mat-header-cell *matHeaderCellDef>Category</mat-header-cell>
                  <mat-cell *matCellDef="let asset">
                    <mat-chip-set>
                      <mat-chip>{{asset.category}}</mat-chip>
                    </mat-chip-set>
                  </mat-cell>
                </ng-container>

                <ng-container matColumnDef="warrantyExpiryDate">
                  <mat-header-cell *matHeaderCellDef>Warranty Expiry</mat-header-cell>
                  <mat-cell *matCellDef="let asset">
                    <span class="expiry-date" [class.critical]="isExpiringSoon(asset.warrantyExpiryDate)">
                      {{asset.warrantyExpiryDate | date:'mediumDate'}}
                    </span>
                  </mat-cell>
                </ng-container>

                <ng-container matColumnDef="daysLeft">
                  <mat-header-cell *matHeaderCellDef>Days Left</mat-header-cell>
                  <mat-cell *matCellDef="let asset">
                    <span class="days-left" [class.critical]="getDaysLeft(asset.warrantyExpiryDate) <= 7">
                      {{getDaysLeft(asset.warrantyExpiryDate)}} days
                    </span>
                  </mat-cell>
                </ng-container>

                <ng-container matColumnDef="status">
                  <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
                  <mat-cell *matCellDef="let asset">
                    <span [innerHTML]="asset.status | statusBadge"></span>
                  </mat-cell>
                </ng-container>

                <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
                <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
              </mat-table>

              <mat-paginator 
                [length]="expiringSoonTotal"
                [pageSize]="pageSize"
                [pageSizeOptions]="[10, 25, 50]"
                (page)="onExpiringSoonPageChange($event)">
              </mat-paginator>
            </div>
          </mat-tab>

          <mat-tab label="Expired Warranties">
            <div class="tab-content">
              <mat-table [dataSource]="expiredAssets" class="warranty-table">
                <ng-container matColumnDef="assetTag">
                  <mat-header-cell *matHeaderCellDef>Asset Tag</mat-header-cell>
                  <mat-cell *matCellDef="let asset">
                    <a [routerLink]="['/assets', asset.id]" class="asset-link">
                      {{asset.assetTag}}
                    </a>
                  </mat-cell>
                </ng-container>

                <ng-container matColumnDef="name">
                  <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
                  <mat-cell *matCellDef="let asset">{{asset.name}}</mat-cell>
                </ng-container>

                <ng-container matColumnDef="category">
                  <mat-header-cell *matHeaderCellDef>Category</mat-header-cell>
                  <mat-cell *matCellDef="let asset">
                    <mat-chip-set>
                      <mat-chip>{{asset.category}}</mat-chip>
                    </mat-chip-set>
                  </mat-cell>
                </ng-container>

                <ng-container matColumnDef="warrantyExpiryDate">
                  <mat-header-cell *matHeaderCellDef>Warranty Expiry</mat-header-cell>
                  <mat-cell *matCellDef="let asset">
                    <span class="expiry-date expired">
                      {{asset.warrantyExpiryDate | date:'mediumDate'}}
                    </span>
                  </mat-cell>
                </ng-container>

                <ng-container matColumnDef="daysOverdue">
                  <mat-header-cell *matHeaderCellDef>Days Overdue</mat-header-cell>
                  <mat-cell *matCellDef="let asset">
                    <span class="days-overdue">
                      {{Math.abs(getDaysLeft(asset.warrantyExpiryDate))}} days
                    </span>
                  </mat-cell>
                </ng-container>

                <ng-container matColumnDef="status">
                  <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
                  <mat-cell *matCellDef="let asset">
                    <span [innerHTML]="asset.status | statusBadge"></span>
                  </mat-cell>
                </ng-container>

                <mat-header-row *matHeaderRowDef="expiredDisplayedColumns"></mat-header-row>
                <mat-row *matRowDef="let row; columns: expiredDisplayedColumns;"></mat-row>
              </mat-table>

              <mat-paginator 
                [length]="expiredTotal"
                [pageSize]="pageSize"
                [pageSizeOptions]="[10, 25, 50]"
                (page)="onExpiredPageChange($event)">
              </mat-paginator>
            </div>
          </mat-tab>

          <mat-tab label="Valid Warranties">
            <div class="tab-content">
              <mat-table [dataSource]="validAssets" class="warranty-table">
                <ng-container matColumnDef="assetTag">
                  <mat-header-cell *matHeaderCellDef>Asset Tag</mat-header-cell>
                  <mat-cell *matCellDef="let asset">
                    <a [routerLink]="['/assets', asset.id]" class="asset-link">
                      {{asset.assetTag}}
                    </a>
                  </mat-cell>
                </ng-container>

                <ng-container matColumnDef="name">
                  <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
                  <mat-cell *matCellDef="let asset">{{asset.name}}</mat-cell>
                </ng-container>

                <ng-container matColumnDef="category">
                  <mat-header-cell *matHeaderCellDef>Category</mat-header-cell>
                  <mat-cell *matCellDef="let asset">
                    <mat-chip-set>
                      <mat-chip>{{asset.category}}</mat-chip>
                    </mat-chip-set>
                  </mat-cell>
                </ng-container>

                <ng-container matColumnDef="warrantyExpiryDate">
                  <mat-header-cell *matHeaderCellDef>Warranty Expiry</mat-header-cell>
                  <mat-cell *matCellDef="let asset">
                    <span class="expiry-date valid">
                      {{asset.warrantyExpiryDate | date:'mediumDate'}}
                    </span>
                  </mat-cell>
                </ng-container>

                <ng-container matColumnDef="daysLeft">
                  <mat-header-cell *matHeaderCellDef>Days Left</mat-header-cell>
                  <mat-cell *matCellDef="let asset">
                    <span class="days-left">
                      {{getDaysLeft(asset.warrantyExpiryDate)}} days
                    </span>
                  </mat-cell>
                </ng-container>

                <ng-container matColumnDef="status">
                  <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
                  <mat-cell *matCellDef="let asset">
                    <span [innerHTML]="asset.status | statusBadge"></span>
                  </mat-cell>
                </ng-container>

                <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
                <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
              </mat-table>

              <mat-paginator 
                [length]="validTotal"
                [pageSize]="pageSize"
                [pageSizeOptions]="[10, 25, 50]"
                (page)="onValidPageChange($event)">
              </mat-paginator>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [`
    .warranty-management {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 32px;
    }

    .header h1 {
      margin: 0 0 8px 0;
      font-size: 2rem;
      font-weight: 500;
    }

    .header p {
      margin: 0;
      color: #666;
      font-size: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      padding: 0;
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      padding: 24px;
    }

    .stat-icon {
      margin-right: 16px;
    }

    .stat-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .stat-info h3 {
      margin: 0 0 4px 0;
      font-size: 2rem;
      font-weight: 600;
    }

    .stat-info p {
      margin: 0;
      color: #666;
      font-size: 0.875rem;
    }

    .stat-card.total .stat-icon mat-icon { color: #2196F3; }
    .stat-card.expired .stat-icon mat-icon { color: #F44336; }
    .stat-card.warning .stat-icon mat-icon { color: #FF9800; }
    .stat-card.valid .stat-icon mat-icon { color: #4CAF50; }

    .data-card {
      margin-top: 24px;
    }

    .tab-content {
      padding: 24px 0;
    }

    .warranty-table {
      width: 100%;
    }

    .asset-link {
      color: #1976d2;
      text-decoration: none;
      font-weight: 500;
    }

    .asset-link:hover {
      text-decoration: underline;
    }

    .expiry-date.critical {
      color: #f44336;
      font-weight: 500;
    }

    .expiry-date.expired {
      color: #d32f2f;
      font-weight: 600;
    }

    .expiry-date.valid {
      color: #388e3c;
    }

    .days-left.critical {
      color: #f44336;
      font-weight: 600;
    }

    .days-overdue {
      color: #d32f2f;
      font-weight: 600;
    }

    mat-paginator {
      margin-top: 16px;
    }
  `]
})
export class WarrantyManagementComponent implements OnInit {
  Math = Math;
  
  stats: WarrantyStats = {
    totalAssets: 0,
    expiredWarranties: 0,
    expiringIn30Days: 0,
    expiringIn90Days: 0,
    validWarranties: 0
  };

  expiringSoonAssets: Asset[] = [];
  expiredAssets: Asset[] = [];
  validAssets: Asset[] = [];

  expiringSoonTotal = 0;
  expiredTotal = 0;
  validTotal = 0;

  pageSize = 10;
  currentExpiringSoonPage = 0;
  currentExpiredPage = 0;
  currentValidPage = 0;

  displayedColumns = ['assetTag', 'name', 'category', 'warrantyExpiryDate', 'daysLeft', 'status'];
  expiredDisplayedColumns = ['assetTag', 'name', 'category', 'warrantyExpiryDate', 'daysOverdue', 'status'];

  constructor(private assetService: AssetService) {}

  ngOnInit(): void {
    this.loadWarrantyStats();
    this.loadExpiringSoonAssets();
    this.loadExpiredAssets();
    this.loadValidAssets();
  }

  loadWarrantyStats(): void {
    this.assetService.getWarrantyStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading warranty stats:', error);
      }
    });
  }

  loadExpiringSoonAssets(): void {
    this.assetService.getWarrantyExpiring(30, this.currentExpiringSoonPage, this.pageSize).subscribe({
      next: (response: PageResponse<Asset>) => {
        this.expiringSoonAssets = response.content;
        this.expiringSoonTotal = response.totalElements;
      },
      error: (error) => {
        console.error('Error loading expiring assets:', error);
      }
    });
  }

  loadExpiredAssets(): void {
    this.assetService.getExpiredWarranties(this.currentExpiredPage, this.pageSize).subscribe({
      next: (response: PageResponse<Asset>) => {
        this.expiredAssets = response.content;
        this.expiredTotal = response.totalElements;
      },
      error: (error) => {
        console.error('Error loading expired assets:', error);
      }
    });
  }

  loadValidAssets(): void {
    this.assetService.getValidWarranties(this.currentValidPage, this.pageSize).subscribe({
      next: (response: PageResponse<Asset>) => {
        this.validAssets = response.content;
        this.validTotal = response.totalElements;
      },
      error: (error) => {
        console.error('Error loading valid assets:', error);
      }
    });
  }

  onExpiringSoonPageChange(event: PageEvent): void {
    this.currentExpiringSoonPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadExpiringSoonAssets();
  }

  onExpiredPageChange(event: PageEvent): void {
    this.currentExpiredPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadExpiredAssets();
  }

  onValidPageChange(event: PageEvent): void {
    this.currentValidPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadValidAssets();
  }

  getDaysLeft(warrantyDate: string): number {
    const today = new Date();
    const expiry = new Date(warrantyDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isExpiringSoon(warrantyDate: string): boolean {
    return this.getDaysLeft(warrantyDate) <= 7;
  }
}