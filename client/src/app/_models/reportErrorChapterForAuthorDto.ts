import { ReportErrorCode } from '../_extensions/enumHelper';

export interface ReportErrorChapterForAuthorDto {
  id: number;
  userId: number;
  comicId: number;
  comicName: string;
  chapterId: number;
  chapterName: string;
  creationTime: Date;
  errorCode: ReportErrorCode;
  desc: string;
  status: boolean;
}
