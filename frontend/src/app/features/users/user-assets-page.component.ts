import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AssetService } from '../../core/services/asset.service';
import { Asset } from '../../core/models';

@Component({
  selector: 'app-user-assets-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-assets">
      <h1>User Assets</h1>
      <div *ngFor="let asset of assets" class="asset-item">
        {{ asset.name }} - {{ asset.assetTag }}
      </div>
    </div>
  `
})
export class UserAssetsPageComponent implements OnInit {
  assets: Asset[] = [];

  constructor(
    private route: ActivatedRoute,
    private assetService: AssetService
  ) {}

  ngOnInit() {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.assetService.getAssetsByUser(+userId).subscribe({
        next: (response) => this.assets = response.content || []
      });
    }
  }
}