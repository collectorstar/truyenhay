import { Component, OnInit, ViewChild } from '@angular/core';
import { GenreCusService } from '../_services/genre-cus.service';
import { ToastrService } from 'ngx-toastr';
import { BusyService } from '../_services/busy.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Pagination } from '../_models/pagination';
import { GenreCusParams } from '../_models/genreCusParams';
import { User } from '../_models/user';
import { finalize } from 'rxjs';
import { AccountService } from '../_services/account.service';
import { GenreCusOption } from '../_models/genreCusOption';
import { SelectorComponent } from '../_component/selector/selector.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ListGenreModalComponent } from './list-genre-modal/list-genre-modal.component';

@Component({
  selector: 'app-genre-cus',
  templateUrl: './genre-cus.component.html',
  styleUrls: ['./genre-cus.component.css'],
})
export class GenreCusComponent implements OnInit {
  @ViewChild('selectorGenre') selectorGenre = new SelectorComponent();
  genreOptions: GenreCusOption[] = [];
  genreSelected: GenreCusOption = {
    value: 0,
    label: 'All Genre',
    desc: 'All Comics',
    isFeatured: false,
  };
  user: User | null = null;
  rowData: any[] = [];
  statusComic: number = 0;
  paginationParams: Pagination = {
    currentPage: 1,
    itemsPerPage: 36,
    totalItems: 0,
    totalPages: 1,
  };

  bsModalRef: BsModalRef<ListGenreModalComponent> =
    new BsModalRef<ListGenreModalComponent>();

  constructor(
    private genreCusService: GenreCusService,
    private accountService: AccountService,
    private toastr: ToastrService,
    private busyService: BusyService,
    public router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService
  ) {
    this.accountService.currentUser$.subscribe({
      next: (res) => {
        this.user = res;
      },
    });
  }
  ngOnInit(): void {
    this.genreOptions.push({
      value: 0,
      label: 'All Genre',
      desc: 'All Comics',
      isFeatured: false,
    });
    this.busyService.busy();
    this.genreCusService
      .getGenres()
      .pipe(
        finalize(() => {
          this.busyService.idle();
          this.getAll();
        })
      )
      .subscribe({
        next: (res) => {
          this.genreOptions.push(...res);
          let genreName = this.route.snapshot.queryParams[
            'genreName'
          ].replaceAll('-', ' ');
          if (genreName) {
            let temp = this.genreOptions.findIndex(
              (x) => x.label.toLowerCase() == genreName
            );
            if (temp != -1) {
              this.genreSelected = this.genreOptions[temp];
              this.selectorGenre.valueSelect = this.genreSelected.value;
            }
          }
        },
      });
  }

  getAll() {
    let param = new GenreCusParams();
    param.pageNumber = this.paginationParams.currentPage;
    param.pageSize = this.paginationParams.itemsPerPage;
    param.genreId = this.genreSelected.value;
    param.statusComic = this.statusComic;
    this.genreCusService
      .getAll(param, this.user?.email ?? '')
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

  // onChangeGenre(event: any) {
  //   this.genreSelected = event;
  //   this.paginationParams.currentPage = 1;
  //   this.getAll();
  // }

  clickSelectorGenre() {
    const config = {
      class: 'modal-dialog',
      initialState: {
        genre: this.genreSelected,
        genresForModal: this.genreOptions,
      },
    };
    this.bsModalRef = this.modalService.show(ListGenreModalComponent, config);

    this.bsModalRef.onHide?.subscribe({
      next: () => {
        if (this.bsModalRef.content?.genre) {
          this.genreSelected = this.bsModalRef.content.genre;
          this.selectorGenre.valueSelect = this.genreSelected.value;
        }
        this.getAll();
      },
    });
  }

  selectStatusComic(stautsComic: number) {
    this.statusComic = stautsComic;
    this.paginationParams.currentPage = 1;
    this.getAll();
  }

  convertToK(target: number): string {
    if (target < 1000) return target + '';
    return (target / 1000).toFixed(2) + 'k';
  }
}
