export interface GetUserForUserManagerDto {
  id: number;
  email: string;
  isAuthor: boolean;
  creationTime: Date;
  maxComic: number;
  isBlock: boolean;
}
