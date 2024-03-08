import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { GenreComponent } from './genre/genre.component';
import { SimpleAgGridComponent } from '../_component/simple-ag-grid/simple-ag-grid.component';
import { FormsModule } from '@angular/forms';
import { CreateOrEditGenreComponent } from './genre/create-or-edit-genre/create-or-edit-genre.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { RequestAuthorComponent } from './request-author/request-author.component';


@NgModule({
  declarations: [
    GenreComponent,
    CreateOrEditGenreComponent,
    RequestAuthorComponent,
  ],
  imports: [
    FormsModule,
    SimpleAgGridComponent,
    CommonModule,
    AdminRoutingModule,
    BsDropdownModule.forRoot(),
  ]
})
export class AdminModule { }
