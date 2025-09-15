import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VendorService } from '../../core/services/vendor.service';
import { Vendor } from '../../core/models';
import { DataTableComponent, TableColumn, TableAction } from '../../shared/components/data-table/data-table.component';

import { ToastService } from '../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-vendors-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Vendors</h1>
          <p class="page-description">Manage vendor information and contacts</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="loadVendors()">
            🔄 Refresh
          </button>
          <button class="btn btn-primary" (click)="createVendor()">
            + Add Vendor
          </button>
        </div>
      </div>

      <!-- Table Section -->
      <div class="table-section">
        <!-- Vendors Table -->
        <div class="data-table-container" *ngIf="vendors.length > 0">
          <app-data-table
            [data]="vendors"
            [columns]="columns"
            [actions]="actions"
            [pagination]="pagination"
            [sortColumn]="sortColumn"
            [sortDirection]="sortDirection"
            [rowClickAction]="viewVendor.bind(this)"
            (pageChange)="onPageChange($event)"
            (sort)="onSort($event)">
          </app-data-table>
        </div>

        <!-- Empty State -->
        <div *ngIf="vendors.length === 0" class="empty-state">
          <div class="empty-icon">🏢</div>
          <h3>No vendors found</h3>
          <p>No vendors have been added yet.</p>
          <button class="btn btn-primary" (click)="createVendor()">
            Add First Vendor
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./vendors-list.component.css']
})
export class VendorsListComponent implements OnInit {
  vendors: Vendor[] = [];
  pagination: any = null;
  searchTerm = '';

  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  columns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true, render: (vendor: any) => this.getNameBadge(vendor.name) },
    { key: 'contactPerson', label: 'Contact Person', sortable: true },
    { key: 'email', label: 'Email', sortable: true, render: (vendor: any) => this.getEmailBadge(vendor.email) },
    { key: 'phoneNumber', label: 'Phone', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (vendor: any) => this.getStatusBadge(vendor.status) }
  ];



  actions: TableAction[] = [];

  constructor(
    private vendorService: VendorService,
    private router: Router,
    private toastService: ToastService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit() {
    this.loadVendors();
  }

  loadVendors(page: number = 0) {
    const hasSearch = this.searchTerm && this.searchTerm.trim() !== '';
    const hasFilters = false;
    
    if (hasSearch || hasFilters) {
      this.searchVendors(page);
    } else {
      this.vendorService.getVendors(page, 10, this.sortColumn, this.sortDirection).subscribe({
        next: (response) => {
          this.vendors = response?.content || [];
          this.pagination = {
            page: response?.number || 0,
            totalPages: response?.totalPages || 0,
            totalElements: response?.totalElements || 0
          };
        },
        error: (error) => {
          console.error('Failed to load vendors:', error);
          this.vendors = [];
          this.pagination = { page: 0, totalPages: 0, totalElements: 0 };
          this.toastService.error('Failed to load vendors');
        }
      });
    }
  }

  searchVendors(page: number = 0) {
    const searchParams: any = {
      sortBy: this.sortColumn,
      sortDir: this.sortDirection
    };
    
    // Add search term to relevant fields if provided
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      searchParams.name = this.searchTerm.trim();
      searchParams.email = this.searchTerm.trim();
      searchParams.phone = this.searchTerm.trim();
    }
    


    this.vendorService.searchVendors(searchParams, page, 10).subscribe({
      next: (response) => {
        this.vendors = response?.content || [];
        this.pagination = {
          page: response?.number || 0,
          totalPages: response?.totalPages || 0,
          totalElements: response?.totalElements || 0
        };
      },
      error: (error) => {
        console.error('Failed to search vendors:', error);
        this.vendors = [];
        this.pagination = { page: 0, totalPages: 0, totalElements: 0 };
        this.toastService.error('Failed to search vendors');
      }
    });
  }

  onSearch(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.loadVendors(0);
  }



  onSort(event: { column: string; direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.loadVendors(0);
  }

  onPageChange(page: number) {
    this.loadVendors(page);
  }

  createVendor() {
    this.router.navigate(['/vendors/new']);
  }

  editVendor(id: number) {
    this.router.navigate(['/vendors', id, 'edit']);
  }

  viewVendor(vendor: any) {
    this.router.navigate(['/vendors', vendor.id || vendor]);
  }

  viewVendorAssets(id: number) {
    this.router.navigate(['/assets'], { queryParams: { vendor: id } });
  }

  viewVendorServices(id: number) {
    this.router.navigate(['/service-records'], { queryParams: { vendor: id } });
  }

  deleteVendor(id: number) {
    this.confirmDialog.confirmDelete('vendor').subscribe(confirmed => {
      if (confirmed) {
        this.vendorService.deleteVendor(id).subscribe({
          next: () => {
            this.toastService.success('Vendor deleted successfully');
            this.loadVendors();
          },
          error: () => {
            this.toastService.error('Failed to delete vendor');
          }
        });
      }
    });
  }

  getStatusBadge(status: string): string {
    const badges: { [key: string]: string } = {
      'ACTIVE': '<span class="badge badge-success">Active</span>',
      'INACTIVE': '<span class="badge badge-error">Inactive</span>'
    };
    return badges[status] || '<span class="badge badge-success">Active</span>';
  }

  getNameBadge(name: string): string {
    return `<span class="badge badge-info">${name}</span>`;
  }

  getEmailBadge(email: string): string {
    return email ? `<span class="badge badge-secondary">${email}</span>` : '<span class="badge badge-warning">No Email</span>';
  }
}