import {Component, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {AppService} from "./app.service";
import {AuthService} from "./auth/auth.service";
import {User} from "./shared/models/user";
import {EventBusService} from "./shared/services/event-bus.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy{

  user: User;
  isCollapsed = true;
  appName = "CWSS";
  sidebarStyle: any = {
    padding: '0px',
    background: '#001529'
  };
  year: string = new Date().getFullYear().toString();
  eventBusSubscription?: Subscription;

  constructor(private app: AppService,
              private http: HttpClient,
              private router: Router,
              private authService: AuthService,
              private eventBusService: EventBusService) {
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

  ngOnDestroy(): void {
    if (this.eventBusSubscription) {
      this.eventBusSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.eventBusSubscription = this.eventBusService.on('logout', () => {
      this.logout();
    });
  }
}
