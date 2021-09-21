import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DropdownConstant} from "../../../shared/constants/dropdown-constant";
import {uniqueEmailValidator, uniqueUsernameValidator} from "../../../shared/validators/custom-async-validator";
import {AuthService} from "../../../auth/auth.service";
import {phoneNumberValidator} from "../../../shared/validators/custom-validators";
import {NotificationService} from "../../../shared/services/notification.service";
import {AdminUserService} from "../../../shared/services/admin-user.service";
import {finalize} from "rxjs/operators";
import {HttpStatusConstant} from "../../../shared/constants/http-status-constant";

@Component({
  selector: 'app-admin-detail',
  templateUrl: './admin-detail.component.html'
})
export class AdminDetailComponent implements OnInit {
  @Input() isVisible: boolean;
  @Output() modalIsVisibleEmitter: EventEmitter<{ isVisible: boolean, refresh: boolean }> = new EventEmitter<{ isVisible: boolean, refresh: boolean }>();
  @Output() refreshListEmitter: EventEmitter<{ refreshList: boolean }> = new EventEmitter<{ refreshList: boolean }>();
  adminForm: FormGroup;
  isSubmitting: boolean = false;
  readonly roleChoices: { text: string, value: string }[] = DropdownConstant.ACCOUNT_ROLE_DROPDOWN;

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private notificationService: NotificationService,
              private adminService: AdminUserService) {
  }

  ngOnInit(): void {
    this.adminForm = this.fb.group({
      fullName: ["", Validators.required],
      username: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      contactNo: ["", [Validators.required, phoneNumberValidator()]],
      roleList: [null, Validators.required]
    });

    this.adminForm.controls["username"].setAsyncValidators(uniqueUsernameValidator(this.authService));
    this.adminForm.controls["email"].setAsyncValidators(uniqueEmailValidator(this.authService));
  }

  handleCancel() {
    this.closeModal(false);
  }

  handleOk() {
    if (this.adminForm.valid) {
      this.isSubmitting = true;
      this.adminService.addNewStaff(this.adminForm.value).pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      ).subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.notificationService.createSuccessNotification("New staff has been created.");
          this.closeModal(true);
        }
      }, error => {
        this.isSubmitting = false;
        this.notificationService.createErrorNotification("There\'s an error when adding new staff.");
      })
    }
  }

  private closeModal(refresh: boolean) {
    this.resetForm();
    this.modalIsVisibleEmitter.emit({isVisible: false, refresh: refresh});
  }

  resetForm(): void {
    this.adminForm.reset();
    for (const key in this.adminForm.controls) {
      if (this.adminForm.controls.hasOwnProperty(key)) {
        this.adminForm.controls[key].markAsPristine();
        this.adminForm.controls[key].updateValueAndValidity();
      }
    }
  }
}
