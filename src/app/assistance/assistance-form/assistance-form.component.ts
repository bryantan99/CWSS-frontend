import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AssistanceService} from "../assistance.service";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {NotificationService} from "../../shared/services/notification.service";
import {DropdownChoiceModel} from "../../shared/models/dropdown-choice-model";
import {AuthService} from "../../auth/auth.service";
import {DropdownChoiceService} from "../../shared/services/dropdown-choice.service";
import {RoleConstant} from "../../shared/constants/role-constant";
import {User} from "../../shared/models/user";
import {differenceInCalendarDays, isWeekend} from "date-fns";
import {HolidayService} from "../../shared/services/holiday.service";
import {AssistanceRequestFormModel} from "../../shared/models/assistance-request-form-model";
import {EventData} from "../../shared/models/event-data";
import {EventBusService} from "../../shared/services/event-bus.service";

@Component({
  selector: 'app-assistance-form',
  templateUrl: './assistance-form.component.html'
})
export class AssistanceFormComponent implements OnInit {

  @Input() addToRequestPool: boolean = true;
  @Output() refreshListEventEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() modalIsVisibleEventEmitter: EventEmitter<any> = new EventEmitter<any>();
  nzTitle: string;
  form: FormGroup;
  COMMUNITY_USER_DROPDOWN: DropdownChoiceModel[] = [];
  CATEGORY_DROPDOWN: DropdownChoiceModel[] = [];
  user: User;
  isAdmin: boolean = false;
  isSuperAdmin: boolean = false;
  timeslotList: DropdownChoiceModel[] = [];
  disabledDate = (current: Date): boolean => differenceInCalendarDays(current, new Date()) <= 0 || isWeekend(current) || this.isPublicHoliday(current);
  private PUBLIC_HOLIDAY_DATE: Date[] = [];

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private assistanceService: AssistanceService,
              private dropdownChoiceService: DropdownChoiceService,
              private notificationService: NotificationService,
              private holidayService: HolidayService,
              private eventBusService: EventBusService) {
    this.authService.user.subscribe(resp => {
      this.user = resp;
    })
    this.isAdmin = this.authService.isAdminLoggedIn();
    this.isSuperAdmin = this.authService.hasRole(RoleConstant.ROLE_SUPER_ADMIN);
    this.getPublicHolidays();
  }

  ngOnInit(): void {
    this.initDropdownChoices();
    this.initForm();
  }

  submit() {
    for (const key in this.form.controls) {
      this.form.controls[key].markAsTouched();
      this.form.controls[key].markAsDirty();
      this.form.controls[key].updateValueAndValidity();
    }

    const form: AssistanceRequestFormModel = {
      assistanceTitle: this.form.controls['assistanceTitle'].value,
      assistanceDescription: this.form.controls['assistanceDescription'].value,
      categoryId: this.form.controls['categoryId'].value,
      username: this.form.controls['username'].value,
      adminUsername: this.form.controls['adminUsername'].value,
      appointmentStartDatetime: this.combineDatetime(),
    }

    if (this.form.valid) {
      this.assistanceService.addAssistance(form).subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.CREATED) {
          this.notificationService.createSuccessNotification("Created new assistance request.");
          this.refreshListEventEmitter.emit({refreshList: true});
          this.modalIsVisibleEventEmitter.emit({modalIsVisible: false});
        }
      }, error => {
        if (error.status === HttpStatusConstant.FORBIDDEN) {
          this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
          this.eventBusService.emit(new EventData('logout', null));
        } else {
          this.notificationService.createErrorNotification("There\'s an error when adding new assistance request.");
          console.log(error.error);
        }
      });
    }
  }

  private initDropdownChoices() {
    if (this.isAdmin) {
      this.initCommunityUserDropdownChoices();
      this.initCategoryDropdownChoices();
    }
  }

  private initCommunityUserDropdownChoices() {
    this.dropdownChoiceService.getCommunityUserDropdownChoices(true).subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.COMMUNITY_USER_DROPDOWN = resp.data ? resp.data : [];
      }
    }, error => {
      if (error.status === HttpStatusConstant.FORBIDDEN) {
        this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
        this.eventBusService.emit(new EventData('logout', null));
      } else {
        const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when retrieving community user's dropdown choice(s).";
        this.notificationService.createErrorNotification(msg);
      }
    })
  }

  private initCategoryDropdownChoices() {
    this.dropdownChoiceService.getAssistanceCategoryDropdown().subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.CATEGORY_DROPDOWN = resp.data ? resp.data : [];
      }
    }, error => {
      if (error.status === HttpStatusConstant.FORBIDDEN) {
        this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
        this.eventBusService.emit(new EventData('logout', null));
      } else {
        const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when retrieving assistance category dropdown choice(s).";
        this.notificationService.createErrorNotification(msg);
      }
    })
  }

  private initForm() {
    this.form = this.fb.group({
      assistanceTitle: ['', Validators.required],
      assistanceDescription: ['', Validators.required],
      categoryId: [''],
      username: [''],
      adminUsername: [''],
      date: [''],
      time: ['']
    });

    if (this.isAdmin) {
      if (!this.addToRequestPool) {
        this.form.patchValue({
          adminUsername: this.user.username
        });
      }
      this.form.controls['categoryId'].setValidators(Validators.required);
      this.form.controls['username'].setValidators(Validators.required);
    } else {
      this.form.patchValue({
        username: this.user.username
      });
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
    this.form.patchValue({
      time: null
    }, {emitEvent: false, onlySelf: true});

    const date = new Date(this.form.controls['date'].value);
    const adminUsername = this.form.controls['adminUsername'].value ? this.form.controls['adminUsername'].value : null;
    const username = !this.isAdmin ? this.user.username : null;
    this.dropdownChoiceService.getAppointmentTimeslotChoices(date, adminUsername, username).subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.timeslotList = resp.data ? resp.data : [];
      }
    }, error => {
      if (error.status === HttpStatusConstant.FORBIDDEN) {
        this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
        this.eventBusService.emit(new EventData('logout', null));
      } else {
        this.notificationService.createErrorNotification("There\'s an error when retrieving available timeslot.");
      }
    })
  }


  private combineDatetime(): Date {
    const date = new Date(this.form.controls['date'].value);
    const time = new Date(this.form.controls['time'].value);
    date.setHours(time.getHours(), 30, 0, 0);
    return date;
  }
}
