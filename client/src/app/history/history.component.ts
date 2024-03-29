import { Component, OnInit } from '@angular/core';
import { HistoryService } from '../_services/history.service';
import { ToastrService } from 'ngx-toastr';
import { BusyService } from '../_services/busy.service';
import { finalize } from 'rxjs';
import { GetComicHistoryParam } from '../_models/getComicHistoryParam';
import { Pagination } from '../_models/pagination';
import { GetComicHistoryDto } from '../_models/getComicHistoryDto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})
export class HistoryComponent implements OnInit {
  paginationParams: Pagination = {
    currentPage: 1,
    itemsPerPage: 36,
    totalItems: 0,
    totalPages: 1,
  };
  rowData: GetComicHistoryDto[] = [];

  constructor(
    private historyService: HistoryService,
    private toastr: ToastrService,
    private busyService: BusyService,
    public router: Router,
  ) {}
  ngOnInit(): void {
    this.getAll();
  }

  getAll() {
    this.busyService.busy();
    let param = new GetComicHistoryParam();
    param.pageNumber = this.paginationParams.currentPage;
    param.pageSize = this.paginationParams.itemsPerPage;
    this.historyService
      .getAll(param)
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: (res) => {
          if (res && res.pagination && res.result) {
            this.rowData = res.result;
            this.paginationParams = res.pagination;
          }
        },
      });
  }

  paginationChange(event: any) {
    this.paginationParams.currentPage = event.page + 1;
    this.paginationParams.itemsPerPage = event.rows;
    this.paginationParams.totalPages = event.pageCount;
    this.getAll();
  }

  convertToK(target: number): string {
    if (target < 1000) return target + '';
    return (target / 1000).toFixed(2) + 'k';
  }
}
