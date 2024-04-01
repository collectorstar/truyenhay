import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GenreForFindComicDto } from '../_models/genreForFindComicDto';
import { getPaginationHeader, getPaginationResult } from './paginationHelper';
import { ComicForFindComicDto } from '../_models/comicForFindComicDto';
import { ComicForFindComicParams } from '../_models/comicForFindComicParams';

@Injectable({
  providedIn: 'root',
})
export class FindComicService {
  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getGenres() {
    return this.http.get<GenreForFindComicDto[]>(
      this.baseUrl + 'findComic/get-genres'
    );
  }

  getAll(param: ComicForFindComicParams, genresSeleted: string) {
    let params = getPaginationHeader(param.pageNumber, param.pageSize);
    params = params.append('statusComic', param.statusComic);
    params = params.append('genresSeleted', genresSeleted);
    params = params.append('comicName', param.comicName);
    return getPaginationResult<ComicForFindComicDto[]>(
      this.baseUrl + 'findComic',
      params,
      this.http
    );
  }
}
