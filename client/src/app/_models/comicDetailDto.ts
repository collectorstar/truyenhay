import { ChapterDto } from './chapterDto';

export interface ComicDetailDto {
  id: number;
  name: string;
  isFeatured: boolean;
  desc: string;
  mainImage: string;
  rate: number;
  nOReviews: number;
  creationTime: Date;
  authorId: number;
  chapters: ChapterDto[];
}
