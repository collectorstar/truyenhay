import { GenreDto } from './../../../_models/genreDto';
import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { BusyService } from 'src/app/_services/busy.service';
import { GenreService } from 'src/app/_services/genre.service';

@Component({
  selector: 'app-create-or-edit-genre',
  templateUrl: './create-or-edit-genre.component.html',
  styleUrls: ['./create-or-edit-genre.component.css'],
})
export class CreateOrEditGenreComponent implements OnInit {
  selectedRow: GenreDto | null = null;

  constructor(
    public bsModalRef: BsModalRef,
    private genreService: GenreService,
    private busyService: BusyService,
    private toastrService: ToastrService
  ) {

  }
  ngOnInit(): void {
    if (!this.selectedRow) {
      this.refesh();
    }
  }

  save() {
    if(!this.validate()) return;
    this.busyService.busy();
    this.genreService
      .createOrEditGenre(this.selectedRow!)
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: (res) => {
          if(res){
            this.toastrService.success(res.message);
            this.refesh();
            this.bsModalRef.hide();
          }
        },
      });
  }

  validate(): boolean{
    if(this.selectedRow?.name == ""){
      this.toastrService.error("Empty Name");
      return false;
    }

    return true;
  }

  refesh() {
    this.selectedRow = {} as GenreDto;
    this.selectedRow.name = '';
    this.selectedRow.desc = '';
    this.selectedRow.id = null;
    this.selectedRow.creationTime = new Date();
    this.selectedRow.isFeatured = false;
    this.selectedRow.status = true;
  }
}
