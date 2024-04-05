import { Component, OnInit } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { GetUserForAssignPermistionDto } from 'src/app/_models/getUserForAssignPermistionDto';
import { Pagination } from 'src/app/_models/pagination';
import { UserForAssignPermistionParam } from 'src/app/_models/userForAssignPermistionParam';
import { AssignAdminService } from 'src/app/_services/assign-admin.service';
import { BusyService } from 'src/app/_services/busy.service';
import { DataFormatServiceService } from 'src/app/_services/data-format-service.service';

@Component({
  selector: 'app-assign-admin',
  templateUrl: './assign-admin.component.html',
  styleUrls: ['./assign-admin.component.css'],
})
export class AssignAdminComponent implements OnInit {
  email = '';
  onlyAdmin = false;
  defaultColDef = { autoHeight: true, wrapText: false };
  paginationParams: Pagination = {
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 1,
  };
  selectedRow: GetUserForAssignPermistionDto | null = null;

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
      width: 200,
    },
    {
      headerName: 'Is Admin',
      field: 'isAdmin',
      cellRenderer: (params: any) => {
        if (params) {
          if (params.data.isAdmin) return '✅';
          else return '❌';
        } else return '';
      },
      cellClass: ['text-center'],
      width: 100,
    },
  ];

  rowData: GetUserForAssignPermistionDto[] = [];
  constructor(
    private dataFormatService: DataFormatServiceService,
    private toastr: ToastrService,
    private busyService: BusyService,
    private assignAdminService: AssignAdminService
  ) {}
  ngOnInit(): void {
    this.getAll();
  }
  onGridReady() {
    this.getAll();
  }

  getAll() {
    var param = new UserForAssignPermistionParam();
    param.pageSize = this.paginationParams.itemsPerPage;
    param.pageNumber = this.paginationParams.currentPage;
    param.email = this.email;
    param.onlyAdmin = this.onlyAdmin;
    this.busyService.busy();
    this.assignAdminService
      .getAll(param)
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

  selectedRowClicked(event: any) {
    this.selectedRow = event;
  }

  bidingDate(event: any) {
    return new Date(event);
  }

  changePage(event: any) {
    this.paginationParams = event;
    this.getAll();
  }

  addRoleAdmin() {
    if (this.selectedRow) {
      this.busyService.busy();
      this.assignAdminService
        .addRoleAdmin(this.selectedRow.id)
        .pipe(
          finalize(() => {
            this.busyService.idle();
            this.getAll();
          })
        )
        .subscribe({
          next: () => {
            this.toastr.success('Add Role Admin Success!');
          },
        });
    }
  }
  removeRoleAdmin() {
    if (this.selectedRow) {
      this.busyService.busy();
      this.assignAdminService
        .removeRoleAdmin(this.selectedRow.id)
        .pipe(
          finalize(() => {
            this.busyService.idle();
            this.getAll();
          })
        )
        .subscribe({
          next: () => {
            this.toastr.success('Remove Role Admin Success!');
          },
        });
    }
  }
}
