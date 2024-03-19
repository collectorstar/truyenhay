import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ComicInfoForComicChapterDto } from '../_models/comicInfoForComicChapterDto';
import { ChapterInfoForComicChapterDto } from '../_models/chapterInfoForComicChapterDto';
import { ReportErrorChapterDto } from '../_models/reportErrorChapterDto';

@Injectable({
  providedIn: 'root',
})
export class ChapterService {
  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getChapterImages(comicId: number, chapterId: number) {
    let params = new HttpParams();
    params = params.append('comicId', comicId);
    params = params.append('chapterId', chapterId);
    return this.http.get<string[]>(this.baseUrl + 'comicChapter', {
      params,
    });
  }

  getComicInfo(comicId: number, email: string) {
    let params = new HttpParams();
    params = params.append('comicId', comicId);
    params = params.append('email', email);
    return this.http.get<ComicInfoForComicChapterDto>(
      this.baseUrl + 'comicChapter/comic-info',
      { params }
    );
  }

  getChapterInfo(comicId: number, chapterId: number, email: string) {
    let params = new HttpParams();
    params = params.append('comicId', comicId);
    params = params.append('chapterId', chapterId);
    params = params.append('email', email);
    return this.http.get<ChapterInfoForComicChapterDto>(
      this.baseUrl + 'comicChapter/chapter-info',
      { params }
    );
  }

  getListChapterComic(comicId: number, email: string) {
    let params = new HttpParams();
    params = params.append('comicId', comicId);
    params = params.append('email', email);
    return this.http.get<ChapterInfoForComicChapterDto[]>(
      this.baseUrl + 'comicChapter/list-chapter-comic',
      { params }
    );
  }

  markChapterHasReaded(comicId: number, chapterId: number) {
    let params = new HttpParams();
    params = params.append('comicId', comicId);
    params = params.append('chapterId', chapterId);
    return this.http.post(
      this.baseUrl + 'comicChapter/set-has-read-chapter',
      {},
      { params }
    );
  }

  follow(comicId: number) {
    return this.http.post<any>(
      this.baseUrl + 'comicChapter/follow-comic/' + comicId,
      null
    );
  }

  unfollow(comicId: number) {
    return this.http.post<any>(
      this.baseUrl + 'comicChapter/unfollow-comic/' + comicId,
      null
    );
  }

  reportChapter(dto: ReportErrorChapterDto) {
    return this.http.post(
      this.baseUrl + 'comicChapter/report-error-chapter',
      dto
    );
  }
}
