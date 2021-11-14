import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {AppointmentService} from "../appointment.service";
import {finalize} from "rxjs/operators";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {AuthService} from "../../auth/auth.service";
import {User} from "../../shared/models/user";
import {NotificationService} from "../../shared/services/notification.service";
import {DropdownChoiceModel} from "../../shared/models/dropdown-choice-model";
import {DropdownConstant} from "../../shared/constants/dropdown-constant";
import {AppointmentFormComponent} from "../appointment-form/appointment-form.component";

@Component({
  selector: 'app-my-appointment',
  templateUrl: './my-appointment.component.html'
})
export class MyAppointmentComponent implements OnInit {

  @ViewChild(AppointmentFormComponent) appointmentFormComponent: AppointmentFormComponent;
  filterForm: FormGroup;
  appointmentList: any[] = []
  isLoading: boolean = false;
  user: User;
  isAdmin: boolean = false;
  STATUS_DROPDOWN: DropdownChoiceModel[] = DropdownConstant.APPOINTMENT_STATUS_DROPDOWN;
  filterDrawerIsVisible: boolean = false;
  appointmentModalIsVisible: boolean = false;
  formIsValid: boolean = false;
  isSubmitting: boolean = false;

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private appointmentService: AppointmentService,
              private notificationService: NotificationService) {
    this.authService.user.subscribe(resp => {
      this.user = resp;
      this.isAdmin = this.authService.isAdminLoggedIn();
    })
  }

  ngOnInit(): void {
    this.initFilterForm();
    this.getLoggedInUserAppointments();
  }

  private initFilterForm() {
    this.filterForm = this.fb.group({
      appointmentId: [''],
      status: ['A']
    });
  }

  resetFilterSettings() {
    this.initFilterForm();
    this.getLoggedInUserAppointments();
  }

  getLoggedInUserAppointments() {
    this.isLoading = true;
    this.appointmentService.getLoggedInUserAppointment(this.filterForm.controls['appointmentId'].value, this.filterForm.controls['status'].value)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.appointmentList = resp.data;
        }
      }, () => {
        this.isLoading = false;
        this.notificationService.createErrorNotification("There\'s an error when retrieving confirmed appointment(s).");
      })
  }

  openFilterDrawer() {
    this.filterDrawerIsVisible = true;
  }

  closeFilterDrawer() {
    this.filterDrawerIsVisible = false;
  }

  openAppointmentModal() {
    this.appointmentModalIsVisible = true;
  }

  cancelScheduleAppointment() {
    this.appointmentModalIsVisible = false;
  }

  scheduleAppointment() {
    this.appointmentFormComponent.submitForm();
  }

  formValidityHasChanges(data: boolean) {
    this.formIsValid = data;
  }

  isSubmittingHasChanges(data: boolean) {
    this.isSubmitting = data;
  }

  closeModalAndRefreshList(data: boolean) {
    if (data) {
      this.appointmentModalIsVisible = false;
      this.getLoggedInUserAppointments();
    }
  }

  refreshList(data: boolean) {
    if (data) {
      this.getLoggedInUserAppointments();
    }
  }
}
