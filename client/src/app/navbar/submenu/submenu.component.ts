import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { INavbarData } from 'src/app/_models/navbarData';

@Component({
  selector: 'submenu',
  templateUrl: './submenu.component.html',
  styleUrls: ['./submenu.component.css'],
})
export class SubmenuComponent implements OnInit {
  @Input() sidebarList: INavbarData[] = [];
  @Output() clickLink = new EventEmitter();

  constructor() {}
  ngOnInit(): void {}

  clickRouteLink(){
    this.clickLink.emit();
  }
}
