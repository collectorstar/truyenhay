import { Component } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { CreateRequestIncMaxComicDto } from 'src/app/_models/createRequestIncMaxComicDto';
import { BusyService } from 'src/app/_services/busy.service';
import { UploadComicService } from 'src/app/_services/upload-comic.service';

@Component({
  selector: 'app-request-increase-max-comic-create',
  templateUrl: './request-increase-max-comic-create.component.html',
  styleUrls: ['./request-increase-max-comic-create.component.css'],
})
export class RequestIncreaseMaxComicCreateComponent {
  quantity: number = 1;
  request: string = '';
  constructor(
    public bsModalRef: BsModalRef,
    public bsModalService: BsModalService,
    private uploadComicService: UploadComicService,
    private busyService: BusyService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  save() {
    if (!this.validate()) return;
    this.busyService.busy();
    let dto: CreateRequestIncMaxComicDto = {
      quantity: this.quantity,
      request: this.request,
    };
    this.uploadComicService
      .requestIncMaxComic(dto)
      .pipe(
        finalize(() => {
          this.busyService.idle();
          this.bsModalRef.hide();
        })
      )
      .subscribe({
        next: () => {
          this.toastr.success('Request Success!');
        },
      });
  }

  validate(): boolean {
    if (this.quantity == null) {
      this.toastr.error("Quantity can't be null");
      return false;
    }

    if (this.quantity < 1 || this.quantity > 100) {
      this.toastr.error('Quantity must be from 1 to 100');
      return false;
    }

    if (this.request.trim() == '') {
      this.toastr.error('Empty request form');
      return false;
    }
    return true;
  }
}
