import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SelectorComponent implements OnInit {
  @Input() options: any[] = [];
  @Input() valueFirst: any;
  valueSelect: number | string = '';
  @Output() valueSelected = new EventEmitter();
  @Output() onClick = new EventEmitter();

  constructor() {}

  ngOnInit(): void {
    this.valueSelect = this.options.find(
      (x) => x.value == this.valueFirst.value
    ).value;
  }

  changeValue(event: any) {
    let value = this.options.find((x) => x.value == event);
    this.valueSelected.emit(value);
  }

  clickEvent() {
    this.onClick.emit();
  }
}
