import { ChapterForGenreCusDto } from "./chapterForGenreCusDto";

export interface ComicForGenreCusDto {
  id: number;
  comicName: string;
  isFeatured: boolean;
  mainImage: string;
  rate: number;
  noReviews: number;
  noFollows: number;
  noComments: number;
  chapters: ChapterForGenreCusDto[];
}
