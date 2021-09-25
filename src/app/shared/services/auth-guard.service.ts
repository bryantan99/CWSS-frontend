import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from "@angular/router";
import {AuthService} from "../../auth/auth.service";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private authService: AuthService,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const user = this.authService.userValue;
    if (user) {
      if (route.data.roles) {
        const ALLOWED_ROLES: Array<string> = route.data.roles;
        const USER_ROLES: Array<string> = user.roleList ? user.roleList : [];
        if (!USER_ROLES.some(role => ALLOWED_ROLES.includes(role))) {
          this.router.navigate(['/']);
          return false;
        }
      }
      return true;
    }
    this.router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
    return false;
  }
}
