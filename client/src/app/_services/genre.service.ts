import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GenreParams } from '../_models/genreParams';
import { getPaginationHeader, getPaginationResult } from './paginationHelper';
import { GenreDto } from '../_models/genreDto';
import { ConfirmService } from './confirm.service';
import { of, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GenreService implements OnInit {
  baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private confirmService: ConfirmService
  ) {}
  ngOnInit(): void {}

  getGenresByName(genreParams: GenreParams) {
    let params = getPaginationHeader(
      genreParams.pageNumber,
      genreParams.pageSize
    );

    params = params.append('name', genreParams.name);

    return getPaginationResult<GenreDto[]>(
      this.baseUrl + 'genre',
      params,
      this.http
    );
  }

  createOrEditGenre(dto: GenreDto) {
    return this.http.post<any>(this.baseUrl + 'genre', dto);
  }

  deleteGenre(id: number) {
    return this.http.delete<any>(this.baseUrl + 'genre?id=' + id);
  }
}
