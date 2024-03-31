import { Component, HostListener, OnInit } from '@angular/core';
import { AccountService } from './_services/account.service';
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
    private busyService: BusyService
  ) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkTop();
  }

  ngOnInit(): void {
    this.checkTop();
    this.setCurrentUser();
  }

  checkTop() {
    let top = document.getElementById('move-to-top');
    if (top) {
      if (window.scrollY > 0) {
        top.style.visibility = 'visible';
        top.style.opacity = '1';
      } else {
        top.style.visibility = 'hidden';
        top.style.opacity = '0';
      }
    }
  }

  clickToTop() {
    window.scrollTo(0, 0);
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
        error: (error) => {
          this.accountService.logout();
        },
      });
  }
}
