import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GetComicHistoryParam } from '../_models/getComicHistoryParam';
import { getPaginationHeader, getPaginationResult } from './paginationHelper';
import { GetComicHistoryDto } from '../_models/getComicHistoryDto';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAll(param: GetComicHistoryParam) {
    let params = getPaginationHeader(
      param.pageNumber,
      param.pageSize
    );
    return getPaginationResult<GetComicHistoryDto[]>(
      this.baseUrl + 'history',
      params,
      this.http
    );
  }
}
