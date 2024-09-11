import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { ApiRequestsService } from "./services/api-requests.service";
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent {
  currencies$!: Observable<any>;
  constructor(private api: ApiRequestsService) {}

  ngOnInit(): void {
    this.currencies$ = this.api.getCurrencies();
  }
}