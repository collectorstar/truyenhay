import { Component, OnInit } from '@angular/core';
import { Pagination } from '../_models/pagination';
import { ToastrService } from 'ngx-toastr';
import { BusyService } from '../_services/busy.service';
import { FollowService } from '../_services/follow.service';
import { Router } from '@angular/router';
import { GetComicFollowParam } from '../_models/getComicFollowParam';
import { finalize } from 'rxjs';
import { ComicFollowDto } from '../_models/comicFollowDto';
import { AccountService } from '../_services/account.service';
import { User } from '../_models/user';

@Component({
  selector: 'app-follow',
  templateUrl: './follow.component.html',
  styleUrls: ['./follow.component.css'],
})
export class FollowComponent implements OnInit {
  followComics: ComicFollowDto[] = [];
  paginationParams: Pagination = {
    currentPage: 1,
    itemsPerPage: 36,
    totalItems: 0,
    totalPages: 1,
  };
  user: User | null = null;

  constructor(
    private toastr: ToastrService,
    private busyService: BusyService,
    private followService: FollowService,
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

  
  toValidURL(inputString: string): string {
    const noSpacesString = inputString.replace(/\s/g, '-');
    const encodedString = noSpacesString.replace(
      /[^a-zA-Z0-9-_.~]/g,
      (char) => {
        return encodeURIComponent(char);
      }
    );
    const normalizedString = encodedString.replace(/--+/g, '-');
    const lowercaseString = normalizedString.toLowerCase();
    return lowercaseString;
  }
}
