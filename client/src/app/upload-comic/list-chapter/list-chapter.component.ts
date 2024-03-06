import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { ChapterDto } from 'src/app/_models/chapterDto';
import { ComicDetailDto } from 'src/app/_models/comicDetailDto';
import { BusyService } from 'src/app/_services/busy.service';
import { UploadComicService } from 'src/app/_services/upload-comic.service';
import { CreateOrEditChapterComponent } from './create-or-edit-chapter/create-or-edit-chapter.component';
import { ConfirmService } from 'src/app/_services/confirm.service';

@Component({
  selector: 'app-list-chapter',
  templateUrl: './list-chapter.component.html',
  styleUrls: ['./list-chapter.component.css'],
})
export class ListChapterComponent implements OnInit {
  comic: ComicDetailDto = {} as ComicDetailDto;
  listChapter: ChapterDto[] = [];
  bsModalRef: BsModalRef<CreateOrEditChapterComponent> =
    new BsModalRef<CreateOrEditChapterComponent>();
  constructor(
    private route: ActivatedRoute,
    private uploadComicService: UploadComicService,
    private toastr: ToastrService,
    private busyService: BusyService,
    private modalService: BsModalService,
    private confirmService: ConfirmService
  ) {
    this.getAll();
  }
  ngOnInit(): void {}

  getAll() {
    let comicId = this.route.snapshot.params['comicId'];
    this.busyService.busy();
    this.uploadComicService
      .getListChapter(comicId)
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.comic = res;
            this.listChapter = res.chapters;
          }
        },
      });
  }

  openModal(isCreate: boolean, data?: ChapterDto) {
    const config = {
      class: 'modal-dialog',
      initialState: {
        selectedRow: isCreate ? null : data,
        comic: this.comic,
      },
    };

    this.bsModalRef = this.modalService.show(
      CreateOrEditChapterComponent,
      config
    );

    this.bsModalRef.onHide?.subscribe({
      next: () => {
        this.getAll();
      },
    });
  }

  deleteChapter(chapterId: number) {
    this.confirmService
      .confirm(
        'Are you sure you want delete this chapter?',
        'This action will delete all related data',
        'Continue',
        "No, I'm not sure"
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.busyService.busy();
            this.uploadComicService
              .deleteChapter(this.comic.id, chapterId)
              .pipe(
                finalize(() => {
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
        },
      });
  }
}
