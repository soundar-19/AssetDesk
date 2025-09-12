import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
    
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct title', () => {
    expect(component.title()).toBe('AssetDesk');
  });
});
