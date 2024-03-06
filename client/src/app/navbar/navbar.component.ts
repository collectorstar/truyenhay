import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { Router } from '@angular/router';
import {
  animate,
  keyframes,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { SidebarService } from '../_services/sidebar.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  toggleMenu: boolean = false;
  constructor(
    public accountService: AccountService,
    private router: Router,
    public sidebarService: SidebarService
  ) {}
  ngOnInit(): void {}

  clickToggleMenu() {
    this.sidebarService.toggleSidebar();
  }

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }
}
