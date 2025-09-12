import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonIssue, CommonIssueService } from '../../core/services/common-issue.service';

@Component({
  selector: 'app-common-issues-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="header">
        <h3>Common Issues & Fixes</h3>
        <div class="actions">
          <input [(ngModel)]="q" placeholder="Search by title" />
          <input [(ngModel)]="category" placeholder="Category" />
          <button class="btn" (click)="load()">Search</button>
        </div>
      </div>
      <div class="list">
        <div class="item" *ngFor="let item of items">
          <div class="title">{{ item.title }}</div>
          <div class="meta">{{ item.category }}</div>
          <div class="desc" *ngIf="item.description">{{ item.description }}</div>
          <div class="steps" *ngIf="item.steps">
            <div class="steps-title">Steps:</div>
            <pre>{{ item.steps }}</pre>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card { background: #fff; padding: 1rem; border-radius: .5rem; box-shadow: 0 2px 4px rgba(0,0,0,.1); }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: .5rem; }
    .actions { display: flex; gap: .5rem; }
    .btn { padding: .5rem 1rem; border: none; border-radius: .375rem; background: #007bff; color: #fff; }
    .item { border: 1px solid #eee; border-radius: .375rem; padding: .75rem; margin-bottom: .75rem; }
    .title { font-weight: 600; }
    .meta { color: #666; font-size: .85rem; margin-bottom: .25rem; }
    pre { background: #f8f9fa; padding: .5rem; border-radius: .375rem; overflow: auto; }
  `]
})
export class CommonIssuesListComponent implements OnInit {
  items: CommonIssue[] = [];
  q = '';
  category = '';

  constructor(private issues: CommonIssueService) {}

  ngOnInit(): void {
    this.load();
  }

  load(page: number = 0) {
    this.issues.list(page, 20, this.q || undefined, this.category || undefined).subscribe({
      next: res => this.items = res.content || [],
      error: () => this.items = []
    });
  }
}


