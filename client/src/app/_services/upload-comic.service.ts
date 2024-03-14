import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UploadAuthorDto } from '../_models/uploadAuthorDto';
import { GetAllUploadComicParam } from '../_models/getAllUploadComicParam';
import { getPaginationHeader, getPaginationResult } from './paginationHelper';
import { UploadComicDto } from '../_models/uploadComicDto';
import { ChapterDto } from '../_models/chapterDto';
import { ConfirmService } from './confirm.service';
import { GenreForUploadComicDto } from '../_models/genreForUploadComicDto';
import { ComicDetailDtoForListChapter } from '../_models/comicDetailDtoForListChapter';

@Injectable({
  providedIn: 'root',
})
export class UploadComicService {
  baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private confirmService: ConfirmService
  ) {}

  requestAuthor(content: string) {
    let param: UploadAuthorDto = { content: content };
    return this.http.post<any>(
      this.baseUrl + 'uploadComic/request-author',
      param
    );
  }

  getComicsByName(uploadComicParam: GetAllUploadComicParam) {
    let params = getPaginationHeader(
      uploadComicParam.pageNumber,
      uploadComicParam.pageSize
    );
    params = params.append('name', uploadComicParam.name);
    return getPaginationResult<UploadComicDto[]>(
      this.baseUrl + 'uploadComic/my-comics',
      params,
      this.http
    );
  }

  getListChapter(comicId: number) {
    return this.http.get<ComicDetailDtoForListChapter>(
      this.baseUrl + 'uploadComic/list-chapter?comicId=' + comicId
    );
  }

  createOrEditComic(
    dto: UploadComicDto,
    file: File,
    listGenre: GenreForUploadComicDto[]
  ) {
    let param = new FormData();
    if (dto.id != null) {
      param.append('id', dto.id.toString());
    }
    param.append('file', file);
    param.append('name', dto.name);
    param.append('desc', dto.desc);
    param.append('status', dto.status ? 'true' : 'false');

    var list = JSON.stringify(listGenre);

    param.append('listGenre', list);

    return this.http.post<any>(this.baseUrl + 'uploadComic', param);
  }

  deleteComic(comicId: number) {
    return this.http.delete<any>(
      this.baseUrl + 'uploadComic?comicId=' + comicId
    );
  }

  getListGenre() {
    return this.http.get<GenreForUploadComicDto[]>(
      this.baseUrl + 'uploadComic/list-genre'
    );
  }

  createOrEditChapter(dto: ChapterDto, files: File[], comicId: number) {
    let form = new FormData();

    if (dto.id != null) {
      form.append('id', dto.id.toString());
    }

    form.append('comicId', comicId.toString());
    form.append('status', dto.status ? 'true' : 'false');
    form.append('name', dto.name);
    for (const file of files) {
      form.append('files', file);
    }

    return this.http.post<any>(
      this.baseUrl + 'uploadComic/create-or-edit-chapter',
      form
    );
  }

  deleteChapter(comicId: number, chapterId: number) {
    return this.http.delete<any>(
      this.baseUrl +
        'uploadComic/delete-chapter/' +
        comicId +
        '?chapterId=' +
        chapterId
    );
  }
}
