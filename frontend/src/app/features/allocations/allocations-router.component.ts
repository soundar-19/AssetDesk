import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleService } from '../../core/services/role.service';
import { ModernAllocationsComponent } from './modern-allocations.component';
import { RoleBasedAllocationsComponent } from './role-based-allocations.component';

@Component({
  selector: 'app-allocations-router',
  standalone: true,
  imports: [CommonModule, ModernAllocationsComponent, RoleBasedAllocationsComponent],
  template: `
    <div class="allocations-container">
      <app-modern-allocations *ngIf="showModernView"></app-modern-allocations>
      <app-role-based-allocations *ngIf="!showModernView"></app-role-based-allocations>
    </div>
  `,
  styles: [`
    .allocations-container {
      min-height: 100vh;
      background: var(--gray-50);
    }
  `]
})
export class AllocationsRouterComponent {
  showModernView = true;

  constructor(public roleService: RoleService) {}
}