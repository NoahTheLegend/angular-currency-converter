import { Component, OnInit, Input, input } from '@angular/core';
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

export class HeaderComponent implements OnInit {
  currency_list!: Observable<any>; // copy of currency names from API component
  costs!: Array<Array<number>>; // costs to show
  currency_order!: Array<string>;
  main!: string;
  constructor(private api: ApiRequestsService) {}

  // API service uses httpclient.get, hence we have to wait for actual value
  // so the method getCurrencyValues() returns promise relevant to observable response
  async ngOnInit(): Promise<void> {
    this.currency_list = this.api.fetchCurrencyList();
    let featured = this.api.getFeaturedList();

    let main = this.api.getActiveCurrencies()[0];
    this.main = main;

    /* ISSUE: this splices array instance in api, meaning all other components utilizing service will have it changed!
    let idx = featured.indexOf(main);
    if (idx != -1) {
      featured.splice(idx, 1);
    }
    */

    this.currency_order = featured;
    this.costs = [];
  
    for (let i = 0; i < featured.length; i++) {
      let another = featured[i];

      try {
        const main_list = await this.api.fetchCurrencyListAsPromise(main);
        const another_list = await this.api.fetchCurrencyListAsPromise(another);
  
        const cost = this.api.getCurrency(main_list, another_list, main, another);
        this.costs.push(cost);
      } catch (error) {
        console.error('Error fetching currency values:', error);
        this.costs.push([]);
      }
    }

    this.costs_to_show = this.costs;
  }

  parseCost(cost: number): number {
    let new_cost = Math.round(cost * 1000) / 1000;
    // make the cost better-looking
    return new_cost;
  }

  costs_to_show = this.costs;
}