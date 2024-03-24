import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { BusyService } from 'src/app/_services/busy.service';

@Component({
  selector: 'app-info-chapter',
  templateUrl: './info-chapter.component.html',
  styleUrls: ['./info-chapter.component.css']
})
export class InfoChapterComponent implements OnInit{
  images: string[] = [];

  constructor(
    public bsModalRef: BsModalRef,
    private busyService: BusyService,
    private toastrService: ToastrService
  ) {}
  ngOnInit(): void {

  }
}
