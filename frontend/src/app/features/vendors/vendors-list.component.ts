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
    <div class="vendors-list">
      <div class="header">
        <button class="btn btn-primary" (click)="createVendor()">
          Add Vendor
        </button>
      </div>

      <app-data-table
        [data]="vendors"
        [columns]="columns"
        [actions]="actions"
        [pagination]="pagination"
        (pageChange)="onPageChange($event)">
      </app-data-table>
    </div>
  `,
  styleUrls: ['./vendors-list.component.css']
})
export class VendorsListComponent implements OnInit {
  vendors: Vendor[] = [];
  pagination: any = null;
  
  columns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'contactPerson', label: 'Contact Person' },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'status', label: 'Status' }
  ];

  actions: TableAction[] = [
    { label: 'Edit', icon: '✏', action: (vendor) => this.editVendor(vendor.id) },
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
    this.vendorService.getVendors(page, 10).subscribe({
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

  onPageChange(page: number) {
    this.loadVendors(page);
  }

  createVendor() {
    this.router.navigate(['/vendors/new']);
  }

  editVendor(id: number) {
    this.router.navigate(['/vendors', id, 'edit']);
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