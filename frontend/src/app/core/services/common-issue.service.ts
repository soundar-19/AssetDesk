import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface CommonIssue {
  id?: number;
  title: string;
  description?: string;
  steps?: string;
  category?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class CommonIssueService {
  private endpoint = '/common-issues';

  constructor(private api: ApiService) {}

  list(page: number = 0, size: number = 10, q?: string, category?: string): Observable<PageResponse<CommonIssue>> {
    const params: any = {};
    if (q) params.q = q;
    if (category) params.category = category;
    return this.api.getPagedData<CommonIssue>(this.endpoint, page, size, params);
  }

  create(issue: CommonIssue): Observable<CommonIssue> {
    return this.api.post<CommonIssue>(this.endpoint, issue);
  }
}


