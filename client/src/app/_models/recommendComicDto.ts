export interface RecommendComicDto {
  id: number;
  urlImage: string;
  comicName: string;
  newestChapter: string;
  updateTime: Date | null;
}
