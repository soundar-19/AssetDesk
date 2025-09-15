import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { InputModalContainerComponent } from './shared/components/input-modal/input-modal-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, InputModalContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  protected readonly title = signal('AssetDesk');
}
