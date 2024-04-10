import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { ChapterForChapterManagerDto } from 'src/app/_models/chapterForChapterManagerDto';
import { ChapterManagerParam } from 'src/app/_models/chapterManagerParam';
import { Pagination } from 'src/app/_models/pagination';
import { BusyService } from 'src/app/_services/busy.service';
import { ChapterManagerService } from 'src/app/_services/chapter-manager.service';
import { ConfirmService } from 'src/app/_services/confirm.service';
import { DataFormatServiceService } from 'src/app/_services/data-format-service.service';

@Component({
  selector: 'app-chapter-manager',
  templateUrl: './chapter-manager.component.html',
  styleUrls: ['./chapter-manager.component.css'],
})
export class ChapterManagerComponent {
  comicName: string = '';
  chapterName: string = '';
  defaultColDef = { autoHeight: true, wrapText: false };
  paginationParams: Pagination = {
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 1,
  };

  selectedRow: ChapterForChapterManagerDto | null = null;

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
      width: 200,
    },
    {
      headerName: 'Chapter Name',
      field: 'name',
      filter: 'agTextColumnFilter',
      width: 200,
    },
    {
      headerName: 'Update time',
      field: 'updateTime',
      valueFormatter: (params: any) => {
        return this.dataFormatService.dateTimeFormat(params.data.updateTime);
      },
      width: 150,
    },
  ];

  rowData: ChapterForChapterManagerDto[] = [];

  constructor(
    private dataFormatService: DataFormatServiceService,
    private chapterManagerService: ChapterManagerService,
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
    var param = new ChapterManagerParam();
    param.comicName = this.comicName;
    param.chapterName = this.chapterName;
    param.pageSize = this.paginationParams.itemsPerPage;
    param.pageNumber = this.paginationParams.currentPage;
    this.busyService.busy();
    this.chapterManagerService
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

  deleteChapter() {
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
            this.chapterManagerService
              .deleteChapter(this.selectedRow.id)
              .pipe(
                finalize(() => {
                  this.busyService.idle();
                  this.getAll();
                })
              )
              .subscribe({
                next: () => {
                  this.toastr.success('Delete chapter success!');
                },
              });
          }
        },
      });
  }
}
