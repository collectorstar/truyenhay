import { Component, OnInit } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { GetUserForUserManagerDto } from 'src/app/_models/getUserForUserManagerDto';
import { Pagination } from 'src/app/_models/pagination';
import { User } from 'src/app/_models/user';
import { UserForUserManagerParam } from 'src/app/_models/userForUserManagerParam';
import { AccountService } from 'src/app/_services/account.service';
import { BusyService } from 'src/app/_services/busy.service';
import { DataFormatServiceService } from 'src/app/_services/data-format-service.service';
import { UserManagerService } from 'src/app/_services/user-manager.service';

@Component({
  selector: 'app-user-manager',
  templateUrl: './user-manager.component.html',
  styleUrls: ['./user-manager.component.css'],
})
export class UserManagerComponent implements OnInit {
  user: User = {} as User;
  email = '';
  allUser = false;
  fromDate: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  toDate: Date = new Date();
  maxDate: Date = new Date();
  onlyAuthor = false;
  defaultColDef = { autoHeight: true, wrapText: false };
  paginationParams: Pagination = {
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 1,
  };
  selectedRow: GetUserForUserManagerDto | null = null;

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
      headerName: 'CreationTime',
      field: 'creationTime',
      valueFormatter: (params: any) => {
        return this.dataFormatService.dateTimeFormat(params.data.creationTime);
      },
      // flex: 1,
      width: 150,
    },
    {
      headerName: 'Is Author',
      field: 'isAuthor',
      cellRenderer: (params: any) => {
        if (params) {
          if (params.data.isAuthor) return '✅';
          else return '❌';
        } else return '';
      },
      cellClass: ['text-center'],
      width: 100,
    },
    {
      headerName: 'Max Comic Create',
      field: 'maxComic',
      cellClass: ['text-center'],
      // flex: 1,
      width: 100,
    },
    {
      headerName: 'Is Block',
      field: 'isBlock',
      cellRenderer: (params: any) => {
        if (params) {
          if (params.data.isBlock) return '🔒';
          else return '🔓';
        } else return '';
      },
      cellClass: ['text-center'],
      width: 100,
    },
  ];

  rowData: GetUserForUserManagerDto[] = [];
  constructor(
    public accountService: AccountService,
    private dataFormatService: DataFormatServiceService,
    private toastr: ToastrService,
    private busyService: BusyService,
    private userManagerService: UserManagerService
  ) {}
  ngOnInit(): void {
    this.accountService.currentUser$.subscribe({
      next: (res) => {
        if (res) {
          this.user = res;
        }
      },
    });
    this.getAll();
  }
  onGridReady() {
    this.getAll();
  }

  getAll() {
    var param = new UserForUserManagerParam();
    param.pageSize = this.paginationParams.itemsPerPage;
    param.pageNumber = this.paginationParams.currentPage;
    param.email = this.email;
    param.allUser = this.allUser;
    param.fromDate = this.fromDate;
    param.toDate = this.toDate;
    param.onlyAuthor = this.onlyAuthor;
    this.busyService.busy();
    this.userManagerService
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

  block() {
    if (this.selectedRow) {
      this.busyService.busy();
      this.userManagerService
        .blockUser(this.selectedRow.id)
        .pipe(
          finalize(() => {
            this.busyService.idle();
            this.getAll();
          })
        )
        .subscribe({
          next: () => {
            this.toastr.success('Block Success!');
          },
        });
    }
  }
  unblock() {
    if (this.selectedRow) {
      this.busyService.busy();
      this.userManagerService
        .unBlockUser(this.selectedRow.id)
        .pipe(
          finalize(() => {
            this.busyService.idle();
            this.getAll();
          })
        )
        .subscribe({
          next: () => {
            this.toastr.success('UnBlock Success!');
          },
        });
    }
  }

  incMaxComic() {
    if (this.selectedRow) {
      this.busyService.busy();
      this.userManagerService
        .incMaxComic(this.selectedRow.id)
        .pipe(
          finalize(() => {
            this.busyService.idle();
            this.getAll();
          })
        )
        .subscribe(() => {
          this.toastr.success('Inc success!');
        });
    }
  }

  changeToAuthor() {
    if (this.selectedRow) {
      this.busyService.busy();
      this.userManagerService
        .changeToAuthor(this.selectedRow.id)
        .pipe(
          finalize(() => {
            this.busyService.idle();
            this.getAll();
          })
        )
        .subscribe(() => {
          this.toastr.success('Change to Author success!');
        });
    }
  }
}
