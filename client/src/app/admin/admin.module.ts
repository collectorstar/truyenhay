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
import { ApprovalComicComponent } from './approval-comic/approval-comic.component';
import { InfoComicComponent } from './approval-comic/info-comic/info-comic.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { RequestIncMaxComicComponent } from './request-inc-max-comic/request-inc-max-comic.component';
import { ApprovalChapterComponent } from './approval-chapter/approval-chapter.component';
import { InfoChapterComponent } from './approval-chapter/info-chapter/info-chapter.component';
import { ComicHotComponent } from './comic-hot/comic-hot.component';
import { UserManagerComponent } from './user-manager/user-manager.component';
import { AssignAdminComponent } from './assign-admin/assign-admin.component';
import { ComicManagerComponent } from './comic-manager/comic-manager.component';
import { TransferComicComponent } from './comic-manager/transfer-comic/transfer-comic.component';
import { ChapterManagerComponent } from './chapter-manager/chapter-manager.component';


@NgModule({
  declarations: [
    GenreComponent,
    CreateOrEditGenreComponent,
    RequestAuthorComponent,
    RecommendComicsComponent,
    UpdateRecommendComicsComponent,
    ApprovalComicComponent,
    InfoComicComponent,
    RequestIncMaxComicComponent,
    ApprovalChapterComponent,
    InfoChapterComponent,
    ComicHotComponent,
    UserManagerComponent,
    AssignAdminComponent,
    ComicManagerComponent,
    TransferComicComponent,
    ChapterManagerComponent,
  ],
  imports: [
    FormsModule,
    SimpleAgGridComponent,
    CommonModule,
    AdminRoutingModule,
    BsDropdownModule.forRoot(),
    MultiselectDropdownComponent,
    LazyLoadImageModule,
    TabsModule.forRoot(),
  ]
})
export class AdminModule { }
