import { Component, OnInit } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { RecommendComicDto } from 'src/app/_models/recommendComicDto';
import { BusyService } from 'src/app/_services/busy.service';
import { DataFormatServiceService } from 'src/app/_services/data-format-service.service';
import { RecommendComicsService } from 'src/app/_services/recommend-comics.service';
import { UpdateRecommendComicsComponent } from './update-recommend-comics/update-recommend-comics.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-recommend-comics',
  templateUrl: './recommend-comics.component.html',
  styleUrls: ['./recommend-comics.component.css'],
})
export class RecommendComicsComponent implements OnInit {
  rowData: RecommendComicDto[] = [];
  defaultColDef = { autoHeight: true, wrapText: false };
  selectedRow: RecommendComicDto | null = null;
  bsModalRef: BsModalRef<UpdateRecommendComicsComponent> =
  new BsModalRef<UpdateRecommendComicsComponent>();

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
      headerName: 'Newest Chapter',
      field: 'newestChapter',
      width: 300,
      cellClass:["text-center"]
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

  constructor(
    private carouselService: RecommendComicsService,
    private busyService: BusyService,
    private toastr: ToastrService,
    private dataFormatService: DataFormatServiceService,
    private modalService: BsModalService,
  ) {}
  ngOnInit(): void {}

  getAll() {
    this.busyService.busy();
    this.carouselService
      .getAll()
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: (res) => {
          this.rowData = res;
        },
      });
  }

  onGridReady() {
    this.getAll();
  }

  selectedRowClicked(event: any) {
    this.selectedRow = event;
  }

  openGenreModal(){
    this.bsModalRef = this.modalService.show(
      UpdateRecommendComicsComponent
    );
    this.bsModalRef.onHide?.subscribe({
      next: () => {
        this.getAll();
      },
    });
  }
}
