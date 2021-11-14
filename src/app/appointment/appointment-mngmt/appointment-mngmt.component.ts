import {Component, OnInit} from '@angular/core';
import {AppointmentService} from "../appointment.service";
import {AuthService} from "../../auth/auth.service";
import {User} from "../../shared/models/user";
import {RoleConstant} from "../../shared/constants/role-constant";

@Component({
  selector: 'app-appointment-mngmt',
  templateUrl: './appointment-mngmt.component.html'
})
export class AppointmentMngmtComponent implements OnInit {

  user: User;
  isAdmin: boolean;
  isSuperAdmin: boolean = false;
  tabIndex: number = 0;

  constructor(private appointmentService: AppointmentService,
              private authService: AuthService) {
    this.authService.user.subscribe(resp => {
      this.user = resp;
      this.isAdmin = this.authService.isAdminLoggedIn();
      this.isSuperAdmin = this.authService.hasRole(RoleConstant.ROLE_SUPER_ADMIN);
    });
  }

  ngOnInit(): void {
  }

}
