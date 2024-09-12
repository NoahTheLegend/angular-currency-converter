import { Component, Input, input } from '@angular/core';
import { ApiRequestsService } from "../services/api-requests.service";
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})

export class HeaderComponent {
  currency_list!: Observable<any>;
  costs!: Array<number>;
  active_currencies!: Array<string>;
  constructor(private api: ApiRequestsService) {}

  ngOnInit(): void {
    this.currency_list = this.api.fetchCurrencyList();
    this.costs = this.api.getCurrencyValues();
    this.active_currencies = this.api.getActiveCurrencies();
  }
}