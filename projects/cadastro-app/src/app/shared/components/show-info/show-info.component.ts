import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-show-info',
  templateUrl: './show-info.component.html',
  styleUrls: ['./show-info.component.scss']
})
export class ShowInfoComponent implements OnInit {

  @Input() arrayInfo: Array<any> = []
  constructor() { }

  ngOnInit(): void {
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  getValueFromArray(values: any): string {
    if (values.length === 1) {
      return values;
    } else {
      return values.slice(0, -1).join(', ') + ' e ' + values.slice(-1);
    }
  }
  
}