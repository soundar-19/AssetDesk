import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from './api.service';

export interface AnalyticsData {
  assetsByCategory: { [key: string]: number };
  assetsByStatus: { [key: string]: number };
  assetsByType: { [key: string]: number };
  costAnalysis: {
    totalValue: number;
    averageValue: number;
    highestValue: number;
    lowestValue: number;
  };
  depreciationAnalysis: {
    totalDepreciation: number;
    averageDepreciation: number;
    depreciationByCategory: { [key: string]: number };
  };
  warrantyAnalysis: {
    expiredCount: number;
    expiringCount: number;
    validCount: number;
    expiringAssets: Array<{
      id: number;
      name: string;
      warrantyEndDate: string;
      daysRemaining: number;
    }>;
  };
  utilizationMetrics: {
    allocationRate: number;
    availabilityRate: number;
    maintenanceRate: number;
    retiredRate: number;
  };
  trends: {
    monthlyAcquisitions: { [key: string]: number };
    monthlyAllocations: { [key: string]: number };
    monthlyMaintenance: { [key: string]: number };
  };
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private endpoint = '/analytics';

  constructor(private api: ApiService) {}

  getAnalyticsData(): Observable<AnalyticsData> {
    // Use mock data for now, switch to real API when ready
    return this.getMockAnalyticsData();
    // return this.api.get<AnalyticsData>(`${this.endpoint}/dashboard`);
  }

  getAssetAnalytics(filters?: any): Observable<AnalyticsData> {
    return this.api.get<AnalyticsData>(`${this.endpoint}/assets`, filters);
  }

  getDepreciationReport(asOfDate?: string): Observable<any> {
    const params = asOfDate ? { asOfDate } : {};
    return this.api.get<any>(`${this.endpoint}/depreciation`, params);
  }

  getWarrantyReport(): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/warranty`);
  }

  getUtilizationReport(): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/utilization`);
  }

  exportAnalyticsReport(options: any): Observable<Blob> {
    const params = new URLSearchParams();
    Object.keys(options).forEach(key => {
      if (options[key] === true) {
        params.append(key, 'true');
      }
    });
    const queryString = params.toString();
    const url = queryString ? `${this.endpoint}/export/pdf?${queryString}` : `${this.endpoint}/export/pdf`;
    return this.api.getBlob(url);
  }

  // Mock data for development - remove when backend is ready
  getMockAnalyticsData(): Observable<AnalyticsData> {
    const mockData: AnalyticsData = {
      assetsByCategory: {
        'HARDWARE': 45,
        'SOFTWARE': 23,
        'ACCESSORIES': 12
      },
      assetsByStatus: {
        'AVAILABLE': 32,
        'ALLOCATED': 38,
        'MAINTENANCE': 8,
        'RETIRED': 2
      },
      assetsByType: {
        'LAPTOP': 25,
        'DESKTOP': 15,
        'MONITOR': 20,
        'LICENSE': 23,
        'PRINTER': 5,
        'ACCESSORIES': 12
      },
      costAnalysis: {
        totalValue: 125000,
        averageValue: 1562.5,
        highestValue: 3500,
        lowestValue: 50
      },
      depreciationAnalysis: {
        totalDepreciation: 25000,
        averageDepreciation: 312.5,
        depreciationByCategory: {
          'HARDWARE': 20000,
          'SOFTWARE': 3000,
          'ACCESSORIES': 2000
        }
      },
      warrantyAnalysis: {
        expiredCount: 8,
        expiringCount: 12,
        validCount: 60,
        expiringAssets: [
          { id: 1, name: 'Dell Laptop XPS', warrantyEndDate: '2024-02-15', daysRemaining: 25 },
          { id: 2, name: 'HP Printer LaserJet', warrantyEndDate: '2024-02-28', daysRemaining: 38 }
        ]
      },
      utilizationMetrics: {
        allocationRate: 47.5,
        availabilityRate: 40.0,
        maintenanceRate: 10.0,
        retiredRate: 2.5
      },
      trends: {
        monthlyAcquisitions: {
          'Jan': 5,
          'Feb': 8,
          'Mar': 12,
          'Apr': 6,
          'May': 9,
          'Jun': 15
        },
        monthlyAllocations: {
          'Jan': 8,
          'Feb': 12,
          'Mar': 15,
          'Apr': 10,
          'May': 14,
          'Jun': 18
        },
        monthlyMaintenance: {
          'Jan': 2,
          'Feb': 3,
          'Mar': 5,
          'Apr': 1,
          'May': 4,
          'Jun': 3
        }
      }
    };

    return of(mockData);
  }
}