import { Component, OnInit } from '@angular/core';
import { LoginDto } from '../_models/loginDto';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';
import { CheckValidEmail } from '../_extensions/checkEmail';
import { Router } from '@angular/router';
import { BusyService } from '../_services/busy.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginDto: LoginDto = {} as LoginDto;
  abc: string = '';

  constructor(
    private accountService: AccountService,
    private toastr: ToastrService,
    private router: Router,
    private busyService: BusyService
  ) {}
  ngOnInit(): void {
    this.accountService.currentUser$.subscribe({
      next: (user) => {
        if (user) this.router.navigateByUrl('/');
      },
    });
  }

  login() {
    if (!this.checkValid()) return;
    this.busyService.busy();
    this.accountService
      .login(this.loginDto)
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: () => {
          this.toastr.success('dang nhap thanh cong');
        },
      });
  }

  forgotPass() {
    if (this.loginDto.email == undefined || this.loginDto.email.trim() == '') {
      this.toastr.error('Email is not empty');
      return;
    }

    if (!CheckValidEmail(this.loginDto.email)) {
      this.toastr.error('Invalid email');
      return;
    }

    this.busyService.busy();

    this.accountService
      .forgotPassword(this.loginDto.email)
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: (res) => {
          if (res) this.toastr.success(res.message);
        },
      });
  }

  checkValid(): boolean {
    if (this.loginDto.email == undefined || this.loginDto.email.trim() == '') {
      this.toastr.error('Email is not empty');
      return false;
    }

    if (!CheckValidEmail(this.loginDto.email)) {
      this.toastr.error('Email invalid');
      return false;
    }

    if (
      this.loginDto.password == undefined ||
      this.loginDto.password.trim() == ''
    ) {
      this.toastr.error('Password is not empty');
      return false;
    }

    if (this.loginDto.password.includes(' ')) {
      this.toastr.error("Password can't contain space");
      return false;
    }

    if (this.loginDto.password.length < 4) {
      this.toastr.error('Password must be at lest 4 characters');
      return false;
    }

    if (this.loginDto.password.length > 8) {
      this.toastr.error('Password contains maximum 8 characters');
      return false;
    }

    return true;
  }
}
