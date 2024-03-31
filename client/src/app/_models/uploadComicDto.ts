import { ApprovalStatusComic } from '../_extensions/enumHelper';
import { GenreForUploadComicDto } from './genreForUploadComicDto';

export interface UploadComicDto {
  id: number | null;
  authorName: string;
  name: string;
  isFeatured: boolean;
  desc: string;
  status: boolean;
  isCompleted: boolean;
  mainImage: string;
  rate: number;
  nOReviews: number;
  totalChapter: number;
  newestChapter: string;
  approvalStatus: ApprovalStatusComic;
  selectedGenres: GenreForUploadComicDto[];
}
