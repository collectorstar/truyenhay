import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';
import { LoginDto } from '../_models/loginDto';
import { RegisterDto } from '../_models/registerDto';
import { ResetPasswordDto } from '../_models/resetPassword';
import { ChangePasswordDto } from '../_models/changePasswordDto';
import { UpdateInfoAccountDto } from '../_models/updateInfoAccountDto';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  baseUrl = environment.apiUrl;
  private currentUserSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(private http: HttpClient) {}

  login(model: LoginDto) {
    return this.http.post<User>(this.baseUrl + 'account/login', model).pipe(
      map((response: User) => {
        const user = response;
        if (user) {
          this.setCurrentUser(user);
        }
      })
    );
  }

  register(model: RegisterDto) {
    return this.http.post<User>(this.baseUrl + 'account/register', model).pipe(
      map((response: User) => {
        const user = response;
        if (user) {
          this.setCurrentUser(user);
        }
      })
    );
  }

  forgotPassword(email: string) {
    return this.http.post<any>(
      this.baseUrl + 'account/forgot-password?email=' + email,
      {}
    );
  }

  resetPassword(model: ResetPasswordDto, token: string) {
    return this.http
      .post<User>(this.baseUrl + 'account/reset-password?token=' + token, model)
      .pipe(
        map((response: User) => {
          const user = response;
          if (user) {
            this.setCurrentUser(user);
          }
        })
      );
  }

  setCurrentUser(user: User) {
    user.roles = [];
    const roles = this.getDecodedToken(user.token).role;
    Array.isArray(roles) ? (user.roles = roles) : user.roles.push(roles);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
  }

  getDecodedToken(token: string) {
    return JSON.parse(atob(token.split('.')[1]));
  }

  changePassword(oldPass: string, newPass: string) {
    let param: ChangePasswordDto = {
      oldPass: oldPass,
      newPass: newPass,
    };
    return this.http.post<any>(this.baseUrl + 'account/change-password', param);
  }

  updateInfo(newName : string){
    let param : UpdateInfoAccountDto = {
      newName : newName
    }
    return this.http.post<any>(this.baseUrl + 'account/update-info',param);
  }

  uploadAvatar(file : File){
    let formData = new FormData();
    formData.append('image',file);
    return this.http.post<any>(this.baseUrl + 'account/upload-avatar',formData);
  }
  
}
