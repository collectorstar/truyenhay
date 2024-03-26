import { RecommendComicDto } from '../_models/recommendComicDto';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ComicForIsRecommend } from '../_models/comicForIsRecommendDto';

@Injectable({
  providedIn: 'root',
})
export class RecommendComicsService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<RecommendComicDto[]>(this.baseUrl + 'carosel');
  }
  
  getDataForCarousel() {
    return this.http.get<RecommendComicDto[]>(this.baseUrl + 'carosel/get-data');
  }

  update(comicRecommends: ComicForIsRecommend[]) {
    let formdata = new FormData();
    return this.http.post<any>(this.baseUrl + 'carosel',  comicRecommends);
  }

  getListComic() {
    return this.http.get<ComicForIsRecommend[]>(
      this.baseUrl + 'carosel/list-comic'
    );
  }

  getListComicRecommend() {
    return this.http.get<ComicForIsRecommend[]>(
      this.baseUrl + 'carosel/list-comic-recommend'
    );
  }
}
