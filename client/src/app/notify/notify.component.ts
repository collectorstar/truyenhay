import { Component, OnInit } from '@angular/core';
import { NotifyService } from '../_services/notify.service';
import { ToastrService } from 'ngx-toastr';
import { BusyService } from '../_services/busy.service';
import { Pagination } from '../_models/pagination';
import { GetAllNotifyDto } from '../_models/getAllNotifyDto';
import { NotifyParam } from '../_models/notifyParam';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notify',
  templateUrl: './notify.component.html',
  styleUrls: ['./notify.component.css'],
})
export class NotifyComponent implements OnInit {
  paginationParams: Pagination = {
    currentPage: 1,
    itemsPerPage: 5,
    totalItems: 0,
    totalPages: 1,
  };
  rowData: GetAllNotifyDto[] = [];
  constructor(
    private notifyService: NotifyService,
    private toastr: ToastrService,
    private busyService: BusyService,
    public router: Router
  ) {}
  ngOnInit(): void {
    this.getAll();
  }

  getAll() {
    let param = new NotifyParam();
    param.pageNumber = this.paginationParams.currentPage;
    param.pageSize = this.paginationParams.itemsPerPage;
    this.busyService.busy();
    this.notifyService
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

  markReaded(notify: GetAllNotifyDto) {
    this.notifyService.markReaded(notify.id).subscribe();
    this.router.navigateByUrl(notify.link);
  }

  markAllDone() {
    this.busyService.busy();
    this.notifyService
      .markAllReaded()
      .pipe(
        finalize(() => {
          this.busyService.idle();
          this.getAll();
        })
      )
      .subscribe();
  }
}
