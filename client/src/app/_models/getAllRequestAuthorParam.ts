export class GetAllRequestAuthorParam {
    email: string = "";
    onlySendRequest: boolean = false;
    fromDate: Date = new Date();
    toDate: Date = new Date();
    pageNumber = 1;
    pageSize = 20;
}