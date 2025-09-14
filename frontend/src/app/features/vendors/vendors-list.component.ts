import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VendorService } from '../../core/services/vendor.service';
import { Vendor } from '../../core/models';
import { DataTableComponent, TableColumn, TableAction } from '../../shared/components/data-table/data-table.component';
import { SearchFilterComponent, FilterOption, SearchFilters } from '../../shared/components/search-filter/search-filter.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-vendors-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent, SearchFilterComponent],
  template: `
    <div class="vendors-list">
      <div class="header">
        <button class="btn btn-primary" (click)="createVendor()">
          Add Vendor
        </button>
      </div>

      <app-search-filter
        searchPlaceholder="Search vendors by name, email, phone, or contact person..."
        [filterOptions]="filterOptions"
        (search)="onSearch($event)"
        (filtersChange)="onFiltersChange($event)">
      </app-search-filter>

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
  `,
  styleUrls: ['./vendors-list.component.css']
})
export class VendorsListComponent implements OnInit {
  vendors: Vendor[] = [];
  pagination: any = null;
  searchTerm = '';
  filters: SearchFilters = {};
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  columns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'contactPerson', label: 'Contact Person', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phoneNumber', label: 'Phone', sortable: true },
    { key: 'status', label: 'Status', sortable: true }
  ];

  filterOptions: FilterOption[] = [
    {
      key: 'contactPerson',
      label: 'Contact Person',
      type: 'text',
      placeholder: 'Filter by contact person'
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' }
      ]
    }
  ];

  actions: TableAction[] = [
    { label: 'Edit', icon: '✏', action: (vendor) => this.editVendor(vendor.id) },
    { label: 'View Assets', icon: '📦', action: (vendor) => this.viewVendorAssets(vendor.id) },
    { label: 'View Services', icon: '🔧', action: (vendor) => this.viewVendorServices(vendor.id) },
    { label: 'Delete', icon: '🗑', action: (vendor) => this.deleteVendor(vendor.id) }
  ];

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
    const hasFilters = Object.values(this.filters).some(value => value !== null && value !== undefined && value !== '');
    
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
    
    // Add individual filters
    Object.keys(this.filters).forEach(key => {
      const value = this.filters[key];
      if (value !== null && value !== undefined && value !== '') {
        searchParams[key] = value;
      }
    });

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

  onFiltersChange(filters: SearchFilters) {
    this.filters = filters;
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
}