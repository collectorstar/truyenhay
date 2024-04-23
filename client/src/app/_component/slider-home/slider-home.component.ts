import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
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
  imports: [CommonModule, CarouselModule, TimeagoModule, LazyLoadImageModule],
  encapsulation: ViewEncapsulation.None,
})
export class SliderHomeComponent {
  constructor(public router: Router) {}
  
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
        margin: 4,
      },
      696: {
        items: 4,
      },
      1116: {
        items: 6,
      },
    },
  };

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
