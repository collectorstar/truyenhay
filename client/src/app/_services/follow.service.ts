import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GetComicFollowParam } from '../_models/getComicFollowParam';
import { getPaginationHeader, getPaginationResult } from './paginationHelper';
import { ComicFollowDto } from '../_models/comicFollowDto';

@Injectable({
  providedIn: 'root'
})
export class FollowService {
  baseUrl = environment.apiUrl;
  constructor(private http:HttpClient) { }

  getComicsFollow(param : GetComicFollowParam,email : string){
    let params = getPaginationHeader(
      param.pageNumber,
      param.pageSize
    );
    params = params.append("email",email);
    return getPaginationResult<ComicFollowDto[]>(
      this.baseUrl + 'follow',
      params,
      this.http
    );
  }
}
