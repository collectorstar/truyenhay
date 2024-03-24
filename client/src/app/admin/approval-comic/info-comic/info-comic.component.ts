import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { ApprovalComicDto } from 'src/app/_models/approvalComicDto';
import { BusyService } from 'src/app/_services/busy.service';

@Component({
  selector: 'app-info-comic',
  templateUrl: './info-comic.component.html',
  styleUrls: ['./info-comic.component.css'],
})
export class InfoComicComponent implements OnInit{
  selectedRow: ApprovalComicDto | null = null;

  constructor(
    public bsModalRef: BsModalRef,
    private busyService: BusyService,
    private toastrService: ToastrService
  ) {}
  ngOnInit(): void {

  }

}
