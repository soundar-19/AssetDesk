import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiceRecordService } from '../../core/services/service-record.service';
import { ServiceRecord } from '../../core/models';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-service-record-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="service-record-detail" *ngIf="serviceRecord">
      <div class="header">
        <h2>Service Record Details</h2>
        <div class="actions">
          <button class="btn btn-primary" (click)="editRecord()">Edit</button>
          <button class="btn btn-secondary" (click)="goBack()">Back</button>
        </div>
      </div>

      <div class="details-card">
        <div class="detail-row">
          <label>Service Type:</label>
          <span>{{ serviceRecord.serviceType }}</span>
        </div>
        <div class="detail-row">
          <label>Service Date:</label>
          <span>{{ serviceRecord.serviceDate | date }}</span>
        </div>
        <div class="detail-row">
          <label>Description:</label>
          <span>{{ serviceRecord.description }}</span>
        </div>
        <div class="detail-row">
          <label>Cost:</label>
          <span>{{ serviceRecord.cost | currency }}</span>
        </div>
        <div class="detail-row">
          <label>Status:</label>
          <span>{{ serviceRecord.status }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .service-record-detail { padding: 1rem; max-width: 800px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .actions { display: flex; gap: 1rem; }
    .details-card { background: white; border: 1px solid #ddd; border-radius: 0.5rem; padding: 1.5rem; }
    .detail-row { display: flex; margin-bottom: 1rem; }
    .detail-row label { font-weight: 600; min-width: 150px; color: #555; }
    .detail-row span { color: #333; }
    .btn { padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500; }
    .btn-primary { background-color: #007bff; color: white; }
    .btn-secondary { background-color: #6c757d; color: white; }
  `]
})
export class ServiceRecordDetailComponent implements OnInit {
  serviceRecord: ServiceRecord | null = null;
  serviceRecordId: number | null = null;

  constructor(
    private serviceRecordService: ServiceRecordService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.serviceRecordId = +id;
      this.loadServiceRecord(this.serviceRecordId);
    }
  }

  loadServiceRecord(id: number) {
    this.serviceRecordService.getServiceRecordById(id).subscribe({
      next: (record) => {
        this.serviceRecord = record;
      },
      error: () => {
        this.toastService.error('Failed to load service record');
        this.goBack();
      }
    });
  }

  editRecord() {
    this.router.navigate(['/service-records', this.serviceRecordId, 'edit']);
  }

  goBack() {
    this.router.navigate(['/service-records']);
  }
}