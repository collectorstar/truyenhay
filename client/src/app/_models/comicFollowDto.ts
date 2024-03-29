import { ChapterForComicFollowDto } from './chapterForComicFollowDto';

export interface ComicFollowDto {
  id: number;
  comicName: string;
  mainImage: string;
  rate: number;
  noReviews: number;
  chapterIdContinue: number;
  chapterNameContinue: string;
  chapters: ChapterForComicFollowDto[];
}
