import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { ReportErrorCode } from 'src/app/_extensions/enumHelper';
import { ChapterInfoForComicChapterDto } from 'src/app/_models/chapterInfoForComicChapterDto';
import { ComicInfoForComicChapterDto } from 'src/app/_models/comicInfoForComicChapterDto';
import { ReportErrorChapterDto } from 'src/app/_models/reportErrorChapterDto';
import { User } from 'src/app/_models/user';
import { AccountService } from 'src/app/_services/account.service';
import { BusyService } from 'src/app/_services/busy.service';
import { ChapterService } from 'src/app/_services/chapter.service';

@Component({
  selector: 'app-report-error-modal',
  templateUrl: './report-error-modal.component.html',
  styleUrls: ['./report-error-modal.component.css'],
})
export class ReportErrorModalComponent implements OnInit {
  user: User | null = null;
  chapter: ChapterInfoForComicChapterDto = {} as ChapterInfoForComicChapterDto;
  comic: ComicInfoForComicChapterDto = {} as ComicInfoForComicChapterDto;
  errorOptions: { value: number; label: string; questionHelper: string }[] = [];
  errorOptionSelected: {
    value: number;
    label: string;
    questionHelper: string;
  } = { value: 0, label: '--select error type--', questionHelper: '' };
  desc: string = '';
  constructor(
    public bsModalRef: BsModalRef,
    public bsModalService: BsModalService,
    private busyService: BusyService,
    private toastr: ToastrService,
    public chapterService: ChapterService,
    private accountService: AccountService
  ) {
    this.accountService.currentUser$.subscribe({
      next: (res) => {
        if (res) {
          this.user = res;
        }
      },
    });
  }
  ngOnInit(): void {
    this.errorOptions = [
      { value: 0, label: '--select error type--', questionHelper: '' },
      {
        value: ReportErrorCode.ImageError,
        label: 'Image Error',
        questionHelper:
          'Does the image take a long time to load or is the entire image corrupted?',
      },
      {
        value: ReportErrorCode.DublicateChapter,
        label: 'Dublicate Chapter',
        questionHelper: 'Which chapter overlaps?',
      },
      {
        value: ReportErrorCode.WrongComicUpload,
        label: 'Wrong upload comic',
        questionHelper: 'Chapter is not this comic?',
      },
      {
        value: ReportErrorCode.Other,
        label: 'Other',
        questionHelper: 'Any other problem?',
      },
    ];
  }

  report() {
    if (this.user == null) {
      this.toastr.warning('please login');
      return;
    }
    if (!this.validate()) return;

    let dto: ReportErrorChapterDto = {
      comicId: this.comic.id,
      chapterId: this.chapter.id,
      errorCode: this.errorOptionSelected.value,
      desc: this.desc,
    };
    this.busyService.busy();
    this.chapterService
      .reportChapter(dto)
      .pipe(
        finalize(() => {
          this.busyService.idle();
          this.bsModalRef.hide();
        })
      )
      .subscribe({
        next: () => {
          this.toastr.success('Thank you for reporting!');
        },
      });
  }

  validate(): boolean {
    if (this.errorOptionSelected.value == 0) {
      this.toastr.error('please select error type');
      return false;
    }

    if (this.desc.trim() == '') {
      this.toastr.error('please input describe error!');
      return false;
    }

    return true;
  }
}
