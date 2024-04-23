import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FindAuthorService } from '../_services/find-author.service';
import { Pagination } from '../_models/pagination';
import { ComicForFindAuthorDto } from '../_models/comicForFindAuthorDto';
import { GetFindAuthorParam } from '../_models/getFindAuthorParam';
import { finalize } from 'rxjs';
import { BusyService } from '../_services/busy.service';

@Component({
  selector: 'app-find-author',
  templateUrl: './find-author.component.html',
  styleUrls: ['./find-author.component.css'],
})
export class FindAuthorComponent implements OnInit {
  authorName: string = '';
  paginationParams: Pagination = {
    currentPage: 1,
    itemsPerPage: 36,
    totalItems: 0,
    totalPages: 1,
  };
  rowData: ComicForFindAuthorDto[] = [];
  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private busyService: BusyService,
    private findAuthorService: FindAuthorService
  ) {}
  ngOnInit(): void {
    let temp = this.route.snapshot.params['authorName'];
    if (temp) {
      this.authorName = temp.replaceAll('-', ' ');
    }
    this.getAll();
  }

  getAll() {
    let param = new GetFindAuthorParam();
    param.pageNumber = this.paginationParams.currentPage;
    param.pageSize = this.paginationParams.itemsPerPage;
    param.authorName = this.authorName;
    this.findAuthorService
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

  toValidURL(inputString: string): string {
    const noSpacesString = inputString.replace(/\s/g, '-');
    const encodedString = noSpacesString.replace(/[^a-zA-Z0-9-_.~]/g, (char) => {
      return encodeURIComponent(char);
    });
    const normalizedString = encodedString.replace(/--+/g, '-');
    const lowercaseString = normalizedString.toLowerCase();
    return lowercaseString;
  }
}
