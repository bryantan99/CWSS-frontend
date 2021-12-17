import {Component, OnInit} from '@angular/core';
import {AssistanceService} from "../assistance.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {NotificationService} from "../../shared/services/notification.service";
import {finalize} from "rxjs/operators";
import {AuthService} from "../../auth/auth.service";
import {DropdownChoiceModel} from "../../shared/models/dropdown-choice-model";
import {DropdownChoiceService} from "../../shared/services/dropdown-choice.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {GeneralConstant} from "../../shared/constants/general-constant";
import {User} from "../../shared/models/user";
import {RoleConstant} from "../../shared/constants/role-constant";
import {DropdownConstant} from "../../shared/constants/dropdown-constant";
import {AppointmentService} from "../../appointment/appointment.service";
import {ConfirmationFormModel} from "../../shared/models/confirmation-form-model";
import {AssistanceModel} from "../../shared/models/assistance-model";

@Component({
  selector: 'app-assistance-detail',
  templateUrl: './assistance-detail.component.html'
})
export class AssistanceDetailComponent implements OnInit {

  assistanceId: number;
  assistanceRecord: AssistanceModel;
  isLoading: boolean = false;
  user: User;
  isAdmin: boolean = false;
  isSuperAdmin: boolean;
  commentDrawerIsVisible: boolean = false;
  nzEditForAdmin: boolean = false;
  nzEditForCommunityUser: boolean = false;
  adminChoices: DropdownChoiceModel[] = [];
  form: FormGroup;
  isSubmitting: boolean = false;
  readonly DATE_FORMAT = GeneralConstant.NZ_DATE_FORMAT;
  readonly ASSISTANCE_REQUEST_STATUS_DROPDOWN = DropdownConstant.ASSISTANCE_STATUS_DROPDOWN;
  CATEGORY_DROPDOWN: DropdownChoiceModel[] = [];
  rejectRequestModalIsVisible: boolean = false;
  rejectForm: FormGroup;
  rescheduleDatetimeModalIsVisible: boolean = false;
  selectedAppointment: any;
  appointmentStatusModalIsVisible: boolean = false;
  requestDecisionForm: FormGroup;
  updateAppointmentAndAssistanceStatusIsLoading: boolean = false;

  constructor(private assistanceService: AssistanceService,
              private notificationService: NotificationService,
              private route: ActivatedRoute,
              private router: Router,
              private location: Location,
              private authService: AuthService,
              private dropdownChoiceService: DropdownChoiceService,
              private appointmentService: AppointmentService,
              private fb: FormBuilder) {
    this.authService.user.subscribe(resp => {
      this.user = resp;
      this.isAdmin = this.authService.isAdminLoggedIn();
      this.isSuperAdmin = this.authService.hasRole(RoleConstant.ROLE_SUPER_ADMIN);
    })
  }

  ngOnInit(): void {
    this.initForm();
    this.route.queryParams.subscribe(params => {
      if (params['assistanceId']) {
        this.assistanceId = params['assistanceId'];
        this.getAssistanceDetail();
      } else {
        this.location.back();
      }
    });
  }

