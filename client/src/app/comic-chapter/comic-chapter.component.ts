import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { BusyService } from '../_services/busy.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { ChapterService } from '../_services/chapter.service';
import { finalize, forkJoin } from 'rxjs';
import { User } from '../_models/user';
import { AccountService } from '../_services/account.service';
import { ComicInfoForComicChapterDto } from '../_models/comicInfoForComicChapterDto';
import { ChapterInfoForComicChapterDto } from '../_models/chapterInfoForComicChapterDto';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ChaptersModalComponent } from './chapters-modal/chapters-modal.component';
import { ReportErrorModalComponent } from './report-error-modal/report-error-modal.component';

@Component({
  selector: 'app-comic-chapter',
  templateUrl: './comic-chapter.component.html',
  styleUrls: ['./comic-chapter.component.css'],
})
export class ComicChapterComponent implements OnInit, OnDestroy {
  comic: ComicInfoForComicChapterDto = {} as ComicInfoForComicChapterDto;
  chapter: ChapterInfoForComicChapterDto = {} as ChapterInfoForComicChapterDto;
  chaptersForModal: ChapterInfoForComicChapterDto[] = [];
  user: User | null = null;
  images: string[] = [];
  callbackHasReaded: any;
  isChapterFirst = false;
  isChapterLast = false;
  bsModalRef: BsModalRef<ChaptersModalComponent> =
    new BsModalRef<ChaptersModalComponent>();

  bsModalRefReportChapter: BsModalRef<ReportErrorModalComponent> =
    new BsModalRef<ReportErrorModalComponent>();

  constructor(
    private busyService: BusyService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    public router: Router,
    public chapterService: ChapterService,
    private accountService: AccountService,
    private modalService: BsModalService
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
    this.moveToTop();
    let comicId = this.route.snapshot.params['comicId'];
    let chapterId = this.route.snapshot.params['chapterId'];
    const getComicInfoRequest = this.chapterService.getComicInfo(
      comicId,
      this.user?.email ?? ''
    );
    const getChapterInfoRequest = this.chapterService.getChapterInfo(
      comicId,
      chapterId,
      this.user?.email ?? ''
    );
    const getListChapterRequest = this.chapterService.getListChapterComic(
      comicId,
      this.user?.email ?? ''
    );
    const getChapterImagesRequest = this.chapterService.getChapterImages(
      comicId,
      chapterId
    );

    this.busyService.busy();
    forkJoin([
      getComicInfoRequest,
      getChapterInfoRequest,
      getListChapterRequest,
      getChapterImagesRequest,
    ])
      .pipe(
        finalize(() => {
          this.busyService.idle();
          this.setUpIndexChapter();
          this.clearTimeoutHasRead();
          this.setHasReaded();
        })
      )
      .subscribe({
        next: (res) => {
          this.comic = res[0];
          this.chapter = res[1];
          this.chaptersForModal = res[2];
          this.images = res[3];
        },
      });
  }
  ngOnDestroy(): void {
    this.clearTimeoutHasRead();
  }

  clearTimeoutHasRead() {
    if (this.user != null) {
      clearTimeout(this.callbackHasReaded);
    }
  }

  setHasReaded() {
    if (this.user != null) {
      this.callbackHasReaded = setTimeout(() => {
        this.chapterService
          .markChapterHasReaded(this.comic.id, this.chapter.id)
          .subscribe({
            next: () => {
              this.chapter.isReaded = true;
              let index = this.chaptersForModal.findIndex(
                (x) => x.id == this.chapter.id
              );
              if (index != -1) {
                this.chaptersForModal[index].isReaded = true;
              }
            },
          });
      }, 5000);
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == 'ArrowRight') {
      this.navNext();
    }
    if (event.key == 'ArrowLeft') {
      this.navPrev();
    }
  }

