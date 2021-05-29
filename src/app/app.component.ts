import {Component} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {AppService} from "./app.service";
import {finalize} from "rxjs/operators";
import {AuthService} from "./auth/auth.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  isCollapsed = false;
  appName = "CHIS";

  constructor(private app: AppService,
              private http: HttpClient,
              private router: Router,
              private authService: AuthService) {
  }

  logout() {
    this.http.post('logout', {}).pipe(
      finalize(() => {
        this.app.authenticated = false;
        this.router.navigateByUrl('/home');
      })).subscribe();
  }

  hasUserLoggedIn():boolean {
    return this.authService.isUserLoggedIn();
  }
}
