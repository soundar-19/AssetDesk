import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SSEService {
  private eventSource: EventSource | null = null;
  private updateSubject = new Subject<{type: string, data: any}>();
  
  public updates$ = this.updateSubject.asObservable();

  connect() {
    if (this.eventSource) return;
    
    this.eventSource = new EventSource('/api/events');
    
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.updateSubject.next({ type: event.type, data });
      } catch (error) {
        console.error('SSE parsing error:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}