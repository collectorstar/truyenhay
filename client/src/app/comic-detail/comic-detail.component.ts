import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComicDetailService } from '../_services/comic-detail.service';
import { ComicDetailDto } from '../_models/comicDetailDto';
import { BusyService } from '../_services/busy.service';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { User } from '../_models/user';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-comic-detail',
  templateUrl: './comic-detail.component.html',
  styleUrls: ['./comic-detail.component.css'],
})
export class ComicDetailComponent implements OnInit, OnDestroy {
  comic: ComicDetailDto = {} as ComicDetailDto;
  isSortDesc: boolean = true;
  hasRead: any;
  user: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private comicDetailService: ComicDetailService,
    private busyService: BusyService,
    private accountService: AccountService,
    private toastr: ToastrService,
    public router: Router
  ) {
    this.accountService.currentUser$.subscribe({
      next: (res) => {
        if (res) {
          this.user = res;
        }
      },
    });
  }
  ngOnDestroy(): void {
    clearTimeout(this.hasRead);
  }
  ngOnInit(): void {
    this.getComic();

    this.hasRead = setTimeout(() => {}, 5000);
  }

  getComic() {
    let comicId = this.route.snapshot.params['comicId'];
    this.comicDetailService
      .getComic(comicId, this.user)
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: (res) => {
          this.comic = res;
        },
      });
  }

  showMoreDesc() {
    this.isSortDesc = !this.isSortDesc;
  }

  follow() {
    if (this.user == null) {
      this.toastr.warning('Login to follow comic');
      this.router.navigateByUrl('/login');
      return;
    }

    this.busyService.busy();

    this.comicDetailService
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

    this.comicDetailService
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

  rating(event: any) {
    if (this.user == null) {
      this.toastr.warning('Login to rating comic');
      this.router.navigateByUrl('/login');
      return;
    }

    this.busyService.busy();
    this.comicDetailService
      .rating(this.comic.id, event.value)
      .pipe(
        finalize(() => {
          this.busyService.idle();
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

  convertToK(target: number): string {
    if (target < 1000) return target + '';
    return (target / 1000).toFixed(2) + 'k';
  }

  readFirst() {
    if (this.comic.chapters.length > 0) {
      let chapterWant = this.comic.chapters[0];
      this.router.navigateByUrl(
        '/comic-detail/' +
          this.comic.name.replaceAll(' ', '-') +
          '/' +
          this.comic.id +
          '/' +
          chapterWant.name.replaceAll(' ', '-') +
          '/' +
          chapterWant.id
      );
    }
  }
  readNewest() {
    if (this.comic.chapters.length > 0) {
      let chapterWant = this.comic.chapters[this.comic.chapters.length - 1];
      this.router.navigateByUrl(
        '/comic-detail/' +
          this.comic.name.replaceAll(' ', '-') +
          '/' +
          this.comic.id +
          '/' +
          chapterWant.name.replaceAll(' ', '-') +
          '/' +
          chapterWant.id
      );
    }
  }
}
