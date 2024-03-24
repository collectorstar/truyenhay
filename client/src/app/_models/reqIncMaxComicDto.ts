import { RequestIncMaxComicStatus } from '../_extensions/enumHelper';

export interface ReqIncMaxComicDto {
  id: number;
  email: string;
  quantity: number;
  request: string;
  creationTime: Date;
  status: RequestIncMaxComicStatus;
  processingDate: Date | null;
}
