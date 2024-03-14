import { CreateOrEditComicComponent } from './create-or-edit-comic/create-or-edit-comic.component';
import { finalize } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { User } from '../_models/user';
import { ToastrService } from 'ngx-toastr';
import { BusyService } from '../_services/busy.service';
import { UploadComicService } from '../_services/upload-comic.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Pagination } from '../_models/pagination';
import { GetAllUploadComicParam } from '../_models/getAllUploadComicParam';
import { UploadComicDto } from '../_models/uploadComicDto';
import { ConfirmService } from '../_services/confirm.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload-commic',
  templateUrl: './upload-comic.component.html',
  styleUrls: ['./upload-comic.component.css'],
})
export class UploadCommicComponent implements OnInit {
  user: User = {} as User;
  request: string = '';
  name: string = '';
  rowData: UploadComicDto[] = [];
  bsModalRef: BsModalRef<CreateOrEditComicComponent> =
    new BsModalRef<CreateOrEditComicComponent>();
  paginationParams: Pagination = {
    currentPage: 1,
    itemsPerPage: 2,
    totalItems: 0,
    totalPages: 1,
  };

  constructor(
    public accountService: AccountService,
    private toastr: ToastrService,
    private busyService: BusyService,
    private uploadService: UploadComicService,
    private modalService: BsModalService,
    private uploadComicService: UploadComicService,
    private confirmService: ConfirmService,
    public router: Router
  ) {
    this.accountService.currentUser$.subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
        }
      },
    });
  }
  ngOnInit(): void {
    this.getAll();
  }

  sendRequest(): void {
    if (this.request.trim() == '') {
      this.toastr.error('Empty form!');
      return;
    }
    this.busyService.busy();
    this.uploadService
      .requestAuthor(this.request)
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.toastr.success(res.message);
          }
        },
      });
  }

  getAll() {
    if (!this.user.isAuthor) return;
    let uploadComicParam = new GetAllUploadComicParam();
    uploadComicParam.name = this.name;
    uploadComicParam.pageNumber = this.paginationParams.currentPage;
    uploadComicParam.pageSize = this.paginationParams.itemsPerPage;
    this.busyService.busy();
    this.uploadComicService
      .getComicsByName(uploadComicParam)
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: (res) => {
          if (res && res.pagination && res.result) {
            this.paginationParams = res.pagination;
            this.rowData = res.result;
          }
        },
      });
  }

  deleteComic(comicId: number) {
    this.confirmService
      .confirm(
        'Are you sure?',
        'This action will delete all related data',
        'Continue',
        "No, I'm not sure"
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.busyService.busy();
            this.uploadComicService
              .deleteComic(comicId)
              .pipe(
                finalize(() => {
                  this.busyService.idle();
                  this.getAll();
                })
              )
              .subscribe({
                next: (res) => {
                  if (res) {
                    this.toastr.success(res.message);
                  }
                },
              });
          }
        },
      });
  }

  openComicModal(isCreate: boolean, data?: UploadComicDto) {
    const config = {
      class: 'modal-dialog',
      initialState: {
        selectedRow: isCreate ? null : data,
        selectedGenres: isCreate ? [] : data?.selectedGenres,
      },
    };

    this.bsModalRef = this.modalService.show(
      CreateOrEditComicComponent,
      config
    );

    this.bsModalRef.onHide?.subscribe({
      next: () => {
        this.getAll();
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
