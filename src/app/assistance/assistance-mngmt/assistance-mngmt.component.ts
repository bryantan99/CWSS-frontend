import {Component, OnInit} from '@angular/core';
import {AssistanceService} from "../assistance.service";
import {AuthService} from "../../auth/auth.service";
import {User} from "../../shared/models/user";

@Component({
  selector: 'app-assistance-mngmt',
  templateUrl: './assistance-mngmt.component.html'
})
export class AssistanceMngmtComponent implements OnInit {

  user: User;
  isAdmin: boolean = false;
  tabIndex: number = 0;

  constructor(private assistanceService: AssistanceService,
              private authService: AuthService) {
    this.authService.user.subscribe(resp => {
      this.user = resp;
      this.isAdmin = this.authService.isAdminLoggedIn();
    });
  }

  ngOnInit(): void {
  }
}
