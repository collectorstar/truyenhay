import { ChapterPhotoDto } from './chapterPhotoDto';

export interface ChapterDto {
  id: number | null;
  name: string;
  creationTime: Date;
  updateTime: Date | null; 
  view: number;
  status: boolean;
  chapterPhotoDtos: ChapterPhotoDto[];
}
