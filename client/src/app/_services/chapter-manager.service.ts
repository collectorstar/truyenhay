import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ChapterManagerParam } from '../_models/chapterManagerParam';
import { getPaginationHeader, getPaginationResult } from './paginationHelper';
import { ChapterForChapterManagerDto } from '../_models/chapterForChapterManagerDto';

@Injectable({
  providedIn: 'root',
})
export class ChapterManagerService {
  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAll(param: ChapterManagerParam) {
    let params = getPaginationHeader(param.pageNumber, param.pageSize);
    params = params.append('chapterName', param.chapterName);
    params = params.append('comicName', param.comicName);
    return getPaginationResult<ChapterForChapterManagerDto[]>(
      this.baseUrl + 'chapterManager',
      params,
      this.http
    );
  }

  deleteChapter(chapterId: number) {
    return this.http.post(
      this.baseUrl + 'chapterManager/delete-chapter',
      chapterId
    );
  }
}
