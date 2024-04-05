import { Component, OnInit } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { Router } from '@angular/router';
import { INavbarData } from '../_models/navbarData';
import { sidebarList } from './navbar-data';
import { User } from '../_models/user';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  sidebarList: INavbarData[] = [];
  toggleMenu: boolean = false;
  constructor(public accountService: AccountService, public router: Router) {}
  ngOnInit(): void {
    this.accountService.currentUser$.subscribe({
      next: (user) => {
        this.sidebarList = this.setupItemNav(
          user,
          this.sidebarList,
          sidebarList
        );
      },
    });
  }

  setupItemNav(user: User | null, result: INavbarData[], list: INavbarData[]) {
    if (user) {
      if (user.roles.includes('SuperAdmin')) {
        result = list;
      } else if (user.roles.includes('Admin')) {
        result = list.filter(
          (x) =>
            x.roles.length == 0 ||
            x.roles.includes('Member') ||
            x.roles.includes('Admin')
        );
      } else if (user.roles.includes('Member')) {
        result = list.filter(
          (x) => x.roles.length == 0 || x.roles.includes('Member')
        );
      } else {
        result = list.filter((x) => x.roles.length == 0);
      }
    } else {
      result = list.filter((x) => x.roles.length == 0);
    }

    result.forEach((x) => {
      if (x.items) {
        x.items = this.setupItemNav(user, x.items, x.items);
      }
    });

    return result;
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
