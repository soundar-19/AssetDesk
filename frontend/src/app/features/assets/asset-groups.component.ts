import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AssetService } from '../../core/services/asset.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-asset-groups',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="asset-groups">
      <div class="header">
        <h2>Asset Groups</h2>
        <button class="btn btn-secondary" (click)="viewAllAssets()">View All Assets</button>
      </div>

      <div class="groups-grid">
        <div *ngFor="let group of assetGroups" class="group-card clickable" (click)="viewGroupAssets(group.name)">
          <div class="group-name">{{ group.name }}</div>
          <div class="group-count">{{ group.count }} assets</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .asset-groups { padding: 1rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .header h2 { margin: 0; color: #333; }
    .btn { padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500; }
    .btn-secondary { background-color: #6c757d; color: white; }
    .groups-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
    .group-card { 
      background: white; 
      border: 1px solid #ddd; 
      border-radius: 0.5rem; 
      padding: 1.5rem; 
      cursor: pointer; 
      transition: all 0.2s;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .group-card:hover { 
      transform: translateY(-2px); 
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      border-color: #007bff;
    }
    .group-card.clickable {
      cursor: pointer;
    }

    .group-card.clickable * {
      pointer-events: none;
    }
    .group-name { font-size: 1.1rem; font-weight: 600; color: #333; margin-bottom: 0.5rem; }
    .group-count { color: #666; font-size: 0.9rem; }
  `]
})
export class AssetGroupsComponent implements OnInit {
  assetGroups: {name: string, count: number}[] = [];

  constructor(
    private assetService: AssetService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadAssetGroups();
  }

  loadAssetGroups() {
    this.assetService.getAssetGroups().subscribe({
      next: (groups) => {
        this.assetGroups = groups;
      },
      error: () => {
        this.toastService.error('Failed to load asset groups');
      }
    });
  }

  viewGroupAssets(name: string) {
    this.router.navigate(['/assets/group', name]);
  }

  viewAllAssets() {
    this.router.navigate(['/assets']);
  }
}