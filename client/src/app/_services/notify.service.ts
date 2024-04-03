import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { NotifyParam } from '../_models/notifyParam';
import { getPaginationHeader, getPaginationResult } from './paginationHelper';
import { GetAllNotifyDto } from '../_models/getAllNotifyDto';

@Injectable({
  providedIn: 'root',
})
export class NotifyService {
  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAll(param: NotifyParam) {
    let params = getPaginationHeader(param.pageNumber, param.pageSize);
    return getPaginationResult<GetAllNotifyDto[]>(
      this.baseUrl + 'notify',
      params,
      this.http
    );
  }

  markReaded(notifyId: number) {
    return this.http.post(this.baseUrl + 'notify/mark-readed', notifyId);
  }

  markAllReaded() {
    return this.http.post(this.baseUrl + 'notify/mark-all-readed', {});
  }
}
