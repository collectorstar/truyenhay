import { ChapterForComicNewestDto } from "./chapterForComicNewestDto";

export interface ComicNewestDto{
    id: number;
    comicName: string;
    isFeatured:boolean;
    mainImage:string;
    rate:number;
    noReviews:number;
    chapters: ChapterForComicNewestDto[]
}