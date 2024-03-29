import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComicDetailService } from '../_services/comic-detail.service';
import { ComicDetailDto } from '../_models/comicDetailDto';
import { BusyService } from '../_services/busy.service';
import { ToastrService } from 'ngx-toastr';
import { finalize, forkJoin } from 'rxjs';
import { User } from '../_models/user';
import { AccountService } from '../_services/account.service';
import { Pagination } from '../_models/pagination';
import { CommentService } from '../_services/comment.service';
import { CommentDto } from '../_models/commentDto';
import { GetCommentsParam } from '../_models/getCommentsParam';

@Component({
  selector: 'app-comic-detail',
  templateUrl: './comic-detail.component.html',
  styleUrls: ['./comic-detail.component.css'],
})
export class ComicDetailComponent implements OnInit {
  comic: ComicDetailDto = {} as ComicDetailDto;
  isSortDesc: boolean = true;
  user: User | null = null;

  nameComment: string = '';
  contentComment: string = '';
  paginationParamsComment: Pagination = {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 3,
    totalPages: 1,
  };
  comments: CommentDto[] = [];

  constructor(
    private route: ActivatedRoute,
    private comicDetailService: ComicDetailService,
    private busyService: BusyService,
    private accountService: AccountService,
    private toastr: ToastrService,
    public router: Router,
    private commentService: CommentService
  ) {
    this.accountService.currentUser$.subscribe({
      next: (res) => {
        this.user = res;
        if (res) {
          this.nameComment = res.name;
        }
      },
    });
  }

  ngOnInit(): void {
    this.repairData();
  }

  repairData() {
    this.busyService.busy();
    let comicId = this.route.snapshot.params['comicId'];
    let param = new GetCommentsParam();
    param.comicId = comicId;
    param.chapterId = -1;
    param.pageNumber = this.paginationParamsComment.currentPage;
    param.pageSize = this.paginationParamsComment.itemsPerPage;
    param;
    const commentRequest = this.commentService.getAllComment(param);
    const getComicRequest = this.comicDetailService.getComic(
      comicId,
      this.user
    );
    forkJoin([commentRequest, getComicRequest])
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: (res) => {
          this.comic = res[1];
          if (res[0] && res[0].pagination && res[0].result) {
            this.comments = res[0].result;
            this.paginationParamsComment = res[0].pagination;
          }
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
  readNewest() {
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

  validComment(): boolean {
    if (!this.user) {
      this.toastr.error('you must login');
      return false;
    }
    if (this.contentComment.trim() == '') {
      this.toastr.error('comment empty');
      return false;
    }

    if (this.nameComment.trim() == '') {
      this.toastr.error('name empty');
      return false;
    }

    return true;
  }

  sendComment() {
    if (!this.validComment()) return;
    this.busyService.busy();
    let dto = {
      comicId: this.comic.id,
      chapterId: -1,
      name: this.nameComment,
      content: this.contentComment,
    };
    this.commentService
      .sendComment(dto)
      .pipe(
        finalize(() => {
          this.busyService.idle();
          this.contentComment = '';
          this.getAllComment();
        })
      )
      .subscribe();
  }

  refeshComment() {
    this.getAllComment();
  }

  getAllComment() {
    this.busyService.busy();
    let param = new GetCommentsParam();
    param.pageNumber = this.paginationParamsComment.currentPage;
    param.pageSize = this.paginationParamsComment.itemsPerPage;
    param.chapterId = -1;
    param.comicId = this.comic.id;
    this.commentService
      .getAllComment(param)
      .pipe(finalize(() => this.busyService.idle()))
      .subscribe({
        next: (res) => {
          if (res && res.pagination && res.result) {
            this.comments = res.result;
            this.paginationParamsComment = res.pagination;
          }
        },
      });
  }

  changePageComment(event: Pagination) {
    this.paginationParamsComment = event;
    this.getAllComment();
  }
}
