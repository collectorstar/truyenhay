import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { TimeagoModule } from 'ngx-timeago';
import { PaginatorModule } from 'primeng/paginator';
import { CommentDto } from 'src/app/_models/commentDto';
import { Pagination } from 'src/app/_models/pagination';
import { User } from 'src/app/_models/user';
import { AccountService } from 'src/app/_services/account.service';
import { BusyService } from 'src/app/_services/busy.service';
import { CommentService } from 'src/app/_services/comment.service';

@Component({
  selector: 'comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LazyLoadImageModule,
    PaginatorModule,
    TimeagoModule,
  ],
})
export class CommentsComponent implements OnInit {
  @Input() user: User | null = null;
  @Input() name: string = '';
  @Input() content: string = '';
  @Input() comments: CommentDto[] = [];
  @Input() paginationParams: Pagination = {
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 3,
    totalPages: 1,
  };
  @Output() changeName = new EventEmitter();
  @Output() changeContent = new EventEmitter();
  @Output() changePagination = new EventEmitter();
  @Output() sendEvent = new EventEmitter();
  @Output() refeshEvent = new EventEmitter();
  @Output() OnFocusCommentEvent = new EventEmitter();

  constructor(
    private accountService: AccountService,
    private commentService: CommentService,
    private busyService: BusyService,
    public router: Router
  ) {}
  ngOnInit(): void {}

  paginationChange(event: any) {
    this.paginationParams.currentPage = event.page + 1;
    this.paginationParams.itemsPerPage = event.rows;
    this.paginationParams.totalPages = event.pageCount;
    this.changePagination.emit(this.paginationParams);
  }

  send() {
    this.sendEvent.emit();
  }
  refesh() {
    this.refeshEvent.emit();
  }

  focus() {
    this.OnFocusCommentEvent.emit(false);
  }

  blur() {
    this.OnFocusCommentEvent.emit(true);
  }

  toValidURL(inputString: string): string {
    const noSpacesString = inputString.replace(/\s/g, '-');
    const encodedString = noSpacesString.replace(/[^a-zA-Z0-9-_.~]/g, (char) => {
      return encodeURIComponent(char);
    });
    const normalizedString = encodedString.replace(/--+/g, '-');
    const lowercaseString = normalizedString.toLowerCase();
    return lowercaseString;
  }
}
