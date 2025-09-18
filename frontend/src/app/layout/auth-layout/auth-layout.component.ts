import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-layout">
      <!-- Left Side - Image (3/4) -->
      <div class="auth-image-section">
        <img src="/login_page.png" alt="AssetDesk Login" class="auth-image" />
      </div>
      
      <!-- Right Side - Form (1/4) -->
      <div class="auth-form-section">
        <div class="auth-container">
          <div class="auth-header">
            <h1 class="brand-title">AssetDesk</h1>
            <h2>Welcome Back</h2>
            <p>Sign in to your account</p>
          </div>
          
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      height: 100vh;
      display: flex;
      font-family: var(--font-family);
      overflow: hidden;
    }
    
    /* Left Side - Image (3/4) */
    .auth-image-section {
      flex: 3;
      position: relative;
      background: rgb(42, 113, 183);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .auth-image {
      max-width: 80%;
      max-height: 80%;
      object-fit: contain;
    }
    
    /* Right Side - Form (1/4) */
    .auth-form-section {
      flex: 1;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-8);
      min-width: 400px;
    }
    
    .auth-container {
      width: 100%;
      max-width: 350px;
    }
    
    /* Auth Header */
    .auth-header {
      text-align: center;
      margin-bottom: var(--space-8);
    }
    
    .brand-title {
      font-size: 2rem;
      font-weight: 800;
      color: var(--primary-600);
      margin: 0 0 var(--space-4) 0;
      letter-spacing: -0.02em;
    }
    
    .auth-header h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--gray-900);
      margin: 0 0 var(--space-2) 0;
    }
    
    .auth-header p {
      color: var(--gray-600);
      font-size: 0.875rem;
      margin: 0;
    }
    
    /* Responsive Design */
    @media (max-width: 1024px) {
      .auth-layout {
        flex-direction: column;
      }
      
      .auth-image-section {
        flex: none;
        height: 40vh;
      }
      
      .auth-image {
        height: 40vh;
      }
      
      .auth-form-section {
        flex: none;
        min-height: 60vh;
        min-width: auto;
        padding: var(--space-6);
      }
    }
    
    @media (max-width: 768px) {
      .auth-image-section {
        height: 30vh;
      }
      
      .auth-image {
        height: 30vh;
      }
      
      .auth-form-section {
        padding: var(--space-4);
      }
      
      .brand-title {
        font-size: 1.75rem;
      }
      
      .auth-header h2 {
        font-size: 1.25rem;
      }
    }
  `]
})
export class AuthLayoutComponent {}