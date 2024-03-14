import { ChapterForComicFollowDto } from "./chapterForComicFollowDto";

export interface ComicFollowDto{
    id: number;
    comicName: string;
    isFeatured:boolean;
    mainImage:string;
    rate:number;
    noReviews:number;
    chapters: ChapterForComicFollowDto[]
}