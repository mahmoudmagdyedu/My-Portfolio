import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyFormat', standalone: true })
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number, symbol: string = '$'): string {
    return `${symbol}${value.toFixed(2)}`;
  }
}
