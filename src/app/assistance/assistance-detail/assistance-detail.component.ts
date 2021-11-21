import {Component, OnInit} from '@angular/core';
import {AssistanceService} from "../assistance.service";
import {ActivatedRoute} from "@angular/router";
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

@Component({
  selector: 'app-assistance-detail',
  templateUrl: './assistance-detail.component.html'
})
export class AssistanceDetailComponent implements OnInit {

  assistanceId: number;
  assistanceRecord: any;
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

  constructor(private assistanceService: AssistanceService,
              private notificationService: NotificationService,
              private route: ActivatedRoute,
              private location: Location,
              private authService: AuthService,
              private dropdownChoiceService: DropdownChoiceService,
              private fb: FormBuilder) {
    this.authService.user.subscribe(resp => {
      this.user = resp;
      this.isAdmin = this.authService.isAdminLoggedIn();
      this.isSuperAdmin = this.authService.hasRole(RoleConstant.ROLE_SUPER_ADMIN);
    })
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['assistanceId']) {
        this.assistanceId = params['assistanceId'];
        this.getAssistanceDetail();
      } else {
        this.location.back();
      }
    });
  }

  private getAssistanceDetail() {
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
        console.log(error.error);
      });
  }

  navigateToPreviousPage() {
    this.location.back();
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

  acceptRequest(assistanceId: number) {
    const form = {
      assistanceId: assistanceId
    };
    this.assistanceService.acceptAssistanceRequest(form).subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.notificationService.createSuccessNotification('Successfully accepted the assistance request [ID: ' + assistanceId + "].");
        this.getAssistanceDetail();
      }
    }, error => {
      const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when accepting assistance request.";
      this.notificationService.createErrorNotification(msg);
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
}
