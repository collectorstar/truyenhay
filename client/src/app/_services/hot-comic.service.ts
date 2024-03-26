import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GetAllHotComicDto } from '../_models/getAllHotComicDto';
import { ComicHotParams } from '../_models/comicHotParams';
import { getPaginationHeader, getPaginationResult } from './paginationHelper';

@Injectable({
  providedIn: 'root',
})
export class HotComicService {
  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAll(param: ComicHotParams) {
    let params = getPaginationHeader(param.pageNumber, param.pageSize);

    params = params.append('comicName', param.comicName);
    params = params.append('isOnlyHotComic', param.isOnlyHotComic);

    return getPaginationResult<GetAllHotComicDto[]>(
      this.baseUrl + 'hotComic',
      params,
      this.http
    );
  }

  update(dto: GetAllHotComicDto) {
    return this.http.post(this.baseUrl + 'hotComic', dto);
  }
}
