import { GetAllRequestAuthorParam } from './../../_models/getAllRequestAuthorParam';
import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { BusyService } from 'src/app/_services/busy.service';
import { RequestAuthorService } from 'src/app/_services/request-author.service';
import { CreateOrEditGenreComponent } from '../genre/create-or-edit-genre/create-or-edit-genre.component';
import { Pagination } from 'src/app/_models/pagination';
import { ColDef } from 'ag-grid-community';
import { DataFormatServiceService } from 'src/app/_services/data-format-service.service';
import { GenreService } from 'src/app/_services/genre.service';
import { ConfirmService } from 'src/app/_services/confirm.service';
import { finalize } from 'rxjs';
import { RequestAuthorDto } from 'src/app/_models/requestAuthorDto';

@Component({
  selector: 'app-request-author',
  templateUrl: './request-author.component.html',
  styleUrls: ['./request-author.component.css'],
})
export class RequestAuthorComponent implements OnInit {
  defaultColDef = { autoHeight: true, wrapText: true };
  emailSearch: string = '';
  fromDate: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  toDate: Date = new Date();
  maxDate: Date = new Date();
  onlySendRequest: boolean = false;

  paginationParams: Pagination = {
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 1,
  };
  bsModalRef: BsModalRef<CreateOrEditGenreComponent> =
    new BsModalRef<CreateOrEditGenreComponent>();

  selectedRow: RequestAuthorDto | null = null;

  columnDefs: ColDef[] = [
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
      headerName: 'Email',
      field: 'email',
      filter: 'agTextColumnFilter',
      // flex: 1,
      width: 250,
    },
    {
      headerName: 'Content',
      field: 'content',
      // flex: 3,
      width: 800,
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: (params: any) => {
        if (params) {
          switch (params.data.status) {
            case 0:
              return 'Send Request 📩 ';
            case 1:
              return 'Contact 📨';
            case 2:
              return 'Accept 👍';
            case 3:
              return 'Deny ❌';
            default:
              return '🤷‍♂️';
          }
        } else return '🤷‍♂️';
      },
      cellClass: ['text-center'],
      // flex: 1,
      width: 150,
    },
    {
      headerName: 'CreationTime',
      field: 'creationTime',
      valueFormatter: (params: any) => {
        return this.dataFormatService.dateTimeFormat(params.data.creationTime);
      },
      // flex: 1,
      width: 150,
    },
  ];

  rowData: RequestAuthorDto[] = [];

  constructor(
    private dataFormatService: DataFormatServiceService,
    private genreService: GenreService,
    private busyService: BusyService,
    private modalService: BsModalService,
    private confirmService: ConfirmService,
    private requestAuthorService: RequestAuthorService,
    private toastr: ToastrService
  ) {}

  bidingDate(event: any) {
    return new Date(event);
  }

  ngOnInit(): void {}

  onGridReady() {
    this.getAll();
  }

  changePage(event: any) {
    this.paginationParams = event;
    this.getAll();
  }

  getAll() {
    var requestAuthorParam = new GetAllRequestAuthorParam();
    requestAuthorParam.email = this.emailSearch;
    requestAuthorParam.fromDate = this.fromDate;
    requestAuthorParam.toDate = this.toDate;
    requestAuthorParam.onlySendRequest = this.onlySendRequest;
    requestAuthorParam.pageSize = this.paginationParams.itemsPerPage;
    requestAuthorParam.pageNumber = this.paginationParams.currentPage;
    this.busyService.busy();
    this.requestAuthorService
      .getRequestByEmail(requestAuthorParam)
      .pipe(
        finalize(() => {
          this.busyService.idle();
          this.selectedRow = null;
        })
      )
      .subscribe((res) => {
        if (res && res.pagination && res.result) {
          this.paginationParams = res.pagination;
          this.rowData = res.result;
        }
      });
  }

  selectedRowClicked(event: any) {
    this.selectedRow = event;
  }

  denyRequest() {
    this.confirmService
      .confirm(
        'Deny this request',
        'This action will send a rejection email to the user, are you sure?',
        "I'm sure",
        'no'
      )
      .subscribe({
        next: (res) => {
          if (res) {
            if (this.selectedRow && this.selectedRow.id) {
              this.busyService.busy();
              this.requestAuthorService
                .denyAction(this.selectedRow.id)
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
          }
        },
      });
  }

  acceptRequest() {
    this.confirmService
      .confirm(
        'Accept this request',
        'This action will allow this account to post stories, are you sure?',
        "I'm sure",
        'no'
      )
      .subscribe({
        next: (res) => {
          if (res) {
            if (this.selectedRow && this.selectedRow.id) {
              this.busyService.busy();
              this.requestAuthorService
                .acceptAction(this.selectedRow.id)
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
          }
        },
      });
  }

  contactRequest() {
    this.confirmService
      .confirm(
        'Confirm this request',
        'This action will send an email to the recipient with your email so the two parties can communicate, are you sure?',
        "I'm sure",
        'no'
      )
      .subscribe({
        next: (res) => {
          if (res) {
            if (this.selectedRow && this.selectedRow.id) {
              this.busyService.busy();
              this.requestAuthorService
                .contactAction(this.selectedRow.id)
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
          }
        },
      });
  }
}
