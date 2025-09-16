import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AssetService } from '../../../core/services/asset.service';
import { VendorService } from '../../../core/services/vendor.service';
import { Asset, AssetCreateRequest, Vendor } from '../../../core/models';
import { ToastService } from '../../../shared/components/toast/toast.service';

import { ASSET_CATEGORIES, ASSET_TYPES, ASSET_STATUSES } from '../../../core/constants/asset.constants';

@Component({
  selector: 'app-asset-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './asset-form.component.html',
  styleUrls: ['./asset-form.component.css']
})
export class AssetFormComponent implements OnInit {
  assetForm: FormGroup;
  vendors: Vendor[] = [];
  isEditMode = false;
  assetId: number | null = null;
  loading = false;

  categories = ASSET_CATEGORIES;
  types: string[] = [...ASSET_TYPES];
  statuses = ASSET_STATUSES;

  constructor(
    private fb: FormBuilder,
    private assetService: AssetService,
    private vendorService: VendorService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    this.assetForm = this.fb.group({
      assetTag: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      category: ['', [Validators.required]],
      type: ['', [Validators.required]],
      model: [''],
      serialNumber: [''],
      purchaseDate: [''],
      warrantyExpiryDate: [''],
      cost: ['', [Validators.min(0.01)]],
      usefulLifeYears: [5, [Validators.required, Validators.min(1), Validators.max(20)]],
      status: ['AVAILABLE', [Validators.required]],
      vendorId: [''],
      totalLicenses: [null],
      usedLicenses: [0],
      licenseExpiryDate: [''],
      licenseKey: [''],
      version: [''],

    });
  }

  ngOnInit() {
    this.loadVendors();
    this.setupConditionalValidation();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.assetId = +id;
      this.loadAsset();
    } else {
      // Check for query parameters to pre-fill form
      const groupName = this.route.snapshot.queryParamMap.get('group');
      const category = this.route.snapshot.queryParamMap.get('category');
      const type = this.route.snapshot.queryParamMap.get('type');
      const vendorId = this.route.snapshot.queryParamMap.get('vendorId');
      
      const patchData: any = {};
      if (groupName) patchData.name = groupName;
      if (category) patchData.category = category;
      if (type) patchData.type = type;
      if (vendorId) patchData.vendorId = vendorId;
      
      if (Object.keys(patchData).length > 0) {
        this.assetForm.patchValue(patchData);
      }
    }
  }

  setupConditionalValidation() {
    this.assetForm.get('category')?.valueChanges.subscribe(category => {
      this.updateAvailableTypes(category);
      this.assetForm.get('type')?.setValue(''); // Reset type when category changes
    });
    
    this.assetForm.get('type')?.valueChanges.subscribe(type => {
      this.updateFieldRequirements(type);
    });
  }

  updateAvailableTypes(category: string) {
    switch (category) {
      case 'HARDWARE':
        this.types = ['LAPTOP', 'DESKTOP', 'MONITOR', 'PRINTER', 'TABLET'];
        break;
      case 'SOFTWARE':
        this.types = ['LICENSE'];
        break;
      case 'ACCESSORIES':
        this.types = ['KEYBOARD', 'MOUSE', 'HEADSET', 'WEBCAM', 'CABLE', 'ADAPTER', 'CHARGER', 'DOCKING_STATION'];
        break;
      default:
        this.types = [...ASSET_TYPES];
    }
  }

  updateFieldRequirements(type: string) {
    const modelControl = this.assetForm.get('model');
    const serialNumberControl = this.assetForm.get('serialNumber');
    const totalLicensesControl = this.assetForm.get('totalLicenses');
    const versionControl = this.assetForm.get('version');

    // Clear existing validators
    modelControl?.clearValidators();
    serialNumberControl?.clearValidators();
    totalLicensesControl?.clearValidators();
    versionControl?.clearValidators();

    if (type === 'LICENSE') {
      // License specific fields are required
      totalLicensesControl?.setValidators([Validators.required, Validators.min(1)]);
      versionControl?.setValidators([Validators.required]);
    } else {
      // Hardware may need model and serial
      if (['LAPTOP', 'DESKTOP', 'MONITOR', 'PRINTER', 'TABLET'].includes(type)) {
        modelControl?.setValidators([Validators.required]);
        serialNumberControl?.setValidators([Validators.required]);
      }
    }

    // Update validity
    modelControl?.updateValueAndValidity();
    serialNumberControl?.updateValueAndValidity();
    totalLicensesControl?.updateValueAndValidity();
    versionControl?.updateValueAndValidity();
  }

  isFieldVisible(fieldName: string): boolean {
    const type = this.assetForm.get('type')?.value;
    
    switch (fieldName) {
      case 'model':
      case 'serialNumber':
        return ['LAPTOP', 'DESKTOP', 'MONITOR', 'PRINTER', 'TABLET'].includes(type);
      case 'totalLicenses':
      case 'licenseKey':
      case 'version':
      case 'licenseExpiryDate':
        return type === 'LICENSE';
      default:
        return true;
    }
  }

  loadVendors() {
    this.vendorService.getActiveVendors(0, 100).subscribe({
      next: (response) => {
        this.vendors = response.content;
      },
      error: () => {
        this.toastService.error('Failed to load vendors');
      }
    });
  }

  loadAsset() {
    if (this.assetId) {
      this.assetService.getAssetById(this.assetId).subscribe({
        next: (asset) => {
          this.assetForm.patchValue({
            ...asset,
            vendorId: asset.vendor?.id || ''
          });
        },
        error: () => {
          this.toastService.error('Failed to load asset');
          this.router.navigate(['/assets']);
        }
      });
    }
  }

  onSubmit() {
    if (this.assetForm.valid) {
      this.loading = true;
      const formData = { ...this.assetForm.value };
      
      if (!formData.vendorId) {
        delete formData.vendorId;
      }

      const request = this.isEditMode 
        ? this.assetService.updateAsset(this.assetId!, formData)
        : this.assetService.createAsset(formData);

      request.subscribe({
        next: () => {
          this.toastService.success(`Asset ${this.isEditMode ? 'updated' : 'created'} successfully`);
          this.loading = false;
          
          const groupName = this.route.snapshot.queryParamMap.get('group');
          if (groupName && !this.isEditMode) {
            this.router.navigate(['/assets/group', encodeURIComponent(groupName)]);
          } else {
            this.router.navigate(['/assets']);
          }
        },
        error: () => {
          this.toastService.error(`Failed to ${this.isEditMode ? 'update' : 'create'} asset`);
          this.loading = false;
        }
      });
    }
  }



  cancel() {
    const groupName = this.route.snapshot.queryParamMap.get('group');
    if (groupName) {
      this.router.navigate(['/assets/group', encodeURIComponent(groupName)]);
    } else {
      this.router.navigate(['/assets']);
    }
  }
}