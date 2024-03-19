export interface RecommendComicDto {
  id: number;
  urlImage: string;
  comicName: string;
  newestChapter: string;
  newestChapterId:number;
  updateTime: Date | null;
}
