import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { InputModalComponent, InputModalConfig } from './input-modal.component';
import { InputModalService } from './input-modal.service';

@Component({
  selector: 'app-input-modal-container',
  standalone: true,
  imports: [CommonModule, InputModalComponent],
  template: `
    <app-input-modal
      [visible]="visible"
      [config]="config"
      (confirm)="onConfirm($event)"
      (cancel)="onCancel()">
    </app-input-modal>
  `
})
export class InputModalContainerComponent implements OnInit, OnDestroy {
  visible = false;
  config: InputModalConfig = { title: '' };
  private currentResolve: ((value: string | null) => void) | null = null;
  private subscription?: Subscription;

  constructor(private inputModalService: InputModalService) {}

  ngOnInit() {
    this.subscription = this.inputModalService.modalState$.subscribe(({ config, resolve }) => {
      this.config = config;
      this.currentResolve = resolve;
      this.visible = true;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  onConfirm(value: string) {
    this.visible = false;
    if (this.currentResolve) {
      this.currentResolve(value);
      this.currentResolve = null;
    }
  }

  onCancel() {
    this.visible = false;
    if (this.currentResolve) {
      this.currentResolve(null);
      this.currentResolve = null;
    }
  }
}