import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ComicManagerParam } from '../_models/comicManagerParam';
import { getPaginationHeader, getPaginationResult } from './paginationHelper';
import { ComicForComicManagerDto } from '../_models/comicForComicManagerDto';

@Injectable({
  providedIn: 'root',
})
export class ComicManagerService {
  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAll(param: ComicManagerParam) {
    let params = getPaginationHeader(param.pageNumber, param.pageSize);
    params = params.append('email', param.email);
    params = params.append('comicName', param.comicName);
    return getPaginationResult<ComicForComicManagerDto[]>(
      this.baseUrl + 'comicManager',
      params,
      this.http
    );
  }

  transferComic(comicId: number, email: string) {
    return this.http.post(this.baseUrl + 'comicManager/transfer-comic', {
      comicId,
      email,
    });
  }

  deleteComic(comicId: number) {
    return this.http.post(this.baseUrl + 'comicManager/delete-comic', comicId);
  }
}
