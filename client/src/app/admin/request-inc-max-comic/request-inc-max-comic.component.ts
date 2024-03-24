import { Component, OnInit } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { RequestIncMaxComicStatus } from 'src/app/_extensions/enumHelper';
import { GetAllReqIncMacComicParam } from 'src/app/_models/getAllReqIncMacComicParam';
import { Pagination } from 'src/app/_models/pagination';
import { ReqIncMaxComicDto } from 'src/app/_models/reqIncMaxComicDto';
import { BusyService } from 'src/app/_services/busy.service';
import { ConfirmService } from 'src/app/_services/confirm.service';
import { DataFormatServiceService } from 'src/app/_services/data-format-service.service';
import { IncMaxComicService } from 'src/app/_services/inc-max-comic.service';

@Component({
  selector: 'app-request-inc-max-comic',
  templateUrl: './request-inc-max-comic.component.html',
  styleUrls: ['./request-inc-max-comic.component.css'],
})
export class RequestIncMaxComicComponent implements OnInit {
  emailSearch: string = '';
  isShowWattingReq: boolean = true;
  defaultColDef = { autoHeight: true, wrapText: false };
  paginationParams: Pagination = {
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 1,
  };
  // bsModalRef: BsModalRef<CreateOrEditGenreComponent> =
  //   new BsModalRef<CreateOrEditGenreComponent>();

  selectedRow: ReqIncMaxComicDto | null = null;

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
      width: 200,
    },
    {
      headerName: 'Request',
      field: 'request',
      // flex: 3,
      width: 800,
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: (params: any) => {
        if (params) {
          if (params.data.status == RequestIncMaxComicStatus.Waiting)
            return '🕒 Waiting';
          else if (params.data.status == RequestIncMaxComicStatus.Accept)
            return '✅ Accept';
          else return '❌ Deny';
        } else return '';
      },
      cellClass: ['text-center'],
      // cellStyle: {textAlign: 'center'},
      // flex: 1,
      width: 100,
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
    {
      headerName: 'Processing Date',
      field: 'processingDate',
      valueFormatter: (params: any) => {
        return this.dataFormatService.dateTimeFormat(
          params.data.processingDate
        );
      },
      // flex: 1,
      width: 150,
    },
  ];

  rowData: ReqIncMaxComicDto[] = [];

  constructor(
    private dataFormatService: DataFormatServiceService,
    private incMaxComicService: IncMaxComicService,
    private busyService: BusyService,
    private modalService: BsModalService,
    private confirmService: ConfirmService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  onGridReady() {
    this.getAll();
  }

  changePage(event: any) {
    this.paginationParams = event;
    this.getAll();
  }

  getAll() {
    var genreParams = new GetAllReqIncMacComicParam();
    genreParams.email = this.emailSearch;
    genreParams.isShowWattingReq = this.isShowWattingReq;
    genreParams.pageSize = this.paginationParams.itemsPerPage;
    genreParams.pageNumber = this.paginationParams.currentPage;
    this.busyService.busy();
    this.incMaxComicService
      .getAll(genreParams)
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

  accept() {
    if (!this.selectedRow) return;
    this.confirmService
      .confirm(
        'Accept request',
        'Are you sure you want to increase the number of story creations for this account to ' +
          this.selectedRow.quantity +
          ' ?',
        "I'm sure",
        'No'
      )
      .subscribe({
        next: (res) => {
          if (res && this.selectedRow) {
            this.busyService.busy();
            this.incMaxComicService
              .accept(this.selectedRow)
              .pipe(
                finalize(() => {
                  this.busyService.idle();
                  this.getAll();
                })
              )
              .subscribe({
                next: () => {
                  this.toastr.success('Accept success!');
                },
              });
          }
        },
      });
  }

  deny() {
    if (!this.selectedRow) return;
    this.confirmService
      .confirm(
        'Deny request',
        'Are you sure you want to deny this request?',
        "I'm sure",
        'No'
      )
      .subscribe({
        next: (res) => {
          if (res && this.selectedRow) {
            this.busyService.busy();
            this.incMaxComicService
              .deny(this.selectedRow)
              .pipe(
                finalize(() => {
                  this.busyService.idle();
                  this.getAll();
                })
              )
              .subscribe({
                next: () => {
                  this.toastr.success('Deny success!');
                },
              });
          }
        },
      });
  }
}
