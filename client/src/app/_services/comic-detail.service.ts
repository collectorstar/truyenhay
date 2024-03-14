import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ComicDetailDto } from '../_models/comicDetailDto';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class ComicDetailService {

  baseUrl = environment.apiUrl;
  constructor(private http:HttpClient) { }

  getComic(comicId: number,user: User | null){
    return this.http.get<ComicDetailDto>(this.baseUrl + "comicDetail?comicId="+comicId+"&email="+(user != null ? user?.email : ""));
  }

  rating(comicId : number,rate: number){
    return this.http.post<any>(this.baseUrl + "comicDetail/rating/"+comicId,rate);
  }

  follow(comicId: number){
    return this.http.post<any>(this.baseUrl + "comicDetail/follow-comic/"+comicId,null);
  }

  unfollow(comicId: number){
    return this.http.post<any>(this.baseUrl + "comicDetail/unfollow-comic/"+comicId,null);
  }
}
