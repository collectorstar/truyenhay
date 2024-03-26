export interface CommentDto {
  id: number;
  chapterId: number;
  chapterName: string;
  name: string;
  content: string;
  photoAvatar: string;
  creationTime: Date;
  comicName: string;
  comicId: number;
}
