export class UserForUserManagerParam {
  pageNumber = 1;
  pageSize = 20;
  email: string = '';
  allUser: boolean = false;
  fromDate: Date = new Date();
  toDate: Date = new Date();
  onlyAuthor: boolean = false;
}
