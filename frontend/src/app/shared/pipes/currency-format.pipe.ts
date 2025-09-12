import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number | string, currency: string = 'INR'): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) {
      return '';
    }

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(numValue);
  }
}