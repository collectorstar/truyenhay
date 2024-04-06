import { ChapterForFindComicDto } from './chapterForFindComicDto';

export interface ComicForFindComicDto {
  id: number;
  comicName: string;
  isFeatured: boolean;
  mainImage: string;
  rate: number;
  noReviews: number;
  noFollows: number;
  noComments: number;
  noViews: number;
  noChapters: number;
  chapters: ChapterForFindComicDto[];
}
