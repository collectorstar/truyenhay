import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ComicNewestDto } from '../_models/comicNewestDto';
import { GetNewestComicParam } from '../_models/getNewestComicParam';
import { getPaginationHeader, getPaginationResult } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  baseUrl = environment.apiUrl;

  constructor(private http:HttpClient) { }

  getListComicNewest(param: GetNewestComicParam){
    let params = getPaginationHeader(
      param.pageNumber,
      param.pageSize
    );
    return getPaginationResult<ComicNewestDto[]>(
      this.baseUrl + 'dashboard',
      params,
      this.http
    );
  }
}
