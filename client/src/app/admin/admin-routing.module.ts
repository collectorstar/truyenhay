import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GenreComponent } from './genre/genre.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { RequestAuthorComponent } from './request-author/request-author.component';
import { RecommendComicsComponent } from './recommend-comics/recommend-comics.component';
import { ApprovalComicComponent } from './approval-comic/approval-comic.component';
import { RequestIncMaxComicComponent } from './request-inc-max-comic/request-inc-max-comic.component';
import { ApprovalChapterComponent } from './approval-chapter/approval-chapter.component';

const routes: Routes = [
  { path: 'genre', component: GenreComponent },
  { path: 'request-author', component: RequestAuthorComponent },
  { path: 'recommend-comic', component: RecommendComicsComponent },
  { path: 'approval-comic', component: ApprovalComicComponent },
  { path: 'request-inc-max-comic', component: RequestIncMaxComicComponent },
  { path: 'approval-chapter', component: ApprovalChapterComponent },
  { path: '**', component: NotFoundComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
