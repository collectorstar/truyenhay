import { Component, OnInit } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { ApprovalStatusComic } from 'src/app/_extensions/enumHelper';
import { ApprovalComicDto } from 'src/app/_models/approvalComicDto';
import { GetAllComicForApprovalComicParam } from 'src/app/_models/getAllComicForApprovalComicParam';
import { Pagination } from 'src/app/_models/pagination';
import { ApprovalComicService } from 'src/app/_services/approval-comic.service';
import { BusyService } from 'src/app/_services/busy.service';
import { ConfirmService } from 'src/app/_services/confirm.service';
import { DataFormatServiceService } from 'src/app/_services/data-format-service.service';
import { InfoComicComponent } from './info-comic/info-comic.component';

@Component({
  selector: 'app-approval-comic',
  templateUrl: './approval-comic.component.html',
  styleUrls: ['./approval-comic.component.css'],
})
export class ApprovalComicComponent implements OnInit {
  nameSearch: string = '';
  hideAcceptComic: boolean = true;
  defaultColDef = { autoHeight: true, wrapText: false };
  paginationParams: Pagination = {
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 1,
  };

  bsModalRef: BsModalRef<InfoComicComponent> =
    new BsModalRef<InfoComicComponent>();

  selectedRow: ApprovalComicDto | null = null;
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
      headerName: 'Comic Name',
      field: 'name',
      filter: 'agTextColumnFilter',
      width: 400,
    },
    {
      headerName: 'Status',
      field: 'approvalStatus',
      cellRenderer: (params: any) => {
        if (params) {
          if (params.data.approvalStatus == ApprovalStatusComic.Waiting)
            return '🕒 Wating';
          else if (params.data.approvalStatus == ApprovalStatusComic.Accept)
            return '✅ Accept';
          else return '❌ Deny';
        } else return '';
      },
      cellClass: ['text-center'],
      width: 200,
    },
    {
      headerName: 'CreationTime',
      field: 'creationTime',
      valueFormatter: (params: any) => {
        return this.dataFormatService.dateTimeFormat(params.data.creationTime);
      },
      width: 300,
    },
  ];

  rowData: ApprovalComicDto[] = [];

  constructor(
    private dataFormatService: DataFormatServiceService,
    private approvalComicService: ApprovalComicService,
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
    var approvalComicParam = new GetAllComicForApprovalComicParam();
    approvalComicParam.name = this.nameSearch;
    approvalComicParam.hideAcceptComic = this.hideAcceptComic;
    approvalComicParam.pageSize = this.paginationParams.itemsPerPage;
    approvalComicParam.pageNumber = this.paginationParams.currentPage;
    this.busyService.busy();
    this.approvalComicService
      .getAll(approvalComicParam)
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
    if (this.selectedRow) {
      this.confirmService
        .confirm(
          'Accept this comic?',
          'Are you sure to accept this comic?',
          'Yes',
          'No'
        )
        .subscribe({
          next: (res) => {
            if (res && this.selectedRow) {
              this.busyService.busy();
              this.approvalComicService
                .accept(this.selectedRow)
                .pipe(
                  finalize(() => {
                    this.busyService.idle();
                    this.getAll();
                  })
                )
                .subscribe({
                  next: () => {
                    this.toastr.success('accept success');
                  },
                });
            }
          },
        });
    }
  }

  deny() {
    if (this.selectedRow) {
      this.confirmService
        .confirm(
          'Deny this comic?',
          'Are you sure to deny this comic?',
          'Yes',
          'No'
        )
        .subscribe({
          next: (res) => {
            if (res && this.selectedRow) {
              this.busyService.busy();
              this.approvalComicService
                .deny(this.selectedRow)
                .pipe(
                  finalize(() => {
                    this.busyService.idle();
                    this.getAll();
                  })
                )
                .subscribe({
                  next: () => {
                    this.toastr.success('deny success');
                  },
                });
            }
          },
        });
    }
  }

  delete() {
    if (this.selectedRow) {
      this.confirmService
        .confirm(
          'Delete this comic?',
          'Are you sure to delete this comic?',
          'Yes',
          'No'
        )
        .subscribe({
          next: (res) => {
            if (res && this.selectedRow) {
              this.busyService.busy();
              this.approvalComicService
                .delete(this.selectedRow)
                .pipe(
                  finalize(() => {
                    this.busyService.idle();
                    this.getAll();
                  })
                )
                .subscribe({
                  next: () => {
                    this.toastr.success('delete success');
                  },
                });
            }
          },
        });
    }
  }

  deleteAll() {
    this.confirmService
      .confirm(
        'Delete all rejected comics?',
        'Are you sure to delete all rejected comics?',
        'Yes',
        'No'
      )
      .subscribe({
        next: (res) => {
          if (res) {
            var approvalComicParam = new GetAllComicForApprovalComicParam();
            approvalComicParam.name = this.nameSearch;
            approvalComicParam.hideAcceptComic = this.hideAcceptComic;
            approvalComicParam.pageSize = this.paginationParams.itemsPerPage;
            approvalComicParam.pageNumber = this.paginationParams.currentPage;
            this.busyService.busy();
            this.approvalComicService
              .deleteAll(approvalComicParam)
              .pipe(
                finalize(() => {
                  this.busyService.idle();
                  this.getAll();
                })
              )
              .subscribe({
                next: () => {
                  this.toastr.success('delete all success');
                },
              });
          }
        },
      });
  }

  info() {
    if (!this.selectedRow) return;
    const config = {
      class: 'modal-dialog',
      initialState: {
        selectedRow: this.selectedRow,
      },
    };

    this.bsModalRef = this.modalService.show(InfoComicComponent, config);

    this.bsModalRef.onHide?.subscribe({
      next: () => {
        this.getAll();
      },
    });
  }
}