  getAssistanceDetail() {
    this.isLoading = true;
    this.assistanceService.findAssistanceRecordDetail(this.assistanceId)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK && resp.data) {
          this.assistanceRecord = resp.data;
        }
      }, error => {
        this.isLoading = false;
        this.notificationService.createErrorNotification("There\'s an error when retrieving assistance record detail.");
        if (error.error && error.error.status === HttpStatusConstant.NOT_FOUND) {
          this.router.navigate(['/assistance']);
        }
      });
  }

  deleteRec(assistanceId: any) {
    this.assistanceService.deleteRec(assistanceId).subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.notificationService.createSuccessNotification("Assistance request ID : " + assistanceId + " has been deleted.");
        this.location.back();
      }
    }, error => {
      this.notificationService.createErrorNotification("There\'s an error when deleting assistance request.");
      console.log(error.error);
    })
  }

  closeCommentDrawer() {
    this.commentDrawerIsVisible = false;
  }

  openCommentDrawer() {
    this.commentDrawerIsVisible = true;
  }

  onEditMode() {
    this.initForm();
    this.patchForm();
    if (this.isAdmin) {
      this.nzEditForAdmin = true;
    } else {
      this.nzEditForCommunityUser = true;
    }
    this.initDropdownChoices();
  }

  private initForm() {
    this.form = this.fb.group({
      assistanceId: [this.assistanceId, Validators.required],
      categoryId: [''],
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      status: ['', [Validators.required]],
      personInCharge: ['', [Validators.required]]
    });
  }

  cancelEdit() {
    this.nzEditForCommunityUser = this.nzEditForAdmin = false;
    this.form.reset();
  }

  submit() {
    for (const key in this.form.controls) {
      this.form.controls[key].markAsTouched();
      this.form.controls[key].markAsDirty();
      this.form.controls[key].updateValueAndValidity();
    }

    if (!this.form.valid) {
      this.notificationService.createErrorNotification("Form is invalid.");
      return;
    }

    this.isSubmitting = true;
    this.assistanceService.updateRecord(this.form.value)
      .pipe(finalize(() => {
        this.isSubmitting = false;
      }))
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.notificationService.createSuccessNotification("Successfully updated assistance request ID: " + this.assistanceId + ".");
          this.cancelEdit();
          this.getAssistanceDetail();
        }
      }, error => {
        this.isSubmitting = false;
        this.notificationService.createErrorNotification("There\'s an error when updating record.");
        console.log(error.error);
      });
  }

  private patchForm() {
    this.form.patchValue({
      assistanceId: this.assistanceId,
      categoryId: this.assistanceRecord.categoryId ? this.assistanceRecord.categoryId.toString(10) : "",
      title: this.assistanceRecord.title,
      description: this.assistanceRecord.description,
      status: this.assistanceRecord.status,
      personInCharge: this.assistanceRecord.adminUsername ? this.assistanceRecord.adminUsername : ""
    });
  }

  openRejectAssistanceModal() {
    this.initRejectForm();
    this.rejectRequestModalIsVisible = true;
  }

  closeRejectAssistanceModal() {
    this.rejectRequestModalIsVisible = false;
  }

  initRejectForm() {
    this.rejectForm = this.fb.group({
      assistanceId: [this.assistanceId, [Validators.required]],
      reason: ['', [Validators.required]]
    });
  }

  submitRejectForm() {
    this.assistanceService.rejectAssistance(this.rejectForm.value).subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.notificationService.createSuccessNotification("Successfully reject assistance request [ID: " + this.rejectForm.controls['assistanceId'].value + "]. Reason is added as a comment.");
        this.closeRejectAssistanceModal();
        this.getAssistanceDetail();
      }
    }, error => {
      const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when rejecting assistance request.";
      this.notificationService.createErrorNotification(msg);
    })
  }

  private initDropdownChoices() {
    this.initAdminDropdownChoices();
    this.initCategoryDropdownChoices();
  }

  private initAdminDropdownChoices() {
    this.dropdownChoiceService.getAdminDropdownChoices().subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.adminChoices = resp.data ? resp.data : [];
      }
    }, error => {
      this.notificationService.createErrorNotification("There\'s an error when retrieving person-in-charge dropdown choices list.");
      console.log(error.error);
    })
  }

  private initCategoryDropdownChoices() {
    this.dropdownChoiceService.getAssistanceCategoryDropdown().subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.CATEGORY_DROPDOWN = resp.data ? resp.data : [];
      }
    }, error => {
      const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when retrieving person-in-charge dropdown choices list.";
      this.notificationService.createErrorNotification(msg);
    })
  }

  cancelReschedule() {
    this.rescheduleDatetimeModalIsVisible = false;
  }

  openRescheduleModel() {
    this.appointmentService.getAppointment(this.assistanceRecord.appointmentModel.appointmentId).subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.selectedAppointment = resp.data;
        this.rescheduleDatetimeModalIsVisible = true;
      }
    });
  }

  acceptAppointment(appointmentId: any) {
    const form: ConfirmationFormModel = {
      appointmentId: appointmentId,
      assistanceId: this.assistanceId,
      appointmentLastUpdatedDate: this.assistanceRecord.appointmentModel.lastUpdatedDate
    };

    this.appointmentService.confirmAppointment(form).subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.notificationService.createSuccessNotification("Successfully confirmed the appointment.");
        this.getAssistanceDetail();
      }
    }, error => {
      const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when confirming appointment.";
      this.notificationService.createErrorNotification(msg);
    })
  }

  modalVisibilityHasChange(data: { modalIsVisible: boolean }) {
    this.rescheduleDatetimeModalIsVisible = data.modalIsVisible;
  }

  openUpdateAppointmentStatusModal() {
    this.initDecisionRequestForm();
    this.appointmentStatusModalIsVisible = true;
  }

  private initDecisionRequestForm() {
    this.requestDecisionForm = this.fb.group({
      appointmentId: [this.assistanceRecord.appointmentModel.appointmentId, [Validators.required]],
      appointmentStatus: ['', [Validators.required]],
      assistanceId: [this.assistanceId, [Validators.required]],
      assistanceStatus: [{
        value: '',
        disabled: true
      }, [Validators.required]],
      reason: [{
        value: '',
        disabled: true
      }, [Validators.required]]
    });
  }

  appointmentStatusHasChange() {
    const value = this.requestDecisionForm.controls['appointmentStatus'].value;
    if (value === 'completed') {
      this.requestDecisionForm.patchValue({
        assistanceStatus: ''
      });
      this.requestDecisionForm.controls['assistanceStatus'].enable();
      this.requestDecisionForm.controls['reason'].enable();
    } else {
      this.requestDecisionForm.patchValue({
        assistanceStatus: 'cancelled',
        reason: ''
      });
      this.requestDecisionForm.controls['assistanceStatus'].disable();
      this.requestDecisionForm.controls['reason'].disable();
    }
  }

  closeRequestDecisionModal() {
    this.appointmentStatusModalIsVisible = false;
  }

  updateAppointmentAndAssistanceStatus() {
    Object.keys(this.requestDecisionForm.controls).forEach(key => {
      this.requestDecisionForm.controls[key].markAsDirty();
      this.requestDecisionForm.controls[key].markAsTouched();
      this.requestDecisionForm.controls[key].updateValueAndValidity();
    });

    if (this.requestDecisionForm.valid) {
      this.appointmentService.updateAppointmentStatus(this.requestDecisionForm.value).subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.notificationService.createSuccessNotification("Successfully updated appointment status and assistance status.");
          this.closeRequestDecisionModal();
          this.getAssistanceDetail();
        }
      }, error => {
        const msg = error && error.error && error.error.message ? error.error.message : 'There\'s an error when updating appointment status and assistance status.';
        this.notificationService.createErrorNotification(msg);
      })
    }
  }
}
