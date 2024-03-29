import { ChapterForComicDetailDto } from './chapterForComicDetailDto';
import { GenreForComicDetailDto } from './genreForComicDetailDto';

export interface ComicDetailDto {
  id: number;
  name: string;
  desc: string;
  isFeatured: boolean;
  mainImage: string;
  rate: number;
  noReviews: number;
  noFollows: number;
  noComments: number;
  authorId: number;
  authorName: string;
  isFollow: boolean;
  genres: GenreForComicDetailDto[];
  chapters: ChapterForComicDetailDto[];
  chapterIdContinue: number;
  chapterNameContinue: string;
}
