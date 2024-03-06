import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';
import { map } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const toastr = inject(ToastrService);
  const router = inject(Router);

  return accountService.currentUser$.pipe(
    map((user) => {
      if (user && user.roles.find((x) => x == 'Admin')) return true;
      toastr.error('You not has permistion');
      router.navigateByUrl('/');
      return false;
    })
  );
};
