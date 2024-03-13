import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { TimeagoModule } from 'ngx-timeago';
import { RecommendComicDto } from 'src/app/_models/recommendComicDto';

// install Swiper modules
@Component({
  selector: 'slider-home',
  standalone: true,
  templateUrl: './slider-home.component.html',
  styleUrls: ['./slider-home.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, CarouselModule,TimeagoModule,LazyLoadImageModule],
  encapsulation: ViewEncapsulation.None,
})
export class SliderHomeComponent {
  @Input() datas: RecommendComicDto[] = [];

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    margin: 7,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navSpeed: 400,
    autoHeight: true,
    autoplay: true,
    autoplayTimeout: 3000,
    autoplaySpeed: 1000,
    navText: [
      '<i class="fa fa-chevron-left"></i>',
      '<i class="fa fa-chevron-right"></i>',
    ],
    nav: true,
    responsive: {
      0: {
        items: 2,
        margin:4
      },
      768: {
        items: 3,
      },
      1024: {
        items: 5,
      },
    },
  };

  clickImg(data : RecommendComicDto){
  }
}
