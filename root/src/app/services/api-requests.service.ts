import { Injectable, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ApiRequestsService {
  active_currencies = ["uah", "usd"]; // first is main by default

  main_currency_list_values!: Observable<any>; // how much this costs in secondary currency value
  secondary_currency_list_values!: Observable<any>;

  currency_list_ids!: Observable<any>; // list of all currencies and their full names
  currency_list_featured!: Array<string>;
  serverURL!: string;

  constructor(private http: HttpClient) {
    this.serverURL = 'http://127.0.0.1:4200/api/';

    this.currency_list_featured = ["uah", "usd", "eur", "btc", "cny", "jpy"];
    this.currency_list_ids = this.fetchCurrencyList();

    this.update();
  }

  update(): void {
    this.setCurrency(0, this.active_currencies[0]);
    this.setCurrency(1, this.active_currencies[1]);
  }

  // fetches and assigns values of other currencies respectively to selected
  setCurrency(id: number, name: string) {
    let temp = this.http.get<any>('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@2024-03-06/v1/currencies/'+name+'.json');
    if (id == 0) {
      this.active_currencies[0] = name;
      this.main_currency_list_values = temp;
    }
    else
    {
      this.active_currencies[1] = name;
      this.secondary_currency_list_values = temp;
    }
  }

  // returns an object of names of currencies, in english
  fetchCurrencyList() {
    return this.http.get<any>('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json');
  }

  // same as previous, but asynchronous
  fetchCurrencyListAsPromise(name: string): Promise<any> {
    return firstValueFrom(this.http.get<any>('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@2024-03-06/v1/currencies/' + name + '.json'));
  }

  getActiveCurrencies(): Array<string> {
    return this.active_currencies;
  }

  getActiveLists(): Array<Observable<any>> {
    return [this.main_currency_list_values, this.secondary_currency_list_values];
  }

  // returns costs of currency
  getCurrency(main_list: any, another_list: any, main: string, another: string): Array<number> {
    const costs: Array<number> = [];
  
    const main_obj = main_list[main];
    const secondary_obj = another_list[another];
  
    if (main_obj && secondary_obj) {
      costs.push(main_obj[another]);
      costs.push(secondary_obj[main]);
    }
  
    return costs;
  }
  
  // overload for getCurrency(), returns a promise as Array<number>
  getCurrencyAsPromise(main: string, another: string): Promise<Array<number>> {
    return new Promise(async (resolve, reject) => {
      try {
        const costs: Array<number> = [];
        const values = this.getActiveLists();
        
        const currency_main = await firstValueFrom(values[0]);
        const currency_secondary = await firstValueFrom(values[1]);
  
        const main_obj = currency_main[main];
        const secondary_obj = currency_secondary[another];
        
        //console.log(main+" "+another+" "+main_obj+" "+secondary_obj)
        if (main_obj && secondary_obj) {
        costs.push(main_obj[another]);
        costs.push(secondary_obj[main]);
        }
        resolve(costs);
      } catch (error) {
        reject(error);
      }
    });
  }

  // returns full name of the currency, in english
  getCurrencyName(name: string): string {
    this.main_currency_list_values.subscribe(currency_list => {
      let obj = currency_list as keyof object;
      let keys = Object.keys(obj[name]);

      if (keys.indexOf(name) != -1) {
        return obj[name];
      }
    });
    
    return "None";
  }

  getFeaturedList(): Array<string> {
    return this.currency_list_featured;
  }
}