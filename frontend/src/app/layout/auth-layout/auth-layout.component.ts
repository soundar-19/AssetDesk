import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-layout">
      <div class="auth-container">
        <div class="auth-header">
          <h1>AssetDesk</h1>
          <p>Asset Management System</p>
        </div>
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--gray-50);
      padding: var(--space-4);
    }
    .auth-container {
      background: white;
      padding: var(--space-8);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--gray-200);
      width: 100%;
      max-width: 400px;
    }
    .auth-header {
      text-align: center;
      margin-bottom: var(--space-8);
    }
    .auth-header h1 {
      color: var(--gray-900);
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 var(--space-2) 0;
    }
    .auth-header p {
      color: var(--gray-600);
      margin: 0;
      font-size: 0.875rem;
    }
  `]
})
export class AuthLayoutComponent {}