  getImages() {
    this.busyService.busy();
    this.chapterService
      .getChapterImages(this.comic.id, this.chapter.id)
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: (res) => {
          this.images = res;
        },
      });
  }

  moveToTop() {
    window.scrollTo(0, 0);
  }

  setUpIndexChapter() {
    let index = this.chaptersForModal.findIndex((x) => x.id == this.chapter.id);
    if (index == 0) {
      this.isChapterFirst = true;
    } else {
      this.isChapterFirst = false;
    }
    if (index == this.chaptersForModal.length - 1) {
      this.isChapterLast = true;
    } else {
      this.isChapterLast = false;
    }
  }

  navPrev() {
    if (this.isChapterFirst) {
      this.toastr.warning('Is the First chapter!');
      return;
    }

    let index = this.chaptersForModal.findIndex((x) => x.id == this.chapter.id);

    let chapterToGo = this.chaptersForModal[index - 1];

    this.actionLoadSameComic(chapterToGo);
  }

  navNext() {
    if (this.isChapterLast) {
      this.toastr.warning('Is the Last chapter!');
      return;
    }

    let index = this.chaptersForModal.findIndex((x) => x.id == this.chapter.id);

    let chapterToGo = this.chaptersForModal[index + 1];

    this.actionLoadSameComic(chapterToGo);
  }

  actionLoadSameComic(chapterNew: ChapterInfoForComicChapterDto) {
    const getChapterInfoRequest = this.chapterService.getChapterInfo(
      this.comic.id,
      chapterNew.id,
      this.user?.email ?? ''
    );

    const getChapterImagesRequest = this.chapterService.getChapterImages(
      this.comic.id,
      chapterNew.id
    );

    this.busyService.busy();
    forkJoin([getChapterInfoRequest, getChapterImagesRequest])
      .pipe(
        finalize(() => {
          this.busyService.idle();
          this.router.navigateByUrl(
            '/comic-detail/' +
              this.comic.name.replaceAll(' ', '-') +
              '/' +
              this.comic.id +
              '/' +
              this.chapter.name.replaceAll(' ', '-') +
              '/' +
              this.chapter.id
          );
          this.setUpIndexChapter();
          this.moveToTop();
          this.clearTimeoutHasRead();
          this.setHasReaded();
        })
      )
      .subscribe({
        next: (res) => {
          this.chapter = res[0];
          this.images = res[1];
        },
      });
  }

  eventKeyDown(event: any) {
    console.log(event);
  }

  openModelReportChapter() {
    const config = {
      class: 'modal-dialog',
      initialState: {
        chapter: this.chapter,
        comic: this.comic
      },
    };

    this.bsModalRefReportChapter = this.modalService.show(ReportErrorModalComponent, config);

    this.bsModalRefReportChapter.onHide?.subscribe({
      next: () => {
        let chapterSelected = this.bsModalRefReportChapter.content?.chapter;
        if (chapterSelected != undefined) {
          this.actionLoadSameComic(chapterSelected);
        }
      },
    });
  }

  openModelChapter() {
    if(this.user == null){
      this.toastr.error("Please login!");
      return;
    }
    const config = {
      class: 'modal-dialog',
      initialState: {
        chapter: this.chapter,
        chaptersForModal: this.chaptersForModal,
      },
    };

    this.bsModalRef = this.modalService.show(ChaptersModalComponent, config);

    this.bsModalRef.onHide?.subscribe({
      next: () => {
        let chapterSelected = this.bsModalRef.content?.chapter;
        if (chapterSelected != undefined) {
          this.actionLoadSameComic(chapterSelected);
        }
      },
    });
  }

  follow() {
    if (this.user == null) {
      this.toastr.warning('Login to follow comic');
      this.router.navigateByUrl('/login');
      return;
    }

    this.busyService.busy();

    this.chapterService
      .follow(this.comic.id)
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: () => {
          this.comic.isFollow = true;
        },
      });
  }

  unfollow() {
    if (this.user == null) {
      this.toastr.warning('Login to follow comic');
      this.router.navigateByUrl('/login');
      return;
    }

    this.busyService.busy();

    this.chapterService
      .unfollow(this.comic.id)
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: () => {
          this.comic.isFollow = false;
        },
      });
  }
}
