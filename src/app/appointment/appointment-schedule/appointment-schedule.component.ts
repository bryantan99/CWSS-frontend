import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../auth/auth.service";
import {User} from "../../shared/models/user";
import {AppointmentService} from "../appointment.service";
import {NotificationService} from "../../shared/services/notification.service";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {FormBuilder, FormGroup} from "@angular/forms";
import {finalize} from "rxjs/operators";
import * as moment from "moment";
import {differenceInCalendarDays} from "date-fns";

@Component({
  selector: 'app-appointment-schedule',
  templateUrl: './appointment-schedule.component.html'
})
export class AppointmentScheduleComponent implements OnInit {
  appointmentList: any[] = [];
  user: User;
  isAdmin: boolean;
  form: FormGroup;
  isLoading: boolean = false;
  today = new Date();
  disabledDate = (current: Date): boolean => differenceInCalendarDays(current, this.today) < 0;

  constructor(private authService: AuthService,
              private appointmentService: AppointmentService,
              private notificationService: NotificationService,
              private fb: FormBuilder) {
    this.authService.user.subscribe(resp => {
      this.user = resp;
      this.isAdmin = this.authService.isAdminLoggedIn();
    });
  }

  ngOnInit(): void {
    this.initFilterForm();
    this.getConfirmedAppointments();
  }

  getConfirmedAppointments() {
    const date = this.form.controls['date'].value ? new Date(this.form.controls['date'].value) : null;

    this.isLoading = true;
    this.appointmentService.getConfirmedAppointments(date)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.appointmentList = resp.data ? resp.data : [];
        }
      }, error => {
        this.isLoading = false;
        this.appointmentList = [];
        this.notificationService.createErrorNotification("There\'s an error when retrieving scheduled appointments on " + date);
        console.log(error);
      })
  }

  private initFilterForm() {
    this.form = this.fb.group({
      date: [this.today]
    });
  }

  generateString(appointment: any) {
    const startTime = moment(appointment.startDatetime).format("hh:mm A");
    const endTime = moment(appointment.endDatetime).format("hh:mm A");
    const targetName = this.isAdmin ? appointment.userFullName : appointment.adminFullName;
    const msg = " Appointment with " + targetName + " [Appointment ID: " + appointment.appointmentId + "]."
    return "<b>" + startTime + " - " + endTime + "</b> : " + msg;
  }
}
