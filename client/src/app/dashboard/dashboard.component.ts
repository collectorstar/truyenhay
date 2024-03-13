import { RecommendComicsService } from 'src/app/_services/recommend-comics.service';
import { Component } from '@angular/core';
import { BusyService } from '../_services/busy.service';
import { ToastrService } from 'ngx-toastr';
import { finalize, forkJoin } from 'rxjs';
import { RecommendComicDto } from '../_models/recommendComicDto';
import { DashboardService } from '../_services/dashboard.service';
import { ComicNewestDto } from '../_models/comicNewestDto';
import { Pagination } from '../_models/pagination';
import { GetNewestComicParam } from '../_models/getNewestComicParam';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  paginationParams: Pagination = {
    currentPage: 1,
    itemsPerPage: 36,
    totalItems: 0,
    totalPages: 1,
  };
  carouselData: RecommendComicDto[] = [];
  newestComics: ComicNewestDto[] = [];

  constructor(
    private recomService: RecommendComicsService,
    private busyService: BusyService,
    private toastr: ToastrService,
    private dashboardService: DashboardService
  ) {
    this.getDataCarousel();
  }

  getDataCarousel() {
    this.busyService.busy();

    let param = new GetNewestComicParam();
    param.pageNumber = this.paginationParams.currentPage;
    param.pageSize = this.paginationParams.itemsPerPage;

    const dataForCarousel = this.recomService.getDataForCarousel();
    const newestUpdate = this.dashboardService.getListComicNewest(param);

    forkJoin([dataForCarousel, newestUpdate])
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: (res) => {
          this.carouselData = res[0];
          if (res[1] && res[1].pagination && res[1].result) {
            this.newestComics = res[1].result;
            this.paginationParams = res[1].pagination;
          }
        },
      });
  }

  getAll() {
    let param = new GetNewestComicParam();
    param.pageNumber = this.paginationParams.currentPage;
    param.pageSize = this.paginationParams.itemsPerPage;
    this.dashboardService
      .getListComicNewest(param)
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: (res) => {
          if (res && res.pagination && res.result) {
            this.newestComics = res.result;
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
