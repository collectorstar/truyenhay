import { Component, OnInit } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { ApprovalStatusChapter } from 'src/app/_extensions/enumHelper';
import { ApprovalChapterDto } from 'src/app/_models/approvalChapterDto';
import { GetAllComicForApprovalChapterParam } from 'src/app/_models/getAllComicForApprovalChapterParam';
import { Pagination } from 'src/app/_models/pagination';
import { ApprovalChapterService } from 'src/app/_services/approval-chapter.service';
import { BusyService } from 'src/app/_services/busy.service';
import { ConfirmService } from 'src/app/_services/confirm.service';
import { DataFormatServiceService } from 'src/app/_services/data-format-service.service';
import { InfoChapterComponent } from './info-chapter/info-chapter.component';

@Component({
  selector: 'app-approval-chapter',
  templateUrl: './approval-chapter.component.html',
  styleUrls: ['./approval-chapter.component.css'],
})
export class ApprovalChapterComponent implements OnInit {
  comicName: string = '';
  chapterName: string = '';
  hideAcceptChapter: boolean = true;
  defaultColDef = { autoHeight: true, wrapText: false };
  paginationParams: Pagination = {
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 1,
  };

  chapterInfo: BsModalRef<InfoChapterComponent> =
    new BsModalRef<InfoChapterComponent>();

  selectedRow: ApprovalChapterDto | null = null;

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
      field: 'comicName',
      filter: 'agTextColumnFilter',
      // flex: 1,
      width: 200,
    },
    {
      headerName: 'Chapter Name',
      field: 'name',
      filter: 'agTextColumnFilter',
      // flex: 1,
      width: 200,
    },
    {
      headerName: 'Status',
      field: 'approvalStatus',
      cellRenderer: (params: any) => {
        if (params) {
          if (params.data.approvalStatus == ApprovalStatusChapter.Waiting)
            return '🕒 Wating';
          else if (params.data.approvalStatus == ApprovalStatusChapter.Accept)
            return '✅ Accept';
          else return '❌ Deny';
        } else return '';
      },
      cellClass: ['text-center'],
      width: 200,
    },
    {
      headerName: 'Update Time',
      field: 'updateTime',
      valueFormatter: (params: any) => {
        return this.dataFormatService.dateTimeFormat(params.data.updateTime);
      },
      width: 300,
    },
  ];

  rowData: ApprovalChapterDto[] = [];

  constructor(
    private dataFormatService: DataFormatServiceService,
    private approvalChapterService: ApprovalChapterService,
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
    var genreParams = new GetAllComicForApprovalChapterParam();
    genreParams.comicName = this.comicName;
    genreParams.chapterName = this.chapterName;
    genreParams.hideAcceptChapter = this.hideAcceptChapter;
    genreParams.pageSize = this.paginationParams.itemsPerPage;
    genreParams.pageNumber = this.paginationParams.currentPage;
    this.busyService.busy();
    this.approvalChapterService
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
        'Are you sure you want to accept this chapter',
        "I'm sure",
        'No'
      )
      .subscribe({
        next: (res) => {
          if (res && this.selectedRow) {
            this.busyService.busy();
            this.approvalChapterService
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
            this.approvalChapterService
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

  delete() {
    if (this.selectedRow) {
      this.confirmService
        .confirm(
          'Delete this chapter?',
          'Are you sure to delete this chapter?',
          'Yes',
          'No'
        )
        .subscribe({
          next: (res) => {
            if (res && this.selectedRow) {
              this.busyService.busy();
              this.approvalChapterService
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

  info() {
    if (this.selectedRow) {
      this.busyService.busy();
      this.approvalChapterService
        .getInfoChapter(this.selectedRow.comicId, this.selectedRow.id)
        .pipe(
          finalize(() => {
            this.busyService.idle();
          })
        )
        .subscribe({
          next: (res) => {
            this.openInfoChapter(res);
          },
        });
    }
  }

  openInfoChapter(images: string[]) {
    const config = {
      class: 'modal-dialog modal-xl',
      initialState: {
        images: images,
      },
    };

    this.chapterInfo = this.modalService.show(InfoChapterComponent, config);

    this.chapterInfo.onHide?.subscribe({
      next: () => {
        this.getAll();
      },
    });
  }
}
