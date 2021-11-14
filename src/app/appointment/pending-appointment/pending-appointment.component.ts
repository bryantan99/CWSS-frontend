import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {AppointmentService} from "../appointment.service";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {NotificationService} from "../../shared/services/notification.service";
import {finalize} from "rxjs/operators";

@Component({
  selector: 'app-pending-appointment',
  templateUrl: './pending-appointment.component.html'
})
export class PendingAppointmentComponent implements OnInit {
  filterForm: FormGroup;
  appointmentList: any[] = [];
  isLoading: boolean = false;
  filterDrawerIsVisible: boolean = false;

  constructor(private fb: FormBuilder,
              private appointmentService: AppointmentService,
              private notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.initFilterForm();
    this.getPendingAppointments();
  }

  private initFilterForm() {
    this.filterForm = this.fb.group({
      appointmentId: ['']
    });
  }

  resetFilterSettings() {
    this.initFilterForm();
    this.getPendingAppointments();
  }

  getPendingAppointments() {
    this.isLoading = true;
    this.appointmentService.getPendingAppointments(this.filterForm.controls['appointmentId'].value)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.closeFilterDrawer();
      }))
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.appointmentList = resp.data;
        }
      }, () => {
        this.isLoading = false;
        this.notificationService.createErrorNotification("There\'s an error when retrieving pending appointment request(s).");
      })
  }

  refreshList(data: any) {
    if (data) {
      this.getPendingAppointments();
    }
  }

  openFilterDrawer() {
    this.filterDrawerIsVisible = true;
  }

  closeFilterDrawer() {
    this.filterDrawerIsVisible = false;
  }
}
