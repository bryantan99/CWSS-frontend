import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
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

  refreshList() {
    this.refreshListEventEmitter.emit(true);
  }

  navigateToAssistanceDetailPage(assistanceId: number) {
    this.router.navigate(['/assistance/detail'], {queryParams: {assistanceId: assistanceId}});
  }
}
