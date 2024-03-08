import { GenreDto } from './../../_models/genreDto';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { GenreParams } from './../../_models/genreParams';
import { Component, OnInit } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { finalize } from 'rxjs';
import { Pagination } from 'src/app/_models/pagination';
import { BusyService } from 'src/app/_services/busy.service';
import { DataFormatServiceService } from 'src/app/_services/data-format-service.service';
import { GenreService } from 'src/app/_services/genre.service';
import { CreateOrEditGenreComponent } from './create-or-edit-genre/create-or-edit-genre.component';
import { ConfirmService } from 'src/app/_services/confirm.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-genre',
  templateUrl: './genre.component.html',
  styleUrls: ['./genre.component.css'],
})
export class GenreComponent implements OnInit {
  nameSearch: string = '';
  defaultColDef = { autoHeight: true, wrapText: false };
  // params: GridParams | undefined;
  paginationParams: Pagination = {
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 1,
  };
  bsModalRef: BsModalRef<CreateOrEditGenreComponent> =
    new BsModalRef<CreateOrEditGenreComponent>();

  selectedRow: GenreDto | null = null;

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
      headerName: 'Desc',
      field: 'desc',
      // flex: 3,
      width: 800,
    },
    {
      headerName: 'IsFeatured',
      field: 'isFeatured',
      cellRenderer: (params: any) => {
        if (params) {
          if (params.data.isFeatured) return '✅';
          else return '❌';
        } else return '';
      },
      cellClass: ['text-center'],
      // cellStyle: {textAlign: 'center'},
      // flex: 1,
      width: 100,
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: (params: any) => {
        if (params) {
          if (params.data.status) return '✅';
          else return '❌';
        } else return '';
      },
      cellClass: ['text-center'],
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
  ];

  rowData: GenreDto[] = [];

  constructor(
    private dataFormatService: DataFormatServiceService,
    private genreService: GenreService,
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
    var genreParams = new GenreParams();
    genreParams.name = this.nameSearch;
    genreParams.pageSize = this.paginationParams.itemsPerPage;
    genreParams.pageNumber = this.paginationParams.currentPage;
    this.busyService.busy();
    this.genreService
      .getGenresByName(genreParams)
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

  openGenreModal(isCreate: boolean) {
    const config = {
      class: 'modal-dialog',
      initialState: {
        selectedRow: isCreate ? null : this.selectedRow,
      },
    };
    this.bsModalRef = this.modalService.show(
      CreateOrEditGenreComponent,
      config
    );
    this.bsModalRef.onHide?.subscribe({
      next: () => {
        this.getAll();
      },
    });
  }

  deleteGenre() {
    this.confirmService.confirm().subscribe({
      next: (res) => {
        if (res) {
          if (this.selectedRow && this.selectedRow.id) {
            this.busyService.busy();
            this.genreService
              .deleteGenre(this.selectedRow.id)
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
