import { ApprovalStatusComic } from '../_extensions/enumHelper';

export interface ApprovalComicDto {
  id: number;
  name: string;
  creationTime: Date;
  approvalStatus: ApprovalStatusComic;
  authorId: number;
  mainImage: string;
  desc: string;
  genres: string;
}
