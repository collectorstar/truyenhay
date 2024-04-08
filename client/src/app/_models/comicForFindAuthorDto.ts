import { ChapterForFindAuthorDto } from "./chapterForFindAuthorDto";

export interface ComicForFindAuthorDto {
  id: number;
  comicName: string;
  mainImage: string;
  noViews: number;
  noFollows: number;
  noComments: number;
  chapters: ChapterForFindAuthorDto[]
}
