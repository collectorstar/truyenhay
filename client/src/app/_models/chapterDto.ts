import { ApprovalStatusChapter } from "../_extensions/enumHelper";

export interface ChapterDto {
  id: number | null;
  name: string;
  creationTime: Date;
  updateTime: Date | null;
  view: number;
  status: boolean;
  approvalStatus: ApprovalStatusChapter;
}
