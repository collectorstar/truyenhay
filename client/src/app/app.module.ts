import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FollowComponent } from './follow/follow.component';
import { LoginComponent } from './login/login.component';

import { OverlayModule } from '@angular/cdk/overlay';
import { CdkMenuModule } from '@angular/cdk/menu';
import { NavbarComponent } from './navbar/navbar.component';
import { RegisterComponent } from './register/register.component';
import { FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { JwtInterceptor } from './_interceptors/jwt.interceptor';
import { ErrorInterceptor } from './_interceptors/error.interceptor';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ConfirmDialogComponent } from './_model/_model/confirm-dialog/confirm-dialog.component';
import { UploadCommicComponent } from './upload-comic/upload-comic.component';
import { AccountDetailComponent } from './account-detail/account-detail.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { CreateOrEditComicComponent } from './upload-comic/create-or-edit-comic/create-or-edit-comic.component';
import { ListChapterComponent } from './upload-comic/list-chapter/list-chapter.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MultiselectDropdownComponent } from './_component/multiselect-dropdown/multiselect-dropdown.component';
import { CreateOrEditChapterComponent } from './upload-comic/list-chapter/create-or-edit-chapter/create-or-edit-chapter.component';
import { SubmenuComponent } from './navbar/submenu/submenu.component';
import { PaginatorModule } from 'primeng/paginator';
import { SliderHomeComponent } from './_component/slider-home/slider-home.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { TimeagoModule } from 'ngx-timeago';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ComicDetailComponent } from './comic-detail/comic-detail.component';
import { RatingModule } from 'primeng/rating';
import { ComicChapterComponent } from './comic-chapter/comic-chapter.component';
import { ChaptersModalComponent } from './comic-chapter/chapters-modal/chapters-modal.component';
import { ReportErrorModalComponent } from './comic-chapter/report-error-modal/report-error-modal.component';
import { SelectorComponent } from './_component/selector/selector.component';
import { SimpleAgGridComponent } from './_component/simple-ag-grid/simple-ag-grid.component';
import { RequestIncreaseMaxComicCreateComponent } from './upload-comic/request-increase-max-comic-create/request-increase-max-comic-create.component';
import { CommentsComponent } from './_component/comments/comments.component';
import { HistoryComponent } from './history/history.component';
import { GenreCusComponent } from './genre-cus/genre-cus.component';
import { FindComicComponent } from './find-comic/find-comic.component';
import { ListGenreModalComponent } from './genre-cus/list-genre-modal/list-genre-modal.component';
import { NotifyComponent } from './notify/notify.component';
import { FindAuthorComponent } from './find-author/find-author.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    FollowComponent,
    LoginComponent,
    NavbarComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    NotFoundComponent,
    ConfirmDialogComponent,
    UploadCommicComponent,
    AccountDetailComponent,
    CreateOrEditComicComponent,
    ListChapterComponent,
    CreateOrEditChapterComponent,
    SubmenuComponent,
    ComicDetailComponent,
    ComicChapterComponent,
    ChaptersModalComponent,
    ReportErrorModalComponent,
    RequestIncreaseMaxComicCreateComponent,
    HistoryComponent,
    GenreCusComponent,
    FindComicComponent,
    ListGenreModalComponent,
    NotifyComponent,
    FindAuthorComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    OverlayModule,
    CdkMenuModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-right',
    }),
    NgxSpinnerModule.forRoot({
      type: 'timer',
    }),
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    MultiselectDropdownComponent,
    PaginatorModule,
    CarouselModule,
    SliderHomeComponent,
    TimeagoModule.forRoot(),
    LazyLoadImageModule,
    RatingModule,
    SelectorComponent,
    SimpleAgGridComponent,
    CommentsComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
