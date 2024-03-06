import { animate, style, transition, trigger } from '@angular/animations';
import { SidebarService } from '../_services/sidebar.service';
import { sidebarList } from './sidebar-data';
import { Component, OnInit } from '@angular/core';
import { INavbarData } from '../_models/navbarData';
import { Router } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { BusyService } from '../_services/busy.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('3000ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('3000ms', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class SidebarComponent implements OnInit {
  sidebarList: INavbarData[] = [];
  multiple = false;
  constructor(
    public accountService: AccountService,
    public sidebarService: SidebarService,
    private router: Router,
    private busyService: BusyService
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

  onItemSwitch(nameFunction: string){
    switch (nameFunction) {
      case 'logout' : {
        this.accountService.logout();
        this.router.navigateByUrl('/');
      } 
    }

  }

  getActiveClass(data: INavbarData): string {
    return this.router.url.includes(data.routeLink) ? 'active' : '';
  }
}
