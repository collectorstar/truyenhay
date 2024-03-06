import { Component, OnInit } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { User } from '../_models/user';
import { Member } from '../_models/member';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BusyService } from '../_services/busy.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.css'],
})
export class AccountDetailComponent implements OnInit {
  user: User = {} as User;
  member: Member = {} as Member;
  oldPassword: string = '';
  newPassword: string = '';

  selectedFile: File | null = null;

  constructor(
    public accountService: AccountService,
    private router: Router,
    private toastr: ToastrService,
    private busyService: BusyService
  ) {
    this.accountService.currentUser$.subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
          this.member.email = user.email;
          this.member.isAuthor = user.isAuthor;
          this.member.name = user.name;
          this.member.photoUrl = user.photoUrl;
        } else {
          this.router.navigateByUrl('/');
        }
      },
    });
  }
  ngOnInit(): void {}

  changePassword() {
    if (!this.validatePassword()) return;
    this.busyService.busy();
    this.accountService
      .changePassword(this.oldPassword, this.newPassword)
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.toastr.success(res.message);
            this.oldPassword = '';
            this.newPassword = '';
          }
        },
      });
  }

  validatePassword(): boolean {
    if (this.oldPassword.trim() == '') {
      this.toastr.error('Empty old password');
      return false;
    }

    if (this.newPassword.trim() == '') {
      this.toastr.error('Empty new password');
      return false;
    }

    if (this.oldPassword.length < 4 || this.newPassword.length < 4) {
      this.toastr.error('password at least 4 characters');
      return false;
    }

    if (this.oldPassword.includes(' ') || this.newPassword.includes(' ')) {
      this.toastr.error('password not include space');
      return false;
    }

    return true;
  }

  updateInfo() {
    this.busyService.busy();
    this.accountService
      .updateInfo(this.member.name)
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.user.name = this.member.name;
            this.accountService.setCurrentUser(this.user);
            this.toastr.success(res.message);
          }
        },
      });
  }

  selectImage(event: any) {
    if (event.target.files[0].type.slice(0, 5) !== 'image') {
      this.toastr.error('file is not a image');
      return;
    }

    if (event.target.files[0].size >= 2 * 1024 * 1024) {
      this.toastr.error('file too big');
      return;
    }
    this.selectedFile = event.target.files[0];
  }

  upload() {
    if (!this.selectedFile) {
      this.toastr.error('Please select a image');
    } else {
      this.busyService.busy();
      this.accountService
        .uploadAvatar(this.selectedFile)
        .pipe(
          finalize(() => {
            this.busyService.idle();
          })
        )
        .subscribe({
          next: (res) => {
            if (res) {
              this.user.photoUrl = res.url;
              this.accountService.setCurrentUser(this.user);
              this.member.photoUrl = res.url;
              this.toastr.success('Upload Success!');
            }
          },
        });
    }
  }
}
