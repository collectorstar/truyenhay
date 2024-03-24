import { ApprovalStatusComic } from '../_extensions/enumHelper';
import { GenreForUploadComicDto } from './genreForUploadComicDto';

export interface UploadComicDto {
  id: number | null;
  name: string;
  isFeatured: boolean;
  desc: string;
  status: boolean;
  mainImage: string;
  rate: number;
  nOReviews: number;
  totalChapter: number;
  newestChapter: string;
  approvalStatus: ApprovalStatusComic;
  selectedGenres: GenreForUploadComicDto[];
}
