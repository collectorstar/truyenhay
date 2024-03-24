import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GetAllComicForApprovalComicParam } from '../_models/getAllComicForApprovalComicParam';
import { getPaginationHeader, getPaginationResult } from './paginationHelper';
import { ApprovalComicDto } from '../_models/approvalComicDto';

@Injectable({
  providedIn: 'root',
})
export class ApprovalComicService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(param: GetAllComicForApprovalComicParam) {
    let params = getPaginationHeader(param.pageNumber, param.pageSize);
    params = params.append('name', param.name);
    params = params.append('hideAcceptComic',param.hideAcceptComic)
    return getPaginationResult<ApprovalComicDto[]>(
      this.baseUrl + 'approvalComic',
      params,
      this.http
    );
  }

  accept(dto : ApprovalComicDto){
    return this.http.post(this.baseUrl + "approvalComic/accept-comic",dto);
  }

  deny(dto : ApprovalComicDto){
    return this.http.post(this.baseUrl + "approvalComic/deny-comic",dto);
  }

  delete(dto : ApprovalComicDto){
    return this.http.post(this.baseUrl + "approvalComic/delete-comic",dto);
  }

  deleteAll(dto : GetAllComicForApprovalComicParam){
    return this.http.post(this.baseUrl + "approvalComic/delete-all-deny",dto);
  }
}
