import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IDropdownSettings,
  NgMultiSelectDropDownModule,
} from 'ng-multiselect-dropdown';

@Component({
  selector: 'multiselect-dropdown',
  templateUrl: './multiselect-dropdown.component.html',
  styleUrls: ['./multiselect-dropdown.component.css'],
  standalone: true,
  imports: [CommonModule, NgMultiSelectDropDownModule, FormsModule],
})
export class MultiselectDropdownComponent implements OnInit {
  constructor() {}
  @Input() dropdownList: { value: number; label: string }[] = [];
  @Input() selectedItems: { value: number; label: string }[] = [];
  @Input() isSingle: boolean = false;
  @Input() placeholder: string = 'select item';
  dropdownSettings: IDropdownSettings = {};
  @Output() onChange = new EventEmitter();
  @Output() isSelectItem = new EventEmitter();
  @Output() isSelectAll = new EventEmitter();

  ngOnInit() {

    this.dropdownSettings = {
      singleSelection: this.isSingle,
      idField: 'value',
      textField: 'label',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true,
    };
  }
  onItemSelect(item: any) {
  }
  onDeSelect(item: any) {
  }
  onSelectAll(items: any) {
    this.isSelectAll.emit(items);
  }

  onDeSelectAll(items: any) {
    this.isSelectAll.emit(items);
  }

  onChangeModel(items: any){
    this.onChange.emit(items);
  }

}
