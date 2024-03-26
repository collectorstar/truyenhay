import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CommentDto } from '../_models/commentDto';
import { getPaginationHeader, getPaginationResult } from './paginationHelper';
import { GetCommentsParam } from '../_models/getCommentsParam';
import { SendCommentDto } from '../_models/sendCommentDto';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAllComment(param: GetCommentsParam) {
    let params = getPaginationHeader(param.pageNumber, param.pageSize);
    params = params.append('comicId', param.comicId);
    params = params.append('chapterId', param.chapterId);
    return getPaginationResult<CommentDto[]>(
      this.baseUrl + 'comment/get-comments',
      params,
      this.http
    );
  }

  sendComment(dto: SendCommentDto) {
    return this.http.post(this.baseUrl + 'comment/send-comment', dto);
  }
}
