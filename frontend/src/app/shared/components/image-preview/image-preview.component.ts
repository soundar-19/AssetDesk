import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="image-preview" *ngIf="imageUrl">
      <div class="preview-container">
        <img [src]="imageUrl" [alt]="altText" (load)="onImageLoad()" (error)="onImageError()">
        <div class="overlay" *ngIf="showOverlay">
          <button class="btn btn-primary" (click)="openFullSize()">View Full Size</button>
          <button class="btn btn-danger" (click)="removeImage()" *ngIf="allowRemove">Remove</button>
        </div>
      </div>
    </div>
    
    <div class="no-image" *ngIf="!imageUrl && showPlaceholder">
      <div class="placeholder">
        <span class="icon">🖼️</span>
        <p>No image available</p>
      </div>
    </div>

    <!-- Full size modal -->
    <div class="modal" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <button class="close-btn" (click)="closeModal()">×</button>
        <img [src]="imageUrl" [alt]="altText">
      </div>
    </div>
  `,
  styles: [`
    .image-preview {
      position: relative;
      display: inline-block;
    }
    .preview-container {
      position: relative;
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .preview-container img {
      width: 100%;
      height: auto;
      max-width: 300px;
      max-height: 200px;
      object-fit: cover;
      display: block;
    }
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .preview-container:hover .overlay {
      opacity: 1;
    }
    .no-image {
      width: 300px;
      height: 200px;
      border: 2px dashed #ddd;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .placeholder {
      text-align: center;
      color: #666;
    }
    .placeholder .icon {
      font-size: 2rem;
      display: block;
      margin-bottom: 0.5rem;
    }
    .placeholder p {
      margin: 0;
      font-size: 0.875rem;
    }
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.875rem;
    }
    .btn-primary {
      background-color: #007bff;
      color: white;
    }
    .btn-danger {
      background-color: #dc3545;
      color: white;
    }
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
    }
    .modal-content img {
      width: 100%;
      height: auto;
      border-radius: 0.5rem;
    }
    .close-btn {
      position: absolute;
      top: -40px;
      right: 0;
      background: none;
      border: none;
      color: white;
      font-size: 2rem;
      cursor: pointer;
    }
  `]
})
export class ImagePreviewComponent {
  @Input() imageUrl: string = '';
  @Input() altText: string = 'Image';
  @Input() showPlaceholder: boolean = true;
  @Input() allowRemove: boolean = false;
  @Input() showOverlay: boolean = true;
  
  @Output() imageRemoved = new EventEmitter<void>();
  @Output() imageClicked = new EventEmitter<string>();

  showModal = false;

  onImageLoad() {
    // Image loaded successfully
  }

  onImageError() {
    // Handle image load error
    this.imageUrl = '';
  }

  openFullSize() {
    this.showModal = true;
    this.imageClicked.emit(this.imageUrl);
  }

  closeModal() {
    this.showModal = false;
  }

  removeImage() {
    this.imageRemoved.emit();
  }
}