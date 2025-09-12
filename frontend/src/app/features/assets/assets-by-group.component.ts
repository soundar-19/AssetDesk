import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetService } from '../../core/services/asset.service';
import { Asset } from '../../core/models';
import { DataTableComponent, TableColumn, TableAction } from '../../shared/components/data-table/data-table.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-assets-by-group',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  template: `
    <div class="assets-by-group">
      <div class="header">
        <div>
          <button class="btn btn-link" (click)="goBack()">← Back to Groups</button>
          <h2>{{ groupName }}</h2>
        </div>
        <div *ngIf="roleService.canManageAssets()">
          <button class="btn btn-primary" (click)="addAsset()">
            + Add Asset
          </button>
        </div>
      </div>

      <app-data-table
        [data]="assets"
        [columns]="columns"
        [actions]="actions"
        [pagination]="pagination"
        (pageChange)="onPageChange($event)">
      </app-data-table>
    </div>
  `,
  styles: [`
    .assets-by-group { padding: 1rem; }
    .header { margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: flex-start; }
    .header h2 { margin: 0.5rem 0 0 0; color: #333; }
    .btn { padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500; }
    .btn-link { background: none; color: #007bff; text-decoration: none; padding: 0; }
    .btn-link:hover { text-decoration: underline; }
    .btn-primary { background: #007bff; color: white; }
    .btn-primary:hover { background: #0056b3; }
  `]
})
export class AssetsByGroupComponent implements OnInit {
  groupName: string = '';
  assets: Asset[] = [];
  pagination: any = null;
  groupDetails: any = null;
  
  columns: TableColumn[] = [
    { key: 'assetTag', label: 'Asset Tag', sortable: true },
    { key: 'model', label: 'Model' },
    { key: 'serialNumber', label: 'Serial Number' },
    { key: 'category', label: 'Category' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'cost', label: 'Cost' }
  ];

  actions: TableAction[] = [
    { label: 'View', icon: '👁', action: (asset) => this.viewAsset(asset.id) },
    { label: 'Edit', icon: '✏', action: (asset) => this.editAsset(asset.id), condition: () => this.roleService.canManageAssets() }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assetService: AssetService,
    private toastService: ToastService,
    public roleService: RoleService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.groupName = decodeURIComponent(params['name']);
      this.loadAssets();
    });
  }

  loadAssets(page: number = 0) {
    this.assetService.getAssetsByName(this.groupName, page, 10).subscribe({
      next: (response) => {
        this.assets = response.content;
        this.pagination = {
          page: response.number || 0,
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0
        };
        this.loadGroupDetails();
      },
      error: () => {
        this.toastService.error('Failed to load assets');
      }
    });
  }

  onPageChange(page: number) {
    this.loadAssets(page);
  }

  viewAsset(id: number) {
    this.router.navigate(['/assets', id]);
  }

  editAsset(id: number) {
    this.router.navigate(['/assets', id, 'edit']);
  }

  loadGroupDetails() {
    // Get details from the first asset in the group
    if (this.assets.length > 0) {
      this.groupDetails = {
        category: this.assets[0].category,
        type: this.assets[0].type,
        vendorId: this.assets[0].vendor?.id
      };
    }
  }

  addAsset() {
    const queryParams: any = { group: this.groupName };
    
    if (this.groupDetails) {
      if (this.groupDetails.category) queryParams.category = this.groupDetails.category;
      if (this.groupDetails.type) queryParams.type = this.groupDetails.type;
      if (this.groupDetails.vendorId) queryParams.vendorId = this.groupDetails.vendorId;
    }
    
    this.router.navigate(['/assets/new'], { queryParams });
  }

  goBack() {
    this.router.navigate(['/assets/groups']);
  }
}