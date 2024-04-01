import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { getPaginationHeader, getPaginationResult } from './paginationHelper';
import { GenreCusParams } from '../_models/genreCusParams';
import { ComicForGenreCusDto } from '../_models/comicForGenreCusDto';
import { GenreCusOption } from '../_models/genreCusOption';

@Injectable({
  providedIn: 'root',
})
export class GenreCusService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(param: GenreCusParams, email: string) {
    let params = getPaginationHeader(param.pageNumber, param.pageSize);
    params = params.append('email', email);
    params = params.append('genreId', param.genreId);
    params = params.append('statusComic', param.statusComic);
    return getPaginationResult<ComicForGenreCusDto[]>(
      this.baseUrl + 'genreCus',
      params,
      this.http
    );
  }

  getGenres() {
    return this.http.get<GenreCusOption[]>(
      this.baseUrl + 'genreCus/get-genres'
    );
  }
}
