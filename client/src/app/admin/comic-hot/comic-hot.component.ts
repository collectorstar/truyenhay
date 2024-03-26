import { Component, OnInit } from '@angular/core';
import { GetAllHotComicDto } from 'src/app/_models/getAllHotComicDto';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ColDef } from 'ag-grid-community';
import { HotComicService } from 'src/app/_services/hot-comic.service';
import { BusyService } from 'src/app/_services/busy.service';
import { ToastrService } from 'ngx-toastr';
import { DataFormatServiceService } from 'src/app/_services/data-format-service.service';
import { finalize } from 'rxjs';
import { Pagination } from 'src/app/_models/pagination';
import { ComicHotParams } from 'src/app/_models/comicHotParams';

@Component({
  selector: 'app-comic-hot',
  templateUrl: './comic-hot.component.html',
  styleUrls: ['./comic-hot.component.css'],
})
export class ComicHotComponent implements OnInit {
  rowData: GetAllHotComicDto[] = [];
  defaultColDef = { autoHeight: true, wrapText: false };
  selectedRow: GetAllHotComicDto | null = null;

  comicName: string = '';
  isOnlyHotComic: boolean = true;

  paginationParams: Pagination = {
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 1,
  };

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
      headerName: 'Total Chapter',
      field: 'totalChapter',
      width: 300,
      cellClass: ['text-center'],
    },
    {
      headerName: 'Update time',
      field: 'updateTime',
      valueFormatter: (params: any) => {
        return this.dataFormatService.dateTimeFormat(params.data.updateTime);
      },
      width: 150,
    },
    {
      headerName: 'Action',
      cellRenderer: (params: any) => {
        let check = params.data.isHot ? 'checked' : '';
        return "<input type='checkbox' " + check + ' />';
      },
      onCellClicked: (params: any) => {
        this.update(params.data);
      },
      cellClass: ['text-center'],
    },
  ];

  constructor(
    private hotComicService: HotComicService,
    private busyService: BusyService,
    private toastr: ToastrService,
    private dataFormatService: DataFormatServiceService
  ) {}
  ngOnInit(): void {}

  getAll() {
    var comicHotParams = new ComicHotParams();
    comicHotParams.comicName = this.comicName;
    comicHotParams.isOnlyHotComic = this.isOnlyHotComic;
    comicHotParams.pageSize = this.paginationParams.itemsPerPage;
    comicHotParams.pageNumber = this.paginationParams.currentPage;
    this.busyService.busy();
    this.hotComicService
      .getAll(comicHotParams)
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: (res) => {
          if (res && res.result && res.pagination) {
            this.rowData = res.result;
            this.paginationParams = res.pagination;
          }
        },
      });
  }

  onGridReady() {
    this.getAll();
  }

  changePage(event: any) {
    this.paginationParams = event;
    this.getAll();
  }

  selectedRowClicked(event: any) {
    this.selectedRow = event;
  }

  update(dto: GetAllHotComicDto) {
    this.busyService.busy();
    this.hotComicService
      .update(dto)
      .pipe(
        finalize(() => {
          this.busyService.idle();
          this.getAll();
        })
      )
      .subscribe();
  }
}
