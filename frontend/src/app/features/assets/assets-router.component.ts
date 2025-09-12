import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleService } from '../../core/services/role.service';
import { AssetsPageComponent } from './assets-page.component';
import { UserAssetsPageComponent } from './user-assets-page.component';

@Component({
  selector: 'app-assets-router',
  standalone: true,
  imports: [CommonModule, AssetsPageComponent, UserAssetsPageComponent],
  template: `
    <app-user-assets-page *ngIf="roleService.isEmployee()"></app-user-assets-page>
    <app-assets-page *ngIf="!roleService.isEmployee()"></app-assets-page>
  `
})
export class AssetsRouterComponent {
  constructor(public roleService: RoleService) {}
}