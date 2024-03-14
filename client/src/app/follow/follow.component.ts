import { Component, OnInit } from '@angular/core';
import { Pagination } from '../_models/pagination';
import { ToastrService } from 'ngx-toastr';
import { BusyService } from '../_services/busy.service';
import { FollowService } from '../_services/follow.service';
import { Router } from '@angular/router';
import { GetComicFollowParam } from '../_models/getComicFollowParam';
import { finalize } from 'rxjs';
import { ComicFollowDto } from '../_models/comicFollowDto';

@Component({
  selector: 'app-follow',
  templateUrl: './follow.component.html',
  styleUrls: ['./follow.component.css'],
})
export class FollowComponent implements OnInit {
  followComics : ComicFollowDto[] = [];
  paginationParams: Pagination = {
    currentPage: 1,
    itemsPerPage: 36,
    totalItems: 0,
    totalPages: 1,
  };
  constructor(
    private toastr: ToastrService,
    private busyService: BusyService,
    private followService: FollowService,
    public router: Router
  ) {

  }
  ngOnInit(): void {
    this.getAll();
  }

  getAll() {
    let param = new GetComicFollowParam();
    param.pageNumber = this.paginationParams.currentPage;
    param.pageSize = this.paginationParams.itemsPerPage;
    this.followService
      .getComicsFollow(param)
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: (res) => {
          if (res && res.pagination && res.result) {
            this.followComics = res.result;
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
}
