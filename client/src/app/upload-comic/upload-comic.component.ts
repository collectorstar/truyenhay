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
import { ColDef } from 'ag-grid-community';
import { DataFormatServiceService } from '../_services/data-format-service.service';
import { ReportErrorChapterForAuthorDto } from '../_models/reportErrorChapterForAuthorDto';
import { ReportErrorCode } from '../_extensions/enumHelper';
import { ReportChapterParam } from '../_models/reportChapterParam';
import { RequestIncreaseMaxComicCreateComponent } from './request-increase-max-comic-create/request-increase-max-comic-create.component';

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
  bsModalRefRequestIncreaseMaxComicCreate: BsModalRef<RequestIncreaseMaxComicCreateComponent> =
    new BsModalRef<RequestIncreaseMaxComicCreateComponent>();
  paginationParams: Pagination = {
    currentPage: 1,
    itemsPerPage: 2,
    totalItems: 0,
    totalPages: 1,
  };

  //report error
  paginationParamsError: Pagination = {
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 1,
  };
  rowDataError: ReportErrorChapterForAuthorDto[] = [];
  defaultColDefError = { autoHeight: true, wrapText: false };
  selectedRowError: ReportErrorChapterForAuthorDto | null = null;
  columnDefsError: ColDef[] = [
    {
      headerName: 'stt',
      field: 'stt',
      cellRenderer: (params: any) => {
        if (params && params.node && typeof params.node.rowIndex == 'number')
          return params.node.rowIndex + 1;
        return '';
      },
      width: 60,
    },
    {
      headerName: 'Comic Name',
      field: 'comicName',
      filter: 'agTextColumnFilter',
      width: 200,
    },
    {
      headerName: 'Chapter Name',
      field: 'chapterName',
      filter: 'agTextColumnFilter',
      width: 200,
    },
    {
      headerName: 'Type error',
      field: 'errorCode',
      cellRenderer: (params: any) => {
        if (params && params.data && typeof params.data.errorCode == 'number') {
          switch (params.data.errorCode) {
            case ReportErrorCode.ImageError:
              return 'Image Error';
            case ReportErrorCode.DublicateChapter:
              return 'Dublicate Chapter';
            case ReportErrorCode.WrongComicUpload:
              return 'Wrong upload comic';
            case ReportErrorCode.Other:
              return 'Other';
            default:
              return '';
          }
        }
        return '';
      },
      width: 200,
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: (params: any) => {
        if (params) {
          if (params.data.status) return '✅ Done';
          else return '❌ In Processing';
        } else return '';
      },
      cellClass: ['text-center'],
      width: 150,
    },
    {
      headerName: 'Time send',
      field: 'creationTime',
      valueFormatter: (params: any) => {
        return this.dataFormatService.dateTimeFormat(params.data.creationTime);
      },
      width: 150,
    },
    {
      headerName: 'Desc',
      field: 'desc',
      width: 800,
    },
  ];
  nameError: string = '';
  isOnlyInProcessing: boolean = true;

  constructor(
    public accountService: AccountService,
    private toastr: ToastrService,
    private busyService: BusyService,
    private modalService: BsModalService,
    private uploadComicService: UploadComicService,
    private confirmService: ConfirmService,
    public router: Router,
    private dataFormatService: DataFormatServiceService
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
    this.uploadComicService
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

  checkValidCreateComic() {
    this.busyService.busy();
    this.uploadComicService
      .checkValidCreateComic()
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: () => {
          this.openComicModal(true);
        },
      });
  }

  checkValidReqIncComic() {
    this.busyService.busy();
    this.uploadComicService
      .checkValidReqIncComic()
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: () => {
          this.requestIncreaseMaxComic();
        },
      });
  }

  requestIncreaseMaxComic() {
    if (!this.user || (this.user && !this.user.isAuthor)) return;
    this.bsModalRefRequestIncreaseMaxComicCreate = this.modalService.show(
      RequestIncreaseMaxComicCreateComponent
    );

    this.bsModalRefRequestIncreaseMaxComicCreate.onHide?.subscribe({
      next: () => {
        this.getAll();
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

  //report errors
  onGridReady() {
    this.getAllError();
  }

  selectedRowClicked(event: any) {
    this.selectedRowError = event;
  }

  changePage(event: any) {
    this.paginationParamsError = event;
    this.getAllError();
  }
  getAllError() {
    var searchErrorParam = new ReportChapterParam();
    searchErrorParam.pageNumber = this.paginationParamsError.currentPage;
    searchErrorParam.pageSize = this.paginationParamsError.itemsPerPage;
    searchErrorParam.comicName = this.nameError;
    searchErrorParam.isOnlyInprocessing = this.isOnlyInProcessing;
    this.busyService.busy();
    this.uploadComicService
      .getAllErrorReportChapter(searchErrorParam)
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: (res) => {
          if (res && res.result && res.pagination) {
            this.rowDataError = res.result;
            this.paginationParamsError = res.pagination;
            this.selectedRowError = null;
          }
        },
      });
  }

  markDone() {
    if (this.selectedRowError) {
      this.busyService.busy();
      this.uploadComicService
        .markDoneReportErrorChapter(this.selectedRowError)
        .pipe(
          finalize(() => {
            this.busyService.idle();
            this.getAllError();
          })
        )
        .subscribe({
          next: () => {
            this.toastr.success('Done report error!');
          },
        });
    }
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
