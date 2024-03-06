import { SidebarService } from './../_services/sidebar.service';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.css'],
  animations: [
    trigger('sidebarState', [
      state(
        'open',
        style({
          width: '16.5625rem',
          opacity: 1,
        })
      ),
      state(
        'closed',
        style({
          width: '0',
          opacity: 0,
        })
      ),
      transition('open <=> closed', animate('1000ms ease-in-out')),
    ]),
    trigger('hidecontent', [
      state(
        'show',
        style({
          display: 'none',
          opacity: 0,
        })
      ),
      state(
        'hide',
        style({
          display: 'block',
          opacity: 1,
        })
      ),
      transition('show <=> hide', animate('1000ms ease-in-out'))
    ]),
  ],
})
export class BodyComponent implements OnInit {
  @Input() collapsed = false;
  @Input() screenWidth = 0;
  isScroll: boolean = false;
  isMobile: boolean = false;

  constructor(public sidebarService: SidebarService) {
    if (window.innerWidth <= 786) this.isMobile = true;
  }

  ngOnInit(): void {}

  closeSideBar() {
    this.sidebarService.setStatusSidebar(false);
  }
}
