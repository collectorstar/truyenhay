export interface GenreDto {
  id: number | null;
  name: string;
  desc: string;
  isFeatured: boolean;
  status: boolean;
  creationTime: Date;
}
