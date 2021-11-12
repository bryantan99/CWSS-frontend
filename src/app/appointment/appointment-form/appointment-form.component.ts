import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AppointmentService} from "../appointment.service";
import {DropdownChoiceService} from "../../shared/services/dropdown-choice.service";
import {DropdownChoiceModel} from "../../shared/models/dropdown-choice-model";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {NotificationService} from "../../shared/services/notification.service";
import {differenceInCalendarDays, isWeekend} from 'date-fns';
import {finalize} from "rxjs/operators";
import {User} from "../../shared/models/user";
import {HolidayService} from "../../shared/services/holiday.service";

@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html'
})
export class AppointmentFormComponent implements OnInit {

  @Input() user: User;
  @Input() isAdmin: boolean = false;
  @Output() formValidityEventEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() isSubmittingEventEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() isSubmittedSuccessfullyEventEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  form: FormGroup;
  userChoice: DropdownChoiceModel[] = [];
  adminChoice: DropdownChoiceModel[] = [];
  disabledDate = (current: Date): boolean => differenceInCalendarDays(current, new Date()) <= 0 || isWeekend(current) || this.isPublicHoliday(current);

  private isPublicHoliday(current: Date) {
    return this.PUBLIC_HOLIDAY_DATE.find(item => {return item.getTime() == current.getTime()}) != null;
  }

  isSubmitting: boolean = false;
  timeslotList: DropdownChoiceModel[] = [];
  PUBLIC_HOLIDAY_DATE: Date[] = [];

  constructor(private fb: FormBuilder,
              private appointmentService: AppointmentService,
              private dropdownChoiceService: DropdownChoiceService,
              private notificationService: NotificationService,
              private holidayService: HolidayService) {
    this.getPublicHolidays();
  }

  ngOnInit(): void {
    this.initDropdownChoice();
    this.initForm();
    this.form.statusChanges.subscribe((status: string) => {
      this.formValidityEventEmitter.emit(status === "VALID");
    });
  }

  private initForm() {
    this.form = this.fb.group({
      date: [null, [Validators.required]],
      time: [null, [Validators.required]],
      purpose: ['', [Validators.required]],
      username: [''],
      adminUsername: ['']
    });

    if (this.isAdmin) {
      this.form.controls['username'].setValidators([Validators.required]);
      this.form.patchValue({
        adminUsername: this.user.username
      });
    } else {
      this.form.patchValue({
        username: this.user.username
      });
    }
  }

  private initDropdownChoice() {
    if (this.isAdmin) {
      this.initUserDropdownChoice();
    } else {
      this.initAdminDropdownChoice();
    }
  }

  private initAdminDropdownChoice() {
    this.dropdownChoiceService.getAdminDropdownChoices().subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.adminChoice = resp.data ? resp.data : [];
      }
    }, error => {
      this.adminChoice = [];
      this.notificationService.createErrorNotification("There\'s an error when retrieving admin dropdown choices.");
      console.log(error.error);
    });
  }

  private initUserDropdownChoice() {
    this.dropdownChoiceService.getCommunityUserDropdownChoices().subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.userChoice = resp.data ? resp.data : [];
      }
    }, error => {
      this.userChoice = [];
      this.notificationService.createErrorNotification("There\'s an error when retrieving community user dropdown choices.");
      console.log(error.error);
    })
  }

  submitForm() {
    this.changeIsSubmitting(true);

    const datetime = this.combineDatetime();

    const form = {
      datetime: datetime,
      purpose: this.form.controls['purpose'].value,
      username: this.form.controls['username'].value ? this.form.controls['username'].value : null,
      adminUsername: this.form.controls['adminUsername'].value ? this.form.controls['adminUsername'].value : null,
      createdBy: this.user.username
    }

    this.appointmentService.scheduleAppointment(form)
      .pipe(finalize(() => {
        this.changeIsSubmitting(false);
      }))
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.form.reset();
          const statusMsg = "Successfully scheduled an appointment. Pending confirmation from " + (this.isAdmin ? 'user.' : 'admin');
          this.notificationService.createSuccessNotification(statusMsg);
          this.isSubmittedSuccessfullyEventEmitter.emit(true);
        }
      }, error => {
        this.changeIsSubmitting(false);
        this.notificationService.createErrorNotification("There\'s an error when scheduling an appointment.");
        console.log(error);
      })
  }

  private changeIsSubmitting(status: boolean) {
    this.isSubmitting = status;
    this.isSubmittingEventEmitter.emit(this.isSubmitting);
  }

  private combineDatetime(): Date {
    const date = new Date(this.form.controls['date'].value);
    const time = new Date(this.form.controls['time'].value);
    date.setHours(time.getHours(), 30, 0, 0);
    return date;
  }

  initTimeSlotDropdownChoice() {
    this.form.patchValue({
      time: null
    }, {emitEvent: false, onlySelf: true});

    const date = new Date(this.form.controls['date'].value);
    const adminUsername = this.form.controls['adminUsername'].value ? this.form.controls['adminUsername'].value : null;
    this.dropdownChoiceService.getAppointmentTimeslotChoices(date, adminUsername).subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.timeslotList = resp.data ? resp.data : [];
      }
    }, error => {
      this.notificationService.createErrorNotification("There\'s an error when retrieving available timeslot.");
    })
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
}
