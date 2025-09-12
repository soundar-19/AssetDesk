import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllocationService } from '../../core/services/allocation.service';
import { AssetAllocation } from '../../core/models';
import { DataTableComponent, TableColumn, TableAction } from '../../shared/components/data-table/data-table.component';
import { RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-allocations-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  template: `
    <div class="allocations-list">
      <div class="header">
        <h2>Asset Allocations</h2>
      </div>

      <div class="filters">
        <select class="filter-select" (change)="filterAllocations($event)">
          <option value="">All Allocations</option>
          <option value="active">Active</option>
          <option value="returned">Returned</option>
        </select>
      </div>

      <app-data-table
        [data]="allocations"
        [columns]="columns"
        [actions]="actions"
        [pagination]="pagination"
        (pageChange)="onPageChange($event)">
      </app-data-table>
    </div>
  `,
  styles: [`
    .allocations-list { padding: 1rem; }
    .header { margin-bottom: 1rem; }
    .header h2 { margin: 0; color: #333; }
    .filters { margin-bottom: 1rem; }
    .filter-select { padding: 0.5rem; border: 1px solid #ddd; border-radius: 0.375rem; }
  `]
})
export class AllocationsListComponent implements OnInit {
  allocations: AssetAllocation[] = [];
  pagination: any = null;
  currentFilter = '';
  
  columns: TableColumn[] = [
    { key: 'assetTag', label: 'Asset Tag' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'userName', label: 'Allocated To' },
    { key: 'allocatedDate', label: 'Allocated Date' },
    { key: 'returnedDate', label: 'Returned Date' },
    { key: 'remarks', label: 'Remarks' }
  ];

  actions: TableAction[] = [
    {
      label: 'View Details',
      icon: '👁',
      action: (allocation) => this.viewAllocation(allocation.id)
    }
  ];

  constructor(
    private allocationService: AllocationService,
    public roleService: RoleService
  ) {}

  ngOnInit() {
    this.loadAllocations();
  }

  loadAllocations(page: number = 0) {
    const request = this.currentFilter === 'active' 
      ? this.allocationService.getActiveAllocations(page, 10)
      : this.allocationService.getAllocations(page, 10);

    request.subscribe({
      next: (response) => {
        this.allocations = response?.content || [];
        this.pagination = {
          page: response?.number || 0,
          totalPages: response?.totalPages || 0,
          totalElements: response?.totalElements || 0
        };
      },
      error: (error) => {
        console.error('Failed to load allocations:', error);
        this.allocations = [];
        this.pagination = { page: 0, totalPages: 0, totalElements: 0 };
      }
    });
  }

  onPageChange(page: number) {
    this.loadAllocations(page);
  }

  filterAllocations(event: any) {
    this.currentFilter = event.target.value;
    this.loadAllocations();
  }

  viewAllocation(id: number) {
    // Navigate to allocation details
  }
}