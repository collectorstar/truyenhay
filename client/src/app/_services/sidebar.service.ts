import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private statusSidebar = true;
  private sidebarSource = new BehaviorSubject<boolean>(this.statusSidebar);
  CurrentSidebar$ = this.sidebarSource.asObservable();

  constructor() {}

  toggleSidebar() {
    this.statusSidebar = !this.statusSidebar;
    this.setStatusSidebar(this.statusSidebar);
  }

  setStatusSidebar(status: boolean) {
    this.sidebarSource.next(status);
  }
}
