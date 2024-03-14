import { ChapterDto } from './chapterDto';

export interface ComicDetailDtoForListChapter {
  id: number;
  name: string;
  chapters: ChapterDto[];
}
