import { Component, OnInit } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { RegisterDto } from '../_models/registerDto';
import { ToastrService } from 'ngx-toastr';
import { CheckValidEmail } from '../_extensions/checkEmail';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerDto: RegisterDto = {} as RegisterDto;

  constructor(
    private accountService: AccountService,
    private toastr: ToastrService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.accountService.currentUser$.subscribe({
      next: (user) =>{
        if(user) this.router.navigateByUrl('/')
      }
    })
  }

  register() {
    if (!this.checkValid()) return;
    this.accountService.register(this.registerDto).subscribe({
      next: () => {
        this.toastr.success('Register success');
      },
      error: (error) => {
        this.toastr.error(error.error);
        console.log(error);
      },
    });
  }

  checkValid(): boolean {
    if (
      this.registerDto.name == undefined ||
      this.registerDto.name.trim() == ''
    ) {
      this.toastr.error('Name is not empty');
      return false;
    }

    if (
      this.registerDto.email == undefined ||
      this.registerDto.email.trim() == ''
    ) {
      this.toastr.error('Email is not empty');
      return false;
    }

    if (!CheckValidEmail(this.registerDto.email)) {
      this.toastr.error('Email invalid');
      return false;
    }

    if (
      this.registerDto.password == undefined ||
      this.registerDto.password.trim() == ''
    ) {
      this.toastr.error('Password is not empty');
      return false;
    }

    if (this.registerDto.password.trim().length < 4) {
      this.toastr.error('Password must be at lest 4 characters');
      return false;
    }

    return true;
  }
}
