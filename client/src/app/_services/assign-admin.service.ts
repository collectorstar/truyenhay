import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserForAssignPermistionParam } from '../_models/userForAssignPermistionParam';
import { getPaginationHeader, getPaginationResult } from './paginationHelper';
import { GetUserForAssignPermistionDto } from '../_models/getUserForAssignPermistionDto';

@Injectable({
  providedIn: 'root',
})
export class AssignAdminService {
  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAll(param: UserForAssignPermistionParam) {
    let params = getPaginationHeader(param.pageNumber, param.pageSize);
    params = params.append('email', param.email);
    params = params.append('onlyAdmin', param.onlyAdmin);
    return getPaginationResult<GetUserForAssignPermistionDto[]>(
      this.baseUrl + 'assignPermission',
      params,
      this.http
    );
  }

  addRoleAdmin(userId: number) {
    return this.http.post(
      this.baseUrl + 'assignPermission/add-admin-role',
      userId
    );
  }

  removeRoleAdmin(userId: number) {
    return this.http.post(
      this.baseUrl + 'assignPermission/remove-admin-role',
      userId
    );
  }
}
