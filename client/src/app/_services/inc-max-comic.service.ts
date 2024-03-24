import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GetAllReqIncMacComicParam } from '../_models/getAllReqIncMacComicParam';
import { getPaginationHeader, getPaginationResult } from './paginationHelper';
import { ReqIncMaxComicDto } from '../_models/reqIncMaxComicDto';

@Injectable({
  providedIn: 'root'
})
export class IncMaxComicService {
  baseUrl = environment.apiUrl;
  constructor(private http:HttpClient) { }

  getAll(param: GetAllReqIncMacComicParam){
    let params = getPaginationHeader(param.pageNumber, param.pageSize);
    params = params.append('email', param.email);
    params = params.append('isShowWattingReq',param.isShowWattingReq);
    return getPaginationResult<ReqIncMaxComicDto[]>(
      this.baseUrl + 'requestIncMaxComic',
      params,
      this.http
    );
  }

  accept(dto: ReqIncMaxComicDto){
    return this.http.post(this.baseUrl+"requestIncMaxComic/accept",dto);
  }

  deny(dto: ReqIncMaxComicDto){
    return this.http.post(this.baseUrl+"requestIncMaxComic/deny",dto);
  }
}
