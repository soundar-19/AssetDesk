import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  private requestCount = 0;

  setLoading(loading: boolean) {
    if (loading) {
      this.requestCount++;
    } else {
      this.requestCount--;
    }
    
    this.loadingSubject.next(this.requestCount > 0);
  }
}

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loadingService.setLoading(true);
    
    return next.handle(request).pipe(
      finalize(() => this.loadingService.setLoading(false))
    );
  }
}