import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusBadge',
  standalone: true
})
export class StatusBadgePipe implements PipeTransform {
  transform(status: string): string {
    if (!status) return '';

    const statusLower = status.toLowerCase();
    let badgeClass = '';
    
    switch (statusLower) {
      case 'available':
      case 'active':
      case 'completed':
      case 'resolved':
        badgeClass = 'badge-success';
        break;
      case 'allocated':
      case 'in_progress':
      case 'pending':
        badgeClass = 'badge-primary';
        break;
      case 'maintenance':
      case 'warning':
        badgeClass = 'badge-warning';
        break;
      case 'retired':
      case 'inactive':
      case 'cancelled':
        badgeClass = 'badge-secondary';
        break;
      case 'lost':
      case 'damaged':
      case 'error':
        badgeClass = 'badge-danger';
        break;
      default:
        badgeClass = 'badge-info';
    }

    return `<span class="badge ${badgeClass}">${status}</span>`;
  }
}