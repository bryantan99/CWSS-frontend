import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {AppointmentService} from "../appointment.service";
import {NotificationService} from "../../shared/services/notification.service";
import {AuthService} from "../../auth/auth.service";
import {User} from "../../shared/models/user";
import {Router} from "@angular/router";

@Component({
  selector: 'app-appointment-table',
  templateUrl: './appointment-table.component.html'
})
export class AppointmentTableComponent implements OnInit {

  @Input() nzData: any[] = [];
  @Input() isLoading: boolean = false;
  @Input() showConfirmAppointmentButton: boolean = false;
  @Output() refreshListEventEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  pageIndex = 1;
  pageSize = 10;
  datetimeFilterIsVisible: boolean = false;
  selectedDate: Date = null;
  rescheduleDatetimeModalIsVisible: boolean = false;
  isAdmin: boolean = false;
  user: User;
  selectedAppointmentId: number | null = null;
  selectedAppointment: any;

  constructor(private appointmentService: AppointmentService,
              private notificationService: NotificationService,
              private authService: AuthService,
              private router: Router) {
    this.authService.user.subscribe(resp => {
      this.user = resp;
      this.isAdmin = this.authService.isAdminLoggedIn();
    })
  }

  ngOnInit(): void {
  }

  resetFilterByAppointmentDate() {
    this.selectedDate = null;
    this.filterByAppointmentDate();
  }

  filterByAppointmentDate() {
    this.datetimeFilterIsVisible = false;
    if (!this.selectedDate) {
      this.refreshList();
      return;
    }

    this.selectedDate.setHours(0, 0, 0);
    this.nzData = this.nzData.filter(appointment => {
      const startDate = this.selectedDate;
      const startDatetime = startDate.getTime();

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      const endDatetime = endDate.getTime();

      return new Date(appointment.appointmentStartTime).getTime() >= startDatetime &&
        new Date(appointment.appointmentEndTime).getTime() <= endDatetime;
    });
  }

  openDatetimeModal(appointmentId: number) {
    this.selectedAppointment = this.nzData.find(o => o.appointmentId === appointmentId);
    this.rescheduleDatetimeModalIsVisible = true;
  }

  cancelAppointment(appointmentId: any) {
    this.appointmentService.cancelAppointment(appointmentId)
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.notificationService.createSuccessNotification("Successfully cancelled appointment.");
          this.refreshList();
        }
      })
  }

  confirmAppointment(appointmentId: number, appointmentLastUpdatedDate: Date) {
    const form = {
      appointmentId: appointmentId,
      appointmentLastUpdatedDate: appointmentLastUpdatedDate
    };

    this.appointmentService.confirmAppointment(form).subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.notificationService.createSuccessNotification("Successfully confirmed appointment.")
        this.refreshList();
      }
    }, error => {
      const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when confirming appointment's datetime.";
      this.notificationService.createErrorNotification(msg);
    })
  }

  refreshList() {
    this.refreshListEventEmitter.emit(true);
  }

  modalVisibilityHasChange(data: {modalIsVisible: boolean}) {
    this.rescheduleDatetimeModalIsVisible = data.modalIsVisible;
  }

  navigateToAssistanceDetailPage(assistanceId: number) {
    this.router.navigate(['/assistance/detail'], {queryParams: {assistanceId: assistanceId}});
  }
}
