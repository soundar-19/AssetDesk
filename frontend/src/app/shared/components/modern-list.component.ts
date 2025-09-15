import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ListItem {
  id: number;
  title: string;
  subtitle?: string;
  status?: string;
  badge?: string;
  avatar?: string;
  metadata?: { label: string; value: string }[];
  actions?: { label: string; icon: string; action: () => void; primary?: boolean }[];
}

@Component({
  selector: 'app-modern-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modern-list">
      <div class="list-container">
        <div *ngFor="let item of items" 
             class="list-item" 
             [class.clickable]="clickable"
             (click)="onItemClick(item)">
          
          <div class="item-content">
            <div class="item-header">
              <h3 class="item-title">{{ item.title }}</h3>
              <div class="item-badges">
                <span *ngIf="item.status" class="status-badge" [class]="'status-' + item.status.toLowerCase()">
                  {{ item.status }}
                </span>
                <span *ngIf="item.badge" class="info-badge">{{ item.badge }}</span>
              </div>
            </div>
            
            <p *ngIf="item.subtitle" class="item-subtitle">{{ item.subtitle }}</p>
            
            <div class="item-metadata" *ngIf="item.metadata?.length">
              <div *ngFor="let meta of item.metadata" class="meta-item">
                <span class="meta-label">{{ meta.label }}:</span>
                <span class="meta-value">{{ meta.value }}</span>
              </div>
            </div>
          </div>
          
          <div class="item-actions" *ngIf="item.actions?.length" (click)="$event.stopPropagation()">
            <button *ngFor="let action of item.actions" 
                    class="action-btn"
                    [class.primary]="action.primary"
                    (click)="action.action()">
              <span class="action-icon">{{ action.icon }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modern-list {
      background: #f8fafc;
      border-radius: 1rem;
    }

    .list-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1.5rem;
    }

    .list-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: all 0.2s ease;
      border: 1px solid transparent;
      min-height: 120px;
      width: 100%;
    }

    .list-item:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateY(-1px);
    }

    .list-item.clickable {
      cursor: pointer;
    }

    .list-item.clickable:hover {
      border-color: #3b82f6;
    }

    .item-content {
      flex: 1;
      min-width: 0;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }

    .item-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    .item-badges {
      display: flex;
      gap: 0.5rem;
    }

    .status-badge, .info-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-active { background: #dcfce7; color: #166534; }
    .status-inactive { background: #fee2e2; color: #dc2626; }
    .status-pending { background: #fef3c7; color: #d97706; }
    .status-available { background: #dcfce7; color: #166534; }
    .status-allocated { background: #dbeafe; color: #2563eb; }

    .info-badge {
      background: #f1f5f9;
      color: #475569;
    }

    .item-subtitle {
      color: #6b7280;
      font-size: 0.875rem;
      margin: 0 0 0.75rem 0;
    }

    .item-metadata {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .meta-item {
      font-size: 0.75rem;
    }

    .meta-label {
      color: #6b7280;
      font-weight: 500;
    }

    .meta-value {
      color: #1f2937;
      font-weight: 600;
      margin-left: 0.25rem;
    }

    .item-actions {
      display: flex;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: 1px solid #e2e8f0;
      background: white;
      border-radius: 50%;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .action-btn:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
      transform: scale(1.1);
    }

    .action-btn.primary {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }

    .action-btn.primary:hover {
      background: #2563eb;
    }
    
    @media (max-width: 1024px) {
      .list-container {
        padding: 1rem;
      }
      
      .list-item {
        padding: 1rem;
        min-height: 100px;
      }
    }
    
    @media (max-width: 768px) {
      .list-container {
        gap: 0.5rem;
        padding: 0.75rem;
      }
      
      .list-item {
        flex-direction: column;
        align-items: stretch;
        padding: 1rem;
        gap: 0.75rem;
        min-height: auto;
      }
      
      .item-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
      
      .item-metadata {
        gap: 1rem;
      }
      
      .item-actions {
        align-self: flex-end;
      }
    }
    
    @media (max-width: 480px) {
      .list-container {
        padding: 0.5rem;
      }
      
      .list-item {
        padding: 0.75rem;
      }
      
      .item-metadata {
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .item-actions {
        align-self: stretch;
        justify-content: center;
      }
    }
  `]
})
export class ModernListComponent {
  @Input() items: ListItem[] = [];
  @Input() clickable = true;
  
  @Output() itemClick = new EventEmitter<ListItem>();

  onItemClick(item: ListItem) {
    if (this.clickable) {
      this.itemClick.emit(item);
    }
  }
}