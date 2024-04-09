import { Component, OnInit } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { ComicForComicManagerDto } from 'src/app/_models/comicForComicManagerDto';
import { ComicManagerParam } from 'src/app/_models/comicManagerParam';
import { Pagination } from 'src/app/_models/pagination';
import { BusyService } from 'src/app/_services/busy.service';
import { ComicManagerService } from 'src/app/_services/comic-manager.service';
import { ConfirmService } from 'src/app/_services/confirm.service';
import { DataFormatServiceService } from 'src/app/_services/data-format-service.service';
import { TransferComicComponent } from './transfer-comic/transfer-comic.component';

@Component({
  selector: 'app-comic-manager',
  templateUrl: './comic-manager.component.html',
  styleUrls: ['./comic-manager.component.css'],
})
export class ComicManagerComponent implements OnInit {
  emailSearch: string = '';
  comicNameSearch: string = '';
  defaultColDef = { autoHeight: true, wrapText: false };
  paginationParams: Pagination = {
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 1,
  };

  selectedRow: ComicForComicManagerDto | null = null;

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
      headerName: 'Name',
      field: 'name',
      filter: 'agTextColumnFilter',
      // flex: 1,
      width: 200,
    },
    {
      headerName: 'Email',
      field: 'email',
      filter: 'agTextColumnFilter',
      // flex: 1,
      width: 200,
    },
    {
      headerName: 'Update time',
      field: 'updateTime',
      valueFormatter: (params: any) => {
        return this.dataFormatService.dateTimeFormat(params.data.updateTime);
      },
      // flex: 1,
      width: 150,
    },
  ];

  rowData: ComicForComicManagerDto[] = [];

  bsModalRef: BsModalRef<TransferComicComponent> =
    new BsModalRef<TransferComicComponent>();

  constructor(
    private dataFormatService: DataFormatServiceService,
    private comicManagerService: ComicManagerService,
    private busyService: BusyService,
    private confirmService: ConfirmService,
    private modalService: BsModalService,
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
    var param = new ComicManagerParam();
    param.email = this.emailSearch;
    param.comicName = this.comicNameSearch;
    param.pageSize = this.paginationParams.itemsPerPage;
    param.pageNumber = this.paginationParams.currentPage;
    this.busyService.busy();
    this.comicManagerService
      .getAll(param)
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

  deleteComic() {
    if (!this.selectedRow) return;
    this.confirmService
      .confirm(
        'Are you sure?',
        'This action will delete all related data',
        'Continue',
        "No, I'm not sure"
      )
      .subscribe({
        next: (res) => {
          if (res && this.selectedRow) {
            this.busyService.busy();
            this.comicManagerService
              .deleteComic(this.selectedRow.id)
              .pipe(
                finalize(() => {
                  this.busyService.idle();
                  this.getAll();
                })
              )
              .subscribe({
                next: () => {
                  this.toastr.success('Delete comic success!');
                },
              });
          }
        },
      });
  }

  transferComic() {
    if (this.selectedRow) {
      const config = {
        class: 'modal-dialog',
        initialState: {
          selectedRow: this.selectedRow,
        },
      };
      this.bsModalRef = this.modalService.show(TransferComicComponent, config);
      this.bsModalRef.onHide?.subscribe({
        next: () => {
          this.getAll();
        },
      });
    }
  }
}
