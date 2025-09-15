import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { InputModalConfig } from './input-modal.component';

@Injectable({
  providedIn: 'root'
})
export class InputModalService {
  private modalSubject = new Subject<{ config: InputModalConfig; resolve: (value: string | null) => void }>();
  
  modalState$ = this.modalSubject.asObservable();

  prompt(config: InputModalConfig): Promise<string | null> {
    return new Promise((resolve) => {
      this.modalSubject.next({ config, resolve });
    });
  }

  // Convenience methods for common prompt types
  promptText(title: string, message?: string, placeholder?: string, defaultValue?: string, required = true): Promise<string | null> {
    return this.prompt({
      title,
      message,
      placeholder,
      defaultValue,
      inputType: 'text',
      required
    });
  }

  promptPassword(title: string, message?: string, minLength = 6): Promise<string | null> {
    return this.prompt({
      title,
      message,
      placeholder: 'Enter password...',
      inputType: 'password',
      required: true,
      minLength
    });
  }

  promptNumber(title: string, message?: string, placeholder?: string, required = true): Promise<string | null> {
    return this.prompt({
      title,
      message,
      placeholder,
      inputType: 'number',
      required
    });
  }

  promptDate(title: string, message?: string, defaultValue?: string): Promise<string | null> {
    return this.prompt({
      title,
      message,
      defaultValue,
      inputType: 'date',
      required: true
    });
  }

  promptTextarea(title: string, message?: string, placeholder?: string, defaultValue?: string, required = true): Promise<string | null> {
    return this.prompt({
      title,
      message,
      placeholder,
      defaultValue,
      inputType: 'textarea',
      required
    });
  }
}