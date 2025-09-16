import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Issue, IssueRequest, PageResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class IssueService {
  private endpoint = '/issues';

  constructor(private api: ApiService) {}

  getIssues(page: number = 0, size: number = 10): Observable<PageResponse<Issue>> {
    return this.api.getPagedData<Issue>(this.endpoint, page, size);
  }

  getAllIssues(page: number = 0, size: number = 10): Observable<PageResponse<Issue>> {
    return this.api.getPagedData<Issue>(this.endpoint, page, size);
  }

  getAllIssuesIncludingClosed(page: number = 0, size: number = 10): Observable<PageResponse<Issue>> {
    return this.api.getPagedData<Issue>(`${this.endpoint}/all`, page, size);
  }

  getIssueById(id: number): Observable<Issue> {
    return this.api.get<Issue>(`${this.endpoint}/${id}`);
  }

  getIssuesByReportedBy(userId: number, page: number = 0, size: number = 10): Observable<PageResponse<Issue>> {
    return this.api.getPagedData<Issue>(`${this.endpoint}/reported-by/${userId}`, page, size);
  }

  getIssuesByAssignedTo(userId: number, page: number = 0, size: number = 10): Observable<PageResponse<Issue>> {
    return this.api.getPagedData<Issue>(`${this.endpoint}/assigned-to/${userId}`, page, size);
  }

  getIssuesByAsset(assetId: number, page: number = 0, size: number = 10): Observable<PageResponse<Issue>> {
    return this.api.getPagedData<Issue>(`${this.endpoint}/asset/${assetId}`, page, size);
  }

  getIssuesByStatus(status: string, page: number = 0, size: number = 10): Observable<PageResponse<Issue>> {
    return this.api.getPagedData<Issue>(`${this.endpoint}/status/${status}`, page, size);
  }

  getActiveIssues(page: number = 0, size: number = 10): Observable<PageResponse<Issue>> {
    return this.api.getPagedData<Issue>(`${this.endpoint}/active`, page, size);
  }

  getUnassignedIssues(page: number = 0, size: number = 10): Observable<PageResponse<Issue>> {
    return this.api.getPagedData<Issue>(`${this.endpoint}/unassigned`, page, size);
  }

  createIssue(issue: IssueRequest, reportedById: number): Observable<Issue> {
    return this.api.post<Issue>(`${this.endpoint}?reportedById=${reportedById}`, issue).pipe(
      tap(createdIssue => {
        this.sendSystemMessage(createdIssue.id, `Issue created by ${createdIssue.reportedByName}`).subscribe();
      })
    );
  }

  assignIssue(issueId: number, assignedToId: number): Observable<Issue> {
    return this.api.put<Issue>(`${this.endpoint}/${issueId}/assign/${assignedToId}`, null).pipe(
      tap(issue => {
        this.sendSystemMessage(issueId, `Issue assigned to ${issue.assignedToName}`).subscribe();
      })
    );
  }

  private sendStatusNotification(issue: Issue, status: string, message: string): void {
    // Send notification to issue reporter
    this.sendIssueNotification(issue.id, `Issue ${status}`, message, 'ISSUE_UPDATED').subscribe();
  }

  updateIssueStatus(issueId: number, status: string, userId?: number): Observable<Issue> {
    const params = userId ? `?status=${status}&userId=${userId}` : `?status=${status}`;
    return this.api.put<Issue>(`${this.endpoint}/${issueId}/status${params}`, null).pipe(
      tap(() => {
        this.sendSystemMessage(issueId, `Issue status changed to ${status.replace('_', ' ')}`).subscribe();
      })
    );
  }

  updateIssue(id: number, issue: IssueRequest): Observable<Issue> {
    return this.api.put<Issue>(`${this.endpoint}/${id}`, issue);
  }

  resolveIssue(issueId: number, resolutionNotes: string): Observable<Issue> {
    return this.api.put<Issue>(`${this.endpoint}/${issueId}/resolve?resolutionNotes=${encodeURIComponent(resolutionNotes)}`, null);
  }

  resolveIssueWithCost(issueId: number, resolutionNotes: string, cost?: number): Observable<Issue> {
    let params = `resolutionNotes=${encodeURIComponent(resolutionNotes)}`;
    if (cost !== undefined) {
      params += `&cost=${cost}`;
    }
    return this.api.put<Issue>(`${this.endpoint}/${issueId}/resolve?${params}`, null).pipe(
      tap(() => {
        this.sendSystemMessage(issueId, `Issue resolved: ${resolutionNotes}`).subscribe();
      })
    );
  }

  closeIssue(issueId: number, userId: number): Observable<Issue> {
    return this.api.put<Issue>(`${this.endpoint}/${issueId}/close?userId=${userId}`, null).pipe(
      tap(issue => {
        this.sendSystemMessage(issueId, `Issue closed by ${issue.reportedByName || 'User'}`).subscribe();
      })
    );
  }

  deleteIssue(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  getIssue(id: number): Observable<Issue> {
    return this.api.get<Issue>(`${this.endpoint}/${id}`);
  }

  sendNotification(userId: number, title: string, message: string, type: string, issueId?: number): Observable<any> {
    return this.api.post('/notifications', { userId, title, message, type, relatedIssueId: issueId });
  }

  sendIssueNotification(issueId: number, title: string, message: string, type: string): Observable<any> {
    return this.api.post(`/issues/${issueId}/notify`, { title, message, type });
  }

  sendSystemMessage(issueId: number, message: string): Observable<any> {
    return this.api.post(`/messages/system?issueId=${issueId}&messageText=${encodeURIComponent(message)}`, null);
  }

  searchIssues(params: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    type?: string;
    reportedById?: number;
    assignedToId?: number;
    assetId?: number;
    sortBy?: string;
    sortDir?: string;
  }, page: number = 0, size: number = 10): Observable<PageResponse<Issue>> {
    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('size', size.toString());
    
    Object.keys(params).forEach(key => {
      const value = params[key as keyof typeof params];
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.api.get<PageResponse<Issue>>(`${this.endpoint}/search?${searchParams.toString()}`);
  }
}