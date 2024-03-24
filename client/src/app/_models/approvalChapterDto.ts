import { ApprovalStatusChapter } from '../_extensions/enumHelper';

export interface ApprovalChapterDto {
  id: number;
  name: string;
  updateTime: Date;
  comicId: number;
  comicName: string;
  approvalStatus: ApprovalStatusChapter;
}
