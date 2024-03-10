import { Component, OnInit } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { Router } from '@angular/router';
import { INavbarData } from '../_models/navbarData';
import { sidebarList } from './navbar-data';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  sidebarList: INavbarData[] = [];
  toggleMenu: boolean = false;
  constructor(
    public accountService: AccountService,
    public router: Router,
  ) {}
  ngOnInit(): void {
    this.accountService.currentUser$.subscribe({
      next: (user) => {
        if (user) {
          if (user.roles.includes('Admin')) {
            this.sidebarList = sidebarList;
          } else if (user.roles.includes('Member')) {
            this.sidebarList = sidebarList.filter(
              (x) => x.roles.length == 0 || x.roles.includes('Member')
            );
          } else {
            this.sidebarList = sidebarList.filter((x) => x.roles.length == 0);
          }
        } else {
          this.sidebarList = sidebarList.filter((x) => x.roles.length == 0);
        }

      },
    });
  }

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
    const navCollapse = document.getElementById('navbarSupportedContent');
    if (navCollapse) {
      navCollapse.classList.remove('show');
    }
  }

  closeNav() {
    const navCollapse = document.getElementById('navbarSupportedContent');
    if (navCollapse) {
      navCollapse.classList.remove('show');
    }
  }
}
