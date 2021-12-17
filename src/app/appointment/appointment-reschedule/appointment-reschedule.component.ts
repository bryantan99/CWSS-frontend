import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {DropdownChoiceService} from "../../shared/services/dropdown-choice.service";
import {NotificationService} from "../../shared/services/notification.service";
import {AuthService} from "../../auth/auth.service";
import {User} from "../../shared/models/user";
import {differenceInCalendarDays, isWeekend} from "date-fns";
import {HolidayService} from "../../shared/services/holiday.service";
import {AppointmentService} from "../appointment.service";

@Component({
  selector: 'app-appointment-reschedule',
  templateUrl: './appointment-reschedule.component.html'
})
export class AppointmentRescheduleComponent implements OnInit {

  @Input() appointment: any;
  @Input() assistanceId: number = null;
  @Input() isVisible: boolean = false;
  @Output() refreshListEventEmitter: EventEmitter<{refreshList: boolean}> = new EventEmitter<{refreshList: boolean}>();
  @Output() modalVisibilityHasChange: EventEmitter<{modalIsVisible: boolean}> = new EventEmitter<{modalIsVisible: boolean}>();
  modalIsVisible: boolean = false;
  changeAppointmentDatetimeForm: FormGroup;
  PUBLIC_HOLIDAY_DATE: Date[] = [];
  timeslotList: any[] = [];
  user: User;
  isAdmin: boolean = false;
  disabledDate = (current: Date): boolean => differenceInCalendarDays(current, new Date()) <= 0 || isWeekend(current) || this.isPublicHoliday(current);

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private appointmentService: AppointmentService,
              private holidayService: HolidayService,
              private dropdownChoiceService: DropdownChoiceService,
              private notificationService: NotificationService) {
    this.authService.user.subscribe(resp => {
      this.user = resp;
      this.isAdmin = this.authService.isAdminLoggedIn();
    });
    this.getPublicHolidays();
  }

  ngOnInit(): void {
    this.initForm();
  }

  openModal() {
    this.modalIsVisible = true;
  }

  private initForm() {
    this.changeAppointmentDatetimeForm = this.fb.group({
      date: [null, [Validators.required]],
      time: [null, [Validators.required]]
    });
  }

  initTimeSlotDropdownChoice() {
    this.changeAppointmentDatetimeForm.patchValue({
      time: null
    }, {emitEvent: false, onlySelf: true});

    const date = new Date(this.changeAppointmentDatetimeForm.controls['date'].value);
    const adminUsername = this.isAdmin ? this.user.username : null;
    const username = !this.isAdmin ? this.user.username : null;
    this.dropdownChoiceService.getAppointmentTimeslotChoices(date, adminUsername, username).subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.timeslotList = resp.data ? resp.data : [];
      }
    }, () => {
      this.notificationService.createErrorNotification("There\'s an error when retrieving available timeslot.");
    })
  }

  private isPublicHoliday(current: Date) {
    return this.PUBLIC_HOLIDAY_DATE.find(item => {
      return item.getTime() == current.getTime()
    }) != null;
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

  changeDatetime() {
    const date = new Date(this.changeAppointmentDatetimeForm.controls['date'].value);
    const time = new Date(this.changeAppointmentDatetimeForm.controls['time'].value);
    date.setHours(time.getHours(), 0, 0, 0);

    const form = {
      appointmentId: this.appointment.appointmentId,
      assistanceId: this.assistanceId ? this.assistanceId : null,
      appointmentLastUpdatedDate: this.appointment.lastUpdatedDate,
      datetime: date
    }

    this.appointmentService.updateAppointmentDatetime(form)
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.notificationService.createSuccessNotification("Successfully updated appointment's datetime.");
          this.changeAppointmentDatetimeForm.reset();
          this.modalIsVisible = false;
          this.closeModal();
          this.refreshAppointmentList();
        }
      }, error => {
        const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when updating appointment's datetime.";
        this.notificationService.createErrorNotification(msg);
      })
  }

  cancelChangeDatetime() {
    this.closeModal();
  }

  private refreshAppointmentList() {
    this.refreshListEventEmitter.emit({refreshList: true});
  }

  private closeModal() {
    this.modalIsVisible = false;
    this.modalVisibilityHasChange.emit({modalIsVisible: this.modalIsVisible});
  }
}
