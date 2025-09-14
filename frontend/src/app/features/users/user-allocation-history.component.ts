import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-allocation-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-history">
      <h1>User Allocation History</h1>
      <p>History for user ID: {{ userId }}</p>
    </div>
  `
})
export class UserAllocationHistoryComponent implements OnInit {
  userId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');
  }
}