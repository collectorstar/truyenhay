import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';
import { LoginDto } from '../_models/loginDto';
import { RegisterDto } from '../_models/registerDto';
import { ResetPasswordDto } from '../_models/resetPassword';
import { ChangePasswordDto } from '../_models/changePasswordDto';
import { UpdateInfoAccountDto } from '../_models/updateInfoAccountDto';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  baseUrl = environment.apiUrl;
  private currentUserSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSource.asObservable();
  hubUrl = environment.hubUrl;
  private hubConnection?: HubConnection;

  constructor(private http: HttpClient, private toastr: ToastrService) {}

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

  callbackUser(token: string) {
    var formdata = new FormData();
    formdata.append('token', token);
    return this.http.post<User>(
      this.baseUrl + 'account/callback-user',
      formdata
    );
  }

  setCurrentUser(user: User) {
    user.roles = [];
    const roles = this.getDecodedToken(user.token).role;
    Array.isArray(roles) ? (user.roles = roles) : user.roles.push(roles);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);
    this.createHubConnection(user);
  }

  setCurrentUserNoCreateConnect(user: User) {
    user.roles = [];
    const roles = this.getDecodedToken(user.token).role;
    Array.isArray(roles) ? (user.roles = roles) : user.roles.push(roles);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
    this.stopHubConnection();
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

  updateInfo(newName: string) {
    let param: UpdateInfoAccountDto = {
      newName: newName,
    };
    return this.http.post<any>(this.baseUrl + 'account/update-info', param);
  }

  uploadAvatar(file: File) {
    let formData = new FormData();
    formData.append('image', file);
    return this.http.post<any>(
      this.baseUrl + 'account/upload-avatar',
      formData
    );
  }

  createHubConnection(user: User) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'presence', {
        accessTokenFactory: () => user.token,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch((error) => console.log(error));

    this.hubConnection.on('AcceptAuthor', (message) => {
      if (message) {
        this.toastr.success(message);
        user.isAuthor = true;
        this.setCurrentUserNoCreateConnect(user);
      }
    });
  }

  stopHubConnection() {
    this.hubConnection?.stop().catch((error) => console.log(error));
  }
}
