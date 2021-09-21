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

@Component({
  selector: 'app-assistance-detail',
  templateUrl: './assistance-detail.component.html'
})
export class AssistanceDetailComponent implements OnInit {

  assistanceId: number;
  assistanceRecord: any;
  isLoading: boolean = false;
  isAdmin: boolean = false;
  commentDrawerIsVisible: boolean = false;
  nzEdit: boolean = false;
  adminChoices: DropdownChoiceModel[] = [];
  form: FormGroup;
  isSubmitting: boolean = false;

  constructor(private assistanceService: AssistanceService,
              private notificationService: NotificationService,
              private route: ActivatedRoute,
              private location: Location,
              private authService: AuthService,
              private dropdownChoiceService: DropdownChoiceService,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['assistanceId']) {
        this.assistanceId = params['assistanceId'];
        this.initForm();
        this.getAssistanceDetail();
      } else {
        this.location.back();
      }
    });
    this.isAdmin = this.authService.isAdminLoggedIn();
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
    this.nzEdit = true;
    this.patchForm();
    this.dropdownChoiceService.getAdminDropdownChoices().subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.adminChoices = resp.data ? resp.data : [];
      }
    }, error => {
      this.notificationService.createErrorNotification("There\'s an error when retrieving person-in-charge dropdown choices list.");
      console.log(error.error);
    })
  }

  private initForm() {
    this.form = this.fb.group({
      assistanceId: [this.assistanceId, Validators.required],
      status: ['', Validators.required],
      personInCharge: ['']
    });
  }

  cancelEdit() {
    this.nzEdit = false;
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
          this.nzEdit = false;
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
      status: this.assistanceRecord.assistanceStatus,
      personInCharge: this.assistanceRecord.adminBean ? this.assistanceRecord.adminBean.username : ""
    });
  }
}
