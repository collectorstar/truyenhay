import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { getPaginationHeader, getPaginationResult } from './paginationHelper';
import { GetFindAuthorParam } from '../_models/getFindAuthorParam';
import { ComicForFindAuthorDto } from '../_models/comicForFindAuthorDto';

@Injectable({
  providedIn: 'root',
})
export class FindAuthorService {
  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAll(param: GetFindAuthorParam) {
    let params = getPaginationHeader(param.pageNumber, param.pageSize);
    params = params.append('authorName', param.authorName);
    return getPaginationResult<ComicForFindAuthorDto[]>(
      this.baseUrl + 'findAuthor',
      params,
      this.http
    );
  }
}
