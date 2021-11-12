import {Component, OnInit, ViewChild} from '@angular/core';
import {AppointmentService} from "../appointment.service";
import {AuthService} from "../../auth/auth.service";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {User} from "../../shared/models/user";
import {NotificationService} from "../../shared/services/notification.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {finalize} from "rxjs/operators";
import {TableColumnItemModel} from "../../shared/models/table-column-item-model";
import {AppointmentFormComponent} from "../appointment-form/appointment-form.component";
import {GeneralConstant} from "../../shared/constants/general-constant";
import {differenceInCalendarDays, isWeekend} from "date-fns";
import {HolidayService} from "../../shared/services/holiday.service";
import {DropdownChoiceService} from "../../shared/services/dropdown-choice.service";

@Component({
  selector: 'app-appointment-mngmt',
  templateUrl: './appointment-mngmt.component.html'
})
export class AppointmentMngmtComponent implements OnInit {
  @ViewChild(AppointmentFormComponent) appointmentFormComponent: AppointmentFormComponent;

  dataSet: any[] = [];
  displayData: any[] = [];
  pageIndex = 1;
  pageSize = 10;
  selectedDate: Date = null;

  user: User;
  isAdmin: boolean;
  dateTimeModalIsVisible: boolean = false;

  changeAppointmentDatetimeForm: FormGroup;
  appointment;
  isLoading: boolean = false;
  datetimeFilterIsVisible: false;
  appointmentStatusColumnItem: TableColumnItemModel = {
    listOfFilter: [
      {text: 'Pending User', value: 'pending_user'},
      {text: 'Pending Admin', value: 'pending_admin'},
      {text: 'Confirmed', value: 'confirmed'},
      {text: 'Completed', value: 'completed'},
      {text: 'Cancelled', value: 'cancelled'},
    ],
    filterFn: (list: string[], item: any) => list.some(status => item.appointmentStatus.indexOf(status) !== -1)
  };
  appointmentModalIsVisible: boolean = false;
  formIsValid: boolean = false;
  isSubmitting: boolean = false;
  readonly DATE_FORMAT = GeneralConstant.NZ_DATE_FORMAT;
  filterForm: FormGroup;

  disabledDate = (current: Date): boolean => differenceInCalendarDays(current, new Date()) <= 0 || isWeekend(current) || this.isPublicHoliday(current);
  PUBLIC_HOLIDAY_DATE: Date[] = [];
  private timeslotList: any;

  constructor(private appointmentService: AppointmentService,
              private authService: AuthService,
              private notificationService: NotificationService,
              private holidayService: HolidayService,
              private dropdownChoiceService: DropdownChoiceService,
              private fb: FormBuilder) {
    this.authService.user.subscribe(resp => {
      this.user = resp;
      this.isAdmin = this.authService.isAdminLoggedIn();
    });
    this.getPublicHolidays();
  }

  ngOnInit(): void {
    this.initFilterForm();
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

  filterByAppointmentDate() {
    this.datetimeFilterIsVisible = false;
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

  confirmAppointment(appointmentId: number) {
    const form = {
      appointmentId: appointmentId
    };

    this.appointmentService.confirmAppointment(form).subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.notificationService.createSuccessNotification("Successfully confirmed appointment.")
        this.getAppointments();
      }
    }, error => {
      this.notificationService.createErrorNotification("There\'s an error when confirming appointment's datetime.");
      console.log(error.error);
    })
  }

  resetFilterByAppointmentDate() {
    this.selectedDate = null;
    this.filterByAppointmentDate();
  }

  openAppointmentModal() {
    this.appointmentModalIsVisible = true;
  }

  cancelScheduleAppointment() {
    this.appointmentModalIsVisible = false;
  }

  formValidityHasChanges(data: boolean) {
    this.formIsValid = data;
  }

  scheduleAppointment() {
    this.appointmentFormComponent.submitForm();
  }

  isSubmittingHasChanges(data: boolean) {
    this.isSubmitting = data;
  }

  closeModalAndRefreshList(data: boolean) {
    if (data) {
      this.appointmentModalIsVisible = false;
      this.getAppointments();
    }
  }

  private initFilterForm() {
    this.filterForm = this.fb.group({
      appointmentId: ['']
    });
  }

  filterByAppointmentId() {
    const appointmentId = this.filterForm.controls['appointmentId'].value ? this.filterForm.controls['appointmentId'].value : null;
    if (appointmentId) {
      this.displayData = this.dataSet.filter(obj => obj.appointmentId === parseInt(appointmentId));
    } else {
      this.displayData = [...this.dataSet];
    }
  }

  private isPublicHoliday(current: Date) {
    return this.PUBLIC_HOLIDAY_DATE.find(item => {return item.getTime() == current.getTime()}) != null;
  }

  private getPublicHolidays() {
    this.PUBLIC_HOLIDAY_DATE = [];
    this.holidayService.getHoliday().subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        const temp = resp.data ? resp.data : [];
        temp.forEach(date => {
          this.PUBLIC_HOLIDAY_DATE.push(new Date(date));
        })
      }
    })
  }

  initTimeSlotDropdownChoice() {
    this.changeAppointmentDatetimeForm.patchValue({
      time: null
    }, {emitEvent: false, onlySelf: true});

    const date = new Date(this.changeAppointmentDatetimeForm.controls['date'].value);
    const adminUsername = this.isAdmin ? this.user.username : null;
    this.dropdownChoiceService.getAppointmentTimeslotChoices(date, adminUsername).subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.timeslotList = resp.data ? resp.data : [];
      }
    }, error => {
      this.notificationService.createErrorNotification("There\'s an error when retrieving available timeslot.");
    })
  }
}
