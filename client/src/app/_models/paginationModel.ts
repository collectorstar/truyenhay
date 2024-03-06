export interface PaginationModel {
  pageNum: number;
  pageSize: number;
  totalCount: number;
  totalPage?: number;
  fieldSort?: any;
  sortType?: any;
  filters?: any;
}
