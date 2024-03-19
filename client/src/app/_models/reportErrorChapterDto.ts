import { ReportErrorCode } from '../_extensions/enumHelper';

export interface ReportErrorChapterDto {
  comicId: number;
  chapterId: number;
  errorCode: ReportErrorCode;
  desc: string;
}
