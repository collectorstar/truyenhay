import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { ChapterInfoForComicChapterDto } from 'src/app/_models/chapterInfoForComicChapterDto';
import { BusyService } from 'src/app/_services/busy.service';

@Component({
  selector: 'app-chapters-modal',
  templateUrl: './chapters-modal.component.html',
  styleUrls: ['./chapters-modal.component.css'],
})
export class ChaptersModalComponent implements OnInit {
  chapter: ChapterInfoForComicChapterDto = {} as ChapterInfoForComicChapterDto;
  chaptersForModal: ChapterInfoForComicChapterDto[] = [];
  chaptersForModalSource: ChapterInfoForComicChapterDto[] = [];
  searchChapter: string = '';

  constructor(
    public bsModalRef: BsModalRef,
    public bsModalService: BsModalService,
    private busyService: BusyService,
    private toastr: ToastrService
  ) {}
  ngOnInit(): void {
    this.chaptersForModalSource = this.chaptersForModal;
  }

  selectChapter(chapterSelected: ChapterInfoForComicChapterDto) {
    this.chapter = chapterSelected;
    this.bsModalRef.hide();
  }

  onChange(event: string) {
    this.chaptersForModalSource = this.chaptersForModal.filter((x) =>
      x.name.includes(event)
    );
  }
}
