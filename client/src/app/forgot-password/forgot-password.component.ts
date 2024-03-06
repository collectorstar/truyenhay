import { Component, OnInit } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';
import { ResetPasswordDto } from '../_models/resetPassword';
import { Router } from '@angular/router';
import { CheckValidEmail } from '../_extensions/checkEmail';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent implements OnInit {
  resetPasswordDto: ResetPasswordDto = {} as ResetPasswordDto;

  constructor(
    private accountService: AccountService,
    private toastr: ToastrService,
    private router: Router
  ) {}
  ngOnInit(): void {
    var check = this.router.url.includes('/forgot-pass?token=');
    if (!check) {
      this.router.navigateByUrl('/not-found');
      return;
    }
    this.accountService.currentUser$.subscribe({
      next: (user) => {
        if (user) this.router.navigateByUrl('/');
      },
    });
  }

  resetpass() {
    if (!this.checkValid()) return;
    var arr = this.router.url.split('/forgot-pass?token=');

    if (arr.length == 0 || arr.length != 2) {
      this.router.navigateByUrl('/not-found');
      return;
    }
    var token = arr[1];

    this.accountService.resetPassword(this.resetPasswordDto, token).subscribe({
      next: () => {
        this.toastr.success('Change password success');
        this.router.navigateByUrl('/');
      },
    });
  }

  checkValid(): boolean {
    if (
      this.resetPasswordDto.email == undefined ||
      this.resetPasswordDto.email.trim() == ''
    ) {
      this.toastr.error('Email is not empty');
      return false;
    }

    if (!CheckValidEmail(this.resetPasswordDto.email)) {
      this.toastr.error('Email invalid');
      return false;
    }

    if (
      this.resetPasswordDto.newPassword == undefined ||
      this.resetPasswordDto.newPassword.trim() == ''
    ) {
      this.toastr.error('Password is not empty');
      return false;
    }

    if (this.resetPasswordDto.newPassword.trim().length < 4) {
      this.toastr.error('Password must be at lest 4 characters');
      return false;
    }

    return true;
  }
}
