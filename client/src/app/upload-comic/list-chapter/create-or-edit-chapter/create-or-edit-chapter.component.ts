import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { IsNumericFileName } from 'src/app/_extensions/checkFileNameInteger';
import { ChapterDto } from 'src/app/_models/chapterDto';
import { ComicDetailDtoForListChapter } from 'src/app/_models/comicDetailDtoForListChapter';
import { BusyService } from 'src/app/_services/busy.service';
import { UploadComicService } from 'src/app/_services/upload-comic.service';

@Component({
  selector: 'app-create-or-edit-chapter',
  templateUrl: './create-or-edit-chapter.component.html',
  styleUrls: ['./create-or-edit-chapter.component.css'],
})
export class CreateOrEditChapterComponent implements OnInit {
  comic: ComicDetailDtoForListChapter = {} as ComicDetailDtoForListChapter;
  selectedRow: ChapterDto | null = null;
  textFile: string = ' Chưa chọn file';
  selectedFiles: File[] | null = null;

  constructor(
    public bsModalRef: BsModalRef,
    public bsModalService: BsModalService,
    private uploadComicService: UploadComicService,
    private busyService: BusyService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    if (!this.selectedRow) {
      this.refesh();
    }
  }

  save() {
    if (!this.validate()) return;
    if (this.selectedRow?.id == null) {
      if (this.selectedFiles == null) {
        this.toastr.error('File Is Empty!');
        return;
      }
    }

    this.busyService.busy();
    this.uploadComicService
      .createOrEditChapter(
        this.selectedRow!,
        this.selectedFiles ?? [],
        this.comic.id
      )
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.toastr.success(res.message);
            this.bsModalRef.hide();
          }
        },
      });
  }

  validate(): boolean {
    if (this.selectedRow?.name == '') {
      this.toastr.error('Empty Name');
      return false;
    }

    return true;
  }

  refesh() {
    this.selectedRow = {} as ChapterDto;
    this.selectedRow.name = '';
    this.selectedRow.id = null;
    this.selectedRow.status = true;
  }

  changeFile(event: any) {
    let files: FileList = event.target.files;
    let selectedListfile: File[] = [];
    for (let i = 0; i < files.length; i++) {
      selectedListfile.push(files.item(i)!);
    }

    if (
      selectedListfile.findIndex((x) => x.type.slice(0, 5) !== 'image') != -1
    ) {
      this.toastr.error('Please only choose image file');
      return;
    }

    if (selectedListfile.findIndex((x) => x.size >= 2 * 1024 * 1024) != -1) {
      this.toastr.error('File size too big!');
      return;
    }

    if (
      selectedListfile.findIndex((x) =>
        ! IsNumericFileName(x.name.split('.')[0])
      ) != -1
    ) {
      this.toastr.error('The file name must be an integer!');
      return;
    }

    this.selectedFiles = selectedListfile;
    this.textFile = ' selected ' + this.selectedFiles?.length + ' photos';

  }
}
