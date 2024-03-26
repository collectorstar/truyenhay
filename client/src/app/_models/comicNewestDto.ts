import { ChapterForComicNewestDto } from './chapterForComicNewestDto';

export interface ComicNewestDto {
  id: number;
  comicName: string;
  isFeatured: boolean;
  mainImage: string;
  noFollows: number;
  rate: number;
  noReviews: number;
  noComments: number;
  chapters: ChapterForComicNewestDto[];
}
