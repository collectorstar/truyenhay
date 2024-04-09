import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserForUserManagerParam } from '../_models/userForUserManagerParam';
import { GetUserForUserManagerDto } from '../_models/getUserForUserManagerDto';
import { getPaginationHeader, getPaginationResult } from './paginationHelper';

@Injectable({
  providedIn: 'root',
})
export class UserManagerService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(param: UserForUserManagerParam) {
    let params = getPaginationHeader(param.pageNumber, param.pageSize);
    params = params.append('email', param.email);
    params = params.append('allUser', param.allUser);
    params = params.append('fromDate', param.fromDate.toDateString());
    params = params.append('toDate', param.toDate.toDateString());
    params = params.append('onlyAuthor', param.onlyAuthor);
    return getPaginationResult<GetUserForUserManagerDto[]>(
      this.baseUrl + 'userManager',
      params,
      this.http
    );
  }

  blockUser(userId: number) {
    return this.http.post(this.baseUrl + 'userManager/block', userId);
  }
  unBlockUser(userId: number) {
    return this.http.post(this.baseUrl + 'userManager/unblock', userId);
  }

  incMaxComic(userId: number) {
    return this.http.post(this.baseUrl + 'userManager/inc-max-comic', userId);
  }

  changeToAuthor(userId: number) {
    return this.http.post(
      this.baseUrl + 'userManager/change-to-author',
      userId
    );
  }
}
