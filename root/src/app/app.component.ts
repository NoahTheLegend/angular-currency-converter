import { Component, AfterViewInit, ElementRef, ViewChild} from '@angular/core';
import { RouterOutlet, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { ApiRequestsService } from "./services/api-requests.service";
import { AsyncPipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, AsyncPipe, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent {
  form!: FormGroup;
  private timeout!: any;
  values!: Array<string>; // converted

  constructor(private fb: FormBuilder, private api: ApiRequestsService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      mainInput: ['', [Validators.required]],
      secondaryInput: ['', [Validators.required]],
      mainSelect: ['', []],
      secondarySelect: ['', []]
    });
    this.values = [];
  }

  async onInputChange(event: Event): Promise<void> {
    const inputElement = event.target as HTMLInputElement;
    let value = this.sanitizeInput(inputElement.value);

    inputElement.value = value;
    console.log(this.api.getActiveCurrencies(), this.values)

    let is_main = inputElement.id == "mainInput";
    this.values[is_main ? 0 : 1] = value.replace(/\s/g, '');
    this.values[is_main ? 1 : 0] = await this.getCost(parseFloat(this.values[is_main ? 0 : 1]), is_main);

    // reset timer
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  // validate text
  sanitizeInput(value: string): string {
    let sanitizedValue = value
      .replace(/[^0-9.]/g, '')
      .replace(/(\..*)\./g, '$1');

    // set value to `0.` if first input is dot
    if (sanitizedValue === '.') {
      sanitizedValue = '0.';
    }

    return sanitizedValue;
  }

  getActiveCurrency(id: number): string {
    return this.api.getActiveCurrencies()[id];
  }

  async getCost(value: number, is_main: boolean): Promise<string> {
    let active_currencies = this.api.getActiveCurrencies();
    let costs = await this.api.getCurrencyAsPromise(active_currencies[0], active_currencies[1]);

    let final_cost = Math.round((is_main ? (costs[0]*value) : (costs[1]*value)) * 100) / 100;
    if (isNaN(final_cost) || !isFinite(final_cost)) return "";

    return final_cost.toString();
  }

  async onCurrencyChange(id: number, event: Event): Promise<void> {
    const selected = event.target as HTMLSelectElement;
    let is_main = id == 0;
    
    let value = selected.value;
    this.api.setCurrency(id, value);

    this.values[is_main ? 1 : 0] = await this.getCost(parseFloat(this.values[is_main ? 0 : 1]), is_main);
    this.api.update();
  }

  getFeaturedList(): Array<string> {
    return this.api.getFeaturedList();
  }
}