import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GetAllComicForApprovalChapterParam } from '../_models/getAllComicForApprovalChapterParam';
import { getPaginationHeader, getPaginationResult } from './paginationHelper';
import { ApprovalChapterDto } from '../_models/approvalChapterDto';

@Injectable({
  providedIn: 'root',
})
export class ApprovalChapterService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(param: GetAllComicForApprovalChapterParam) {
    let params = getPaginationHeader(param.pageNumber, param.pageSize);
    params = params.append('comicName', param.comicName);
    params = params.append('chapterName', param.chapterName);
    params = params.append('hideAcceptChapter', param.hideAcceptChapter);
    return getPaginationResult<ApprovalChapterDto[]>(
      this.baseUrl + 'approvalChapter',
      params,
      this.http
    );
  }

  accept(dto: ApprovalChapterDto) {
    return this.http.post(this.baseUrl + 'approvalChapter/accept-chapter', dto);
  }

  deny(dto: ApprovalChapterDto) {
    return this.http.post(this.baseUrl + 'approvalChapter/deny-chapter', dto);
  }

  delete(dto: ApprovalChapterDto) {
    return this.http.post(this.baseUrl + 'approvalChapter/delete-chapter', dto);
  }

  getInfoChapter(comicId: number, chapterId: number) {
    let param = new HttpParams();
    param = param.append('comicId', comicId);
    param = param.append('chapterId', chapterId);
    return this.http.get<string[]>(
      this.baseUrl + 'approvalChapter/get-info-chapter',
      { params: param }
    );
  }
}
