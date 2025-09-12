import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleService } from '../../core/services/role.service';
import { IssuesListComponent } from './issues-list/issues-list.component';
import { MyIssuesComponent } from './my-issues/my-issues.component';

@Component({
  selector: 'app-issues-router',
  standalone: true,
  imports: [CommonModule, IssuesListComponent, MyIssuesComponent],
  template: `
    <app-my-issues *ngIf="roleService.isEmployee()"></app-my-issues>
    <app-issues-list *ngIf="!roleService.isEmployee()"></app-issues-list>
  `
})
export class IssuesRouterComponent {
  constructor(public roleService: RoleService) {}
}