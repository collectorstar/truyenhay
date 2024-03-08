import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GetAllRequestAuthorParam } from '../_models/getAllRequestAuthorParam';
import { getPaginationHeader, getPaginationResult } from './paginationHelper';
import { RequestAuthorDto } from '../_models/requestAuthorDto';
import * as moment from 'moment';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class RequestAuthorService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getRequestByEmail(requestAuthorParam: GetAllRequestAuthorParam) {
    let params = getPaginationHeader(
      requestAuthorParam.pageNumber,
      requestAuthorParam.pageSize
    );
    var fromdate = moment(requestAuthorParam.fromDate,"")
    params = params.append('email', requestAuthorParam.email);
    params = params.append(
      'onlySendRequest',
      requestAuthorParam.onlySendRequest
    );

    params = params.append(
      'fromDate',
      requestAuthorParam.fromDate.toDateString()
    );
    params = params.append(
      'toDate',
      requestAuthorParam.toDate.toDateString()
    );
    return getPaginationResult<RequestAuthorDto[]>(
      this.baseUrl + 'requestAuthor',
      params,
      this.http
    );
  }

  denyAction(requestId: number) {
    return this.http.post<any>(this.baseUrl + 'requestAuthor/deny', requestId);
  }

  acceptAction(requestId: number) {
    return this.http.post<any>(this.baseUrl + 'requestAuthor/accept', requestId);
  }

  contactAction(requestId: number) {
    return this.http.post<any>(this.baseUrl + 'requestAuthor/contact', requestId);
  }

}
