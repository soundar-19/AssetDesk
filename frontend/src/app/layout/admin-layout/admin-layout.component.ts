import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { AppSidenavComponent } from '../../shared/components/app-sidenav/app-sidenav.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AppHeaderComponent, AppSidenavComponent],
  template: `
    <div class="app-layout">
      <app-sidenav [collapsed]="sidebarCollapsed"></app-sidenav>
      <div class="main-content">
        <app-header (sidebarToggle)="toggleSidebar()"></app-header>
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      height: 100vh;
      background-color: var(--gray-50);
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .page-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-8);
    }
  `]
})
export class AdminLayoutComponent {
  sidebarCollapsed = false;

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}