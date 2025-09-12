import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class ValidationUtils {
  private static readonly ASSET_TAG_PATTERN = /^[A-Z]{2}\d{3,6}$/;
  private static readonly PHONE_PATTERN = /^\+?[\d\s\-\(\)]{10,}$/;

  static assetTagValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return this.ASSET_TAG_PATTERN.test(control.value) ? null : { invalidAssetTag: true };
    };
  }

  static phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return this.PHONE_PATTERN.test(control.value) ? null : { invalidPhone: true };
    };
  }

  static positiveNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return control.value > 0 ? null : { notPositive: true };
    };
  }

  static futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const inputDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return inputDate >= today ? null : { pastDate: true };
    };
  }
}