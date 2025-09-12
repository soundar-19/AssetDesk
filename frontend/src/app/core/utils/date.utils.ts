export class DateUtils {
  static formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString();
  }

  static formatDateTime(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString();
  }

  static isExpired(date: string | Date): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
  }

  static daysBetween(date1: string | Date, date2: string | Date): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}