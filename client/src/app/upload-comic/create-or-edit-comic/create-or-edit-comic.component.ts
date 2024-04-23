import { Component } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { GenreForUploadComicDto } from 'src/app/_models/genreForUploadComicDto';
import { UploadComicDto } from 'src/app/_models/uploadComicDto';
import { BusyService } from 'src/app/_services/busy.service';
import { UploadComicService } from 'src/app/_services/upload-comic.service';

@Component({
  selector: 'app-create-or-edit-comic',
  templateUrl: './create-or-edit-comic.component.html',
  styleUrls: ['./create-or-edit-comic.component.css'],
})
export class CreateOrEditComicComponent {
  selectedRow: UploadComicDto | null = null;
  textFile: string = 'Chưa chọn file';
  selectedFile: File | null = null;
  dropDownGenres: GenreForUploadComicDto[] = [];
  selectedGenres: GenreForUploadComicDto[] = [];

  constructor(
    public bsModalRef: BsModalRef,
    public bsModalService: BsModalService,
    private uploadComicService: UploadComicService,
    private busyService: BusyService,
    private toastr: ToastrService
  ) {
    this.busyService.busy();
    this.uploadComicService
      .getListGenre()
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.dropDownGenres = res;
          }
        },
      });
  }

  ngOnInit(): void {
    if (!this.selectedRow) {
      this.refesh();
    }
  }

  save() {
    if (!this.validate()) return;
    if (this.selectedRow?.id == null) {
      if (this.selectedFile == null) {
        this.toastr.error('File Is Empty!');
        return;
      }
    }
    this.busyService.busy();
    this.uploadComicService
      .createOrEditComic(this.selectedRow!,this.selectedFile!,this.selectedGenres)
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.toastr.success(res.message);
            // this.refesh();
            this.bsModalRef.hide();
          }
        },
      });
  }

  validate(): boolean {
    if (this.selectedRow?.name.trim() == '') {
      this.toastr.error('Empty Name');
      return false;
    }

    if (this.selectedGenres.length <= 0) {
      this.toastr.error('Genre is not empty!');
      return false;
    }

    if (this.selectedGenres.length > 10) {
      this.toastr.error('Do not choose more than 10 genres!');
      return false;
    }

    return true;
  }

  refesh() {
    this.selectedRow = {} as UploadComicDto;
    this.selectedRow.name = '';
    this.selectedRow.authorName = '';
    this.selectedRow.isCompleted = false
    this.selectedRow.desc = '';
    this.selectedRow.id = null;
    this.selectedRow.isFeatured = false;
    this.selectedRow.status = true;
  }

  onChange(event: any) {
    this.selectedGenres = event;
  }

  changeFile(event: any) {
    if (event.target.files[0].type.slice(0, 5) !== 'image') {
      this.toastr.error('file is not a image');
      return;
    }

    if (event.target.files[0].size >= 2 * 1024 * 1024) {
      this.toastr.error('file too big');
      return;
    }
    this.selectedFile = event.target.files[0];
    this.textFile = event.target.files[0].name;
  }
}
