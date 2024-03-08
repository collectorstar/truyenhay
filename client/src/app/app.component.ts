import { Component, OnInit } from '@angular/core';
import { AccountService } from './_services/account.service';
import { SidebarService } from './_services/sidebar.service';
import { User } from './_models/user';
import { finalize } from 'rxjs';
import { BusyService } from './_services/busy.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(
    private accountService: AccountService,
    public sidebarService: SidebarService,
    private busyService: BusyService
  ) {}
  ngOnInit(): void {
    this.setCurrentUser();
  }

  setCurrentUser() {
    const userString = localStorage.getItem('user');
    if (!userString) return;
    const user: User = JSON.parse(userString);
    this.accountService.setCurrentUserNoCreateConnect(user);
    this.busyService.busy();
    this.accountService
      .callbackUser(user.token)
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.accountService.setCurrentUser(res);
          }
        },
        error: (error)=>{
          this.accountService.logout();
        }
      });
  }
}
