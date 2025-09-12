import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-uploader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="file-uploader">
      <div class="upload-area" 
           [class.dragover]="isDragOver"
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)"
           (click)="fileInput.click()">
        <input #fileInput
               type="file"
               [accept]="accept"
               [multiple]="multiple"
               (change)="onFileSelect($event)"
               style="display: none;">
        
        <div class="upload-content">
          <div class="upload-icon">📁</div>
          <p class="upload-text">
            <span *ngIf="!isDragOver">Click to upload or drag and drop</span>
            <span *ngIf="isDragOver">Drop files here</span>
          </p>
          <p class="upload-hint" *ngIf="accept">
            Accepted formats: {{ accept }}
          </p>
        </div>
      </div>

      <div *ngIf="selectedFiles.length > 0" class="file-list">
        <h4>Selected Files:</h4>
        <div *ngFor="let file of selectedFiles; let i = index" class="file-item">
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">({{ formatFileSize(file.size) }})</span>
          <button class="remove-btn" (click)="removeFile(i)">×</button>
        </div>
      </div>

      <div *ngIf="selectedFiles.length > 0" class="upload-actions">
        <button class="btn btn-primary" (click)="uploadFiles()" [disabled]="uploading">
          {{ uploading ? 'Uploading...' : 'Upload Files' }}
        </button>
        <button class="btn btn-secondary" (click)="clearFiles()" [disabled]="uploading">
          Clear All
        </button>
      </div>
    </div>
  `,
  styles: [`
    .file-uploader {
      width: 100%;
    }
    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 0.5rem;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .upload-area:hover, .upload-area.dragover {
      border-color: #007bff;
      background-color: #f8f9fa;
    }
    .upload-content {
      pointer-events: none;
    }
    .upload-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    .upload-text {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
      color: #495057;
    }
    .upload-hint {
      font-size: 0.9rem;
      color: #6c757d;
      margin: 0;
    }
    .file-list {
      margin-top: 1rem;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 0.375rem;
    }
    .file-list h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
    }
    .file-item {
      display: flex;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #dee2e6;
    }
    .file-item:last-child {
      border-bottom: none;
    }
    .file-name {
      flex: 1;
      font-weight: 500;
    }
    .file-size {
      color: #6c757d;
      margin-left: 0.5rem;
    }
    .remove-btn {
      background: none;
      border: none;
      color: #dc3545;
      font-size: 1.25rem;
      cursor: pointer;
      margin-left: 0.5rem;
      padding: 0.25rem;
    }
    .remove-btn:hover {
      background-color: #dc3545;
      color: white;
      border-radius: 50%;
    }
    .upload-actions {
      margin-top: 1rem;
      display: flex;
      gap: 0.5rem;
    }
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 500;
    }
    .btn-primary {
      background-color: #007bff;
      color: white;
    }
    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class FileUploaderComponent {
  @Input() accept: string = '';
  @Input() multiple: boolean = false;
  @Input() maxSize: number = 10 * 1024 * 1024; // 10MB default
  
  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() uploadComplete = new EventEmitter<any>();
  @Output() uploadError = new EventEmitter<string>();

  selectedFiles: File[] = [];
  isDragOver = false;
  uploading = false;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = Array.from(event.dataTransfer?.files || []);
    this.handleFiles(files);
  }

  onFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files || []);
    this.handleFiles(files);
  }

  private handleFiles(files: File[]) {
    const validFiles = files.filter(file => this.validateFile(file));
    
    if (this.multiple) {
      this.selectedFiles = [...this.selectedFiles, ...validFiles];
    } else {
      this.selectedFiles = validFiles.slice(0, 1);
    }
    
    this.filesSelected.emit(this.selectedFiles);
  }

  private validateFile(file: File): boolean {
    if (file.size > this.maxSize) {
      this.uploadError.emit(`File ${file.name} is too large. Maximum size is ${this.formatFileSize(this.maxSize)}`);
      return false;
    }
    return true;
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.filesSelected.emit(this.selectedFiles);
  }

  clearFiles() {
    this.selectedFiles = [];
    this.filesSelected.emit(this.selectedFiles);
  }

  uploadFiles() {
    if (this.selectedFiles.length === 0) return;
    
    this.uploading = true;
    // Emit files for parent component to handle upload
    this.uploadComplete.emit(this.selectedFiles);
  }

  resetUploadState() {
    this.uploading = false;
  }

  completeUpload() {
    this.uploading = false;
    this.selectedFiles = [];
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}