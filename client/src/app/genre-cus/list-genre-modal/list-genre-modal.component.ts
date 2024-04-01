import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { GenreCusOption } from 'src/app/_models/genreCusOption';
import { BusyService } from 'src/app/_services/busy.service';

@Component({
  selector: 'app-list-genre-modal',
  templateUrl: './list-genre-modal.component.html',
  styleUrls: ['./list-genre-modal.component.css'],
})
export class ListGenreModalComponent implements OnInit {
  genre: GenreCusOption = {} as GenreCusOption;
  genresForModal: GenreCusOption[] = [];
  genresForModalSource: GenreCusOption[] = [];
  searchGenre: string = '';

  constructor(
    public bsModalRef: BsModalRef,
    public bsModalService: BsModalService,
    private busyService: BusyService,
    private toastr: ToastrService
  ) {}
  ngOnInit(): void {
    this.genresForModalSource = this.genresForModal;
  }

  selectGenre(genreSelected: GenreCusOption) {
    this.genre = Object(genreSelected);
    this.bsModalRef.hide();
  }

  onChange(event: string) {
    this.genresForModalSource = this.genresForModal.filter((x) =>
      x.label.toLocaleLowerCase().includes(event.toLocaleLowerCase())
    );
  }
}
