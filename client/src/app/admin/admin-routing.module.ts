import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GenreComponent } from './genre/genre.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { RequestAuthorComponent } from './request-author/request-author.component';

const routes: Routes = [
  { path: 'genre', component: GenreComponent },
  { path: 'request-author', component: RequestAuthorComponent },
  { path: '**', component: NotFoundComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
