import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { finalize, forkJoin } from 'rxjs';
import { ComicForIsRecommend } from 'src/app/_models/comicForIsRecommendDto';
import { BusyService } from 'src/app/_services/busy.service';
import { RecommendComicsService } from 'src/app/_services/recommend-comics.service';

@Component({
  selector: 'app-update-recommend-comics',
  templateUrl: './update-recommend-comics.component.html',
  styleUrls: ['./update-recommend-comics.component.css'],
})
export class UpdateRecommendComicsComponent {
  dropDownComics: ComicForIsRecommend[] = [];
  selectedComics: ComicForIsRecommend[] = [];

  constructor(
    public bsModalRef: BsModalRef,
    private busyService: BusyService,
    private toastrService: ToastrService,
    private carouselService: RecommendComicsService
  ) {
    const getlistcomic = this.carouselService.getListComic();
    const getlistcomicrecommned = this.carouselService.getListComicRecommend();
    this.busyService.busy();
    forkJoin([getlistcomic, getlistcomicrecommned])
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: (res) => {
          this.dropDownComics = res[0];
          this.selectedComics = res[1];
        },
      });
  }

  onChange(event: any) {
    this.selectedComics = event;
  }

  save() {
    if (!this.validate()) return;
    // this.carouselService
    //   .update(JSON.stringify(this.selectedComics))
    //   .pipe(
    //     finalize(() => {
    //       this.busyService.idle();
    //     })
    //   )
    //   .subscribe({
    //     next: (res) => {
    //       if (res) {
    //         this.toastrService.success(res.message);
    //         this.bsModalRef.hide();
    //       }
    //     },
    //   });

    this.carouselService
      .update(this.selectedComics)
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.toastrService.success(res.message);
            this.bsModalRef.hide();
          }
        },
      });
  }

  validate(): boolean {
    if (this.selectedComics.length < 7 || this.selectedComics.length > 12) {
      this.toastrService.error('Choose from 7 to 12 items!');
      return false;
    }
    return true;
  }
}
