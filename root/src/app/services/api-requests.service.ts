import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiRequestsService {
  active_currencies = ["usd", "eur"]; // first is main
  main_currency_list!: Observable<any>; // how much this costs in secondary currency value
  secondary_currency_list!: Observable<any>;
  currencyList!: Observable<any>;

  constructor(private http: HttpClient) {
    this.currencyList = this.fetchCurrencyList();
    this.fetchCurrency(0, this.active_currencies[0]);
    this.fetchCurrency(1, this.active_currencies[1]);
  }

  fetchCurrency(id: number, name: string) { // assigns value of other currencies respectively to selected
    let temp = this.http.get<any>('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@2024-03-06/v1/currencies/'+name+'.json');
    if (id == 0) {
      this.active_currencies[0] = name;
      this.main_currency_list = temp;
    }
    else this.secondary_currency_list = temp;
  }

  fetchCurrencyList() { // returns an object of names of currencies, in english
    return this.http.get<any>('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json');
  }

  getActiveCurrencies(): Array<string> { // returns selected (the main) currency
    return this.active_currencies;
  }

  list = ["usd", "eur", "uah", "btc", "cny", "jpy"] // !!! kept it hard-coded as a preview !!!

  getActiveLists() {
    return [this.main_currency_list, this.secondary_currency_list];
  }
  
  getCurrencyValues() { // gets the cost of secondary for main currencies and vice-versa
    let costs = Array<number>();
    this.main_currency_list.subscribe(currency_main => {
      this.secondary_currency_list.subscribe(currency_secondary => {
        let main_obj = currency_main[this.active_currencies[0]] as keyof object;
        let secondary_obj = currency_secondary[this.active_currencies[1]] as keyof object;
        
        // fill returning costs array with opposite costs
        costs.push(main_obj[this.active_currencies[1]]);
        costs.push(secondary_obj[this.active_currencies[0]]);
      })
    });

    return costs;
  }

  getCurrencyName(name: string) : string { // returns full name of the currency, in english
    this.main_currency_list.subscribe(currency_list => {
      let obj = currency_list as keyof object;
      let keys = Object.keys(obj[name]);

      if (keys.indexOf(name) != -1) {
        return obj[name];
      }
    });
    
    return "None";
  }
}