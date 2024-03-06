import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { GenreComponent } from './genre/genre.component';
import { SimpleAgGridComponent } from '../_component/simple-ag-grid/simple-ag-grid.component';
import { FormsModule } from '@angular/forms';
import { CreateOrEditGenreComponent } from './genre/create-or-edit-genre/create-or-edit-genre.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';


@NgModule({
  declarations: [
    GenreComponent,
    CreateOrEditGenreComponent,
  ],
  imports: [
    FormsModule,
    SimpleAgGridComponent,
    CommonModule,
    AdminRoutingModule,
    BsDropdownModule.forRoot()
  ]
})
export class AdminModule { }
