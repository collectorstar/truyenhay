import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { GenreComponent } from './genre/genre.component';
import { SimpleAgGridComponent } from '../_component/simple-ag-grid/simple-ag-grid.component';
import { FormsModule } from '@angular/forms';
import { CreateOrEditGenreComponent } from './genre/create-or-edit-genre/create-or-edit-genre.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { RequestAuthorComponent } from './request-author/request-author.component';
import { RecommendComicsComponent } from './recommend-comics/recommend-comics.component';
import { UpdateRecommendComicsComponent } from './recommend-comics/update-recommend-comics/update-recommend-comics.component';
import { MultiselectDropdownComponent } from '../_component/multiselect-dropdown/multiselect-dropdown.component';
import { LazyLoadImageModule } from 'ng-lazyload-image';


@NgModule({
  declarations: [
    GenreComponent,
    CreateOrEditGenreComponent,
    RequestAuthorComponent,
    RecommendComicsComponent,
    UpdateRecommendComicsComponent,
  ],
  imports: [
    FormsModule,
    SimpleAgGridComponent,
    CommonModule,
    AdminRoutingModule,
    BsDropdownModule.forRoot(),
    MultiselectDropdownComponent,
    LazyLoadImageModule
  ]
})
export class AdminModule { }
