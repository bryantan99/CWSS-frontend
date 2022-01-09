import {Component} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {AppService} from "./app.service";
import {AuthService} from "./auth/auth.service";
import {User} from "./shared/models/user";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  user: User;
  isCollapsed = true;
  appName = "CWSS";
  sidebarStyle: any = {
    padding: '0px',
    background: '#001529'
  };
  year: string = new Date().getFullYear().toString();

  constructor(private app: AppService,
              private http: HttpClient,
              private router: Router,
              private authService: AuthService) {
    this.authService.user.subscribe(resp => {
      this.user = resp;
    });
  }

  get isAdmin() {
    return this.user && (this.user.roleList.includes("ROLE_ADMIN") || this.user.roleList.includes("ROLE_SUPER_ADMIN"));
  }

  logout() {
    this.minimizeSidebar();
    this.authService.logOut();
  }

  minimizeSidebar() {
    this.isCollapsed = true;
  }
}
