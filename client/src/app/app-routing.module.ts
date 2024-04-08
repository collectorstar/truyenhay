import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FollowComponent } from './follow/follow.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { adminGuard } from './_guards/admin.guard';
import { loginGuard } from './_guards/login.guard';
import { UploadCommicComponent } from './upload-comic/upload-comic.component';
import { AccountDetailComponent } from './account-detail/account-detail.component';
import { ListChapterComponent } from './upload-comic/list-chapter/list-chapter.component';
import { ComicDetailComponent } from './comic-detail/comic-detail.component';
import { ComicChapterComponent } from './comic-chapter/comic-chapter.component';
import { HistoryComponent } from './history/history.component';
import { GenreCusComponent } from './genre-cus/genre-cus.component';
import { FindComicComponent } from './find-comic/find-comic.component';
import { NotifyComponent } from './notify/notify.component';
import { FindAuthorComponent } from './find-author/find-author.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, pathMatch: 'full' },
  { path: 'register', component: RegisterComponent, pathMatch: 'full' },
  {
    path: 'forgot-pass',
    component: ForgotPasswordComponent,
    pathMatch: 'full',
  },
  { path: 'home', component: DashboardComponent },
  {
    path: 'admintruyenhay',
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminModule),
    canActivate: [loginGuard, adminGuard],
  },
  {
    path: 'upload-comic',
    component: UploadCommicComponent,
    canActivate: [loginGuard],
    pathMatch: 'full',
  },
  {
    path: 'upload-comic/:comicId',
    component: ListChapterComponent,
    canActivate: [loginGuard],
  },
  {
    path: 'comic-detail/:comicName/:comicId',
    component: ComicDetailComponent,
  },
  {
    path: 'comic-detail/:comicName/:comicId/:chapterName/:chapterId',
    component: ComicChapterComponent,
  },
  { path: 'follow', component: FollowComponent, canActivate: [loginGuard] },
  {
    path: 'account-detail',
    component: AccountDetailComponent,
    canActivate: [loginGuard],
    pathMatch: 'full',
  },
  { path: 'history', component: HistoryComponent, canActivate: [loginGuard] },
  { path: 'genre-cus', component: GenreCusComponent },
  { path: 'find-comic', component: FindComicComponent },
  { path: 'notify', component: NotifyComponent, canActivate: [loginGuard] },
  {
    path: 'find-author/:authorName',
    component: FindAuthorComponent,
  },
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', component: NotFoundComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
