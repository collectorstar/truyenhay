import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BusyService } from '../_services/busy.service';
import { Router } from '@angular/router';
import { User } from '../_models/user';
import { Pagination } from '../_models/pagination';
import { AccountService } from '../_services/account.service';
import { GenreForFindComicDto } from '../_models/genreForFindComicDto';
import { FindComicService } from '../_services/find-comic.service';
import { finalize } from 'rxjs';
import { ComicForFindComicParams } from '../_models/comicForFindComicParams';

@Component({
  selector: 'app-find-comic',
  templateUrl: './find-comic.component.html',
  styleUrls: ['./find-comic.component.css'],
})
export class FindComicComponent implements OnInit {
  dropDownGenres: GenreForFindComicDto[] = [];
  selectedGenres: GenreForFindComicDto[] = [];
  user: User | null = null;
  rowData: any[] = [];
  statusComic: number = 0;
  comicName: string = '';
  paginationParams: Pagination = {
    currentPage: 1,
    itemsPerPage: 36,
    totalItems: 0,
    totalPages: 1,
  };
  constructor(
    private findComicService: FindComicService,
    private toastr: ToastrService,
    private busyService: BusyService,
    public router: Router,
    private accountService: AccountService
  ) {
    this.accountService.currentUser$.subscribe({
      next: (res) => {
        this.user = res;
      },
    });
  }
  ngOnInit(): void {
    this.findComicService
      .getGenres()
      .pipe(
        finalize(() => {
          this.busyService.idle();
          this.getAll();
        })
      )
      .subscribe({
        next: (res) => {
          this.dropDownGenres = res;
          this.selectedGenres = res;
        },
      });
  }

  getAll() {
    if (this.selectedGenres.length < 1) {
      this.toastr.warning('Choose at lease one genre!');
      return;
    }
    console.log(this.comicName)
    let genres = JSON.stringify(this.selectedGenres.map((x) => x.value));
    let param = new ComicForFindComicParams();
    param.pageNumber = this.paginationParams.currentPage;
    param.pageSize = this.paginationParams.itemsPerPage;
    param.comicName = this.comicName.trim();
    param.statusComic = this.statusComic;
    this.busyService.busy();
    this.findComicService
      .getAll(param, genres)
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

  selectStatusComic(stautsComic: number) {
    this.statusComic = stautsComic;
    this.paginationParams.currentPage = 1;
    this.getAll();
  }

  onChange(event: any) {
    this.selectedGenres = event;
  }

  convertToK(target: number): string {
    if (target < 1000) return target + '';
    return (target / 1000).toFixed(2) + 'k';
  }
}
