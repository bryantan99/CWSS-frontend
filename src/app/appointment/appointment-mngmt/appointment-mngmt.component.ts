import {Component, OnInit} from '@angular/core';
import {AppointmentService} from "../appointment.service";
import {AuthService} from "../../auth/auth.service";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {User} from "../../shared/models/user";
import {NotificationService} from "../../shared/services/notification.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {finalize} from "rxjs/operators";

@Component({
  selector: 'app-appointment-mngmt',
  templateUrl: './appointment-mngmt.component.html'
})
export class AppointmentMngmtComponent implements OnInit {
  dataSet;
  displayData: any;
  pageIndex = 1;
  pageSize = 10;
  selectedDate: Date;

  user: User;
  isAdmin: boolean;
  dateTimeModalIsVisible: boolean = false;

  changeAppointmentDatetimeForm: FormGroup;
  appointment;
  isLoading: boolean = false;

  constructor(private appointmentService: AppointmentService,
              private authService: AuthService,
              private notificationService: NotificationService,
              private fb: FormBuilder) {
    this.authService.user.subscribe(resp => {
      this.user = resp;
      this.isAdmin = this.authService.isAdminLoggedIn();
    });
  }

  ngOnInit(): void {
    this.getAppointments();
  }

  cancelAppointment(appointmentId: any) {
    this.appointmentService.cancelAppointment(appointmentId)
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.notificationService.createSuccessNotification("Successfully cancelled appointment.");
          this.getAppointments();
        }
      })
  }

  openDatetimeModal(appointmentId: number) {
    this.appointmentService.getAppointment(appointmentId)
      .pipe(finalize(() => {
        this.dateTimeModalIsVisible = true;
      }))
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK && resp.data) {
          this.appointment = resp.data;
          this.initForm();
        }
      })
  }

  filterList($event: any) {
    if (!this.selectedDate) {
      this.getAppointments();
      return;
    }

    this.selectedDate.setHours(0, 0, 0);
    this.displayData = this.dataSet.filter(appointment => {
      const startDate = this.selectedDate;
      const startDatetime = startDate.getTime();

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      const endDatetime = endDate.getTime();

      return new Date(appointment.appointmentStartTime).getTime() >= startDatetime &&
        new Date(appointment.appointmentEndTime).getTime() <= endDatetime;
    });
  }

  private getAppointments() {
    this.isLoading = true;
    if (this.isAdmin) {
      this.getAllAppointments();
    } else {
      this.getUserAppointments();
    }
  }

  private getAllAppointments() {
    this.appointmentService.getAppointments()
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.dataSet = resp.data ? resp.data : [];
          this.displayData = [...this.dataSet];
        }
      }, error => {
        this.isLoading = false;
        this.notificationService.createErrorNotification("There\'s an error when retrieving appointments records.");
        console.log(error.error);
      })
  }

  private getUserAppointments() {
    this.appointmentService.getUserAppointment(this.user.username)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.dataSet = resp.data ? resp.data : [];
          this.displayData = [...this.dataSet];
        }
      }, error => {
        this.isLoading = false;
        this.notificationService.createErrorNotification("There\'s an error when retrieving appointments records.");
        console.log(error.error);
      })
  }

  cancelChangeDatetime() {
    this.dateTimeModalIsVisible = false;
  }

  changeDatetime() {
    const date = new Date(this.changeAppointmentDatetimeForm.controls['date'].value);
    const time = new Date(this.changeAppointmentDatetimeForm.controls['time'].value);
    date.setHours(time.getHours(), 0, 0, 0);

    const form = {
      appointmentId: this.appointment.appointmentId,
      datetime: date
    }

    this.appointmentService.updateAppointmentDatetime(form)
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.notificationService.createSuccessNotification("Successfully updated appointment's datetime.");
          this.changeAppointmentDatetimeForm.reset();
          this.dateTimeModalIsVisible = false;
          this.getAppointments();
        }
      }, error => {
        this.notificationService.createErrorNotification("There\'s an error when updating appointment's datetime");
        console.log(error.error);
      })
  }

  private initForm() {
    this.changeAppointmentDatetimeForm = this.fb.group({
      date: [null, [Validators.required]],
      time: [null, [Validators.required]]
    });
  }
}
