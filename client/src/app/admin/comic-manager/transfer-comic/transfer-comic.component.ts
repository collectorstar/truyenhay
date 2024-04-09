import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { ComicForComicManagerDto } from 'src/app/_models/comicForComicManagerDto';
import { BusyService } from 'src/app/_services/busy.service';
import { ComicManagerService } from 'src/app/_services/comic-manager.service';

@Component({
  selector: 'app-transfer-comic',
  templateUrl: './transfer-comic.component.html',
  styleUrls: ['./transfer-comic.component.css'],
})
export class TransferComicComponent {
  selectedRow: ComicForComicManagerDto = {} as ComicForComicManagerDto;
  email: string = '';
  constructor(
    public bsModalRef: BsModalRef,
    private comicManagerService: ComicManagerService,
    private busyService: BusyService,
    private toastrService: ToastrService
  ) {}
  ngOnInit(): void {}

  save() {
    if (!this.validate()) return;
    console.log(this.selectedRow);
    this.busyService.busy();
    this.comicManagerService
      .transferComic(this.selectedRow.id, this.email)
      .pipe(
        finalize(() => {
          this.busyService.idle();
        })
      )
      .subscribe({
        next: () => {
          this.toastrService.success('Transfer comic success!');
          this.bsModalRef.hide();
        },
      });
  }

  validate(): boolean {
    if (this.email.trim() == '') {
      this.toastrService.error('Empty Email');
      return false;
    }

    return true;
  }
}
