import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  RowClickedEvent,
  SelectionChangedEvent,
} from 'ag-grid-community';
import { PaginatorModule } from 'primeng/paginator';
import { Pagination } from 'src/app/_models/pagination';

@Component({
  selector: 'simple-ag-grid',
  templateUrl: './simple-ag-grid.component.html',
  styleUrls: ['./simple-ag-grid.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    AgGridAngular,
    PaginatorModule,
  ],
})
export class SimpleAgGridComponent implements OnInit {
  private gridApi: GridApi<any> = {} as GridApi<any>;
  prevSelectedRow: any = null;
  selectedRow: any = null;

  @Input() style = '';
  @Input() columnDefs: ColDef[] = [];
  @Input() rowData: any[] = [];
  @Input() wrapText: boolean = false;
  @Input() enableFilter: boolean = false;
  @Input() defaultColDef: any;
  @Input() rowSelection: 'single' | 'multiple' = 'single';
  @Input() textPagination: string = 'in total';
  @Input() allowToGetMultiRecords: boolean = false;
  @Input() paginationParams: Pagination = {
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 3,
    totalPages: 1,
  };

  @Input() pagination: boolean = false;
  @Output() changePaginationParams = new EventEmitter();

  @Output() callBackGrid = new EventEmitter();
  @Output() changePage = new EventEmitter();
  @Output() rowClicked = new EventEmitter();
  @Output() rowChanged = new EventEmitter();

  constructor() {}
  ngOnInit(): void {
    this.defaultColDef = this.defaultColDef
      ? Object.assign(
          {
            editable: false,
            resizable: true,
            menuTabs: [],
            tooltipValueGetter: (t: any) => t.value,
            cellStyle: (params: any) => {
              if (params.colDef.field === 'stt') {
                return { textAlign: 'center' };
              }
              return {};
            },
            filter: 'agTextColumnFilter',
            floatingFilter: this.enableFilter,
            floatingFilterComponentParams: { suppressFilterButton: true },
          },
          this.defaultColDef,
          {
            filter: this.defaultColDef?.filter
              ? this.defaultColDef.filter === true
                ? 'agTextColumnFilter'
                : this.defaultColDef.filter
              : 'agTextColumnFilter',
          }
        )
      : {
          editable: false,
          resizable: true,
          menuTabs: [],
          tooltipValueGetter: (t: any) => t.value,
          cellStyle: (params: any) => {
            if (params.colDef.field === 'stt') {
              return { textAlign: 'center' };
            }
            return {};
          },
          filter: 'agTextColumnFilter',
          autoHeight: this.wrapText,
          wrapText: this.wrapText,
          floatingFilterComponentParams: { suppressFilterButton: true },
        };
  }

  onGridReady(event: GridReadyEvent<any>) {
    this.gridApi = event.api;
    this.callBackGrid.emit();
  }

  onRowChange(event: SelectionChangedEvent) {
    this.prevSelectedRow = this.selectedRow;
    // this.selectedRow = this.gridApi.getSelectedRows()[0];
    this.rowChanged.emit(this.prevSelectedRow);
  }

  onRowClicked(event: RowClickedEvent) {
    this.selectedRow = event.data;
    this.rowClicked.emit(this.selectedRow);
  }

  paginationChange(event: any) {
    this.paginationParams.currentPage = event.page + 1;
    // if (event.rows != this.paginationParams.itemsPerPage)
    //   this.paginationParams.currentPage = 1;
    this.paginationParams.itemsPerPage = event.rows;
    this.paginationParams.totalPages = event.pageCount;
    this.changePage.emit(this.paginationParams);
  }
}
