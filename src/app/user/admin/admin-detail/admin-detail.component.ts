import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DropdownConstant} from "../../../shared/constants/dropdown-constant";
import {uniqueUsernameValidator} from "../../../shared/validators/custom-async-validator";
import {AuthService} from "../../../auth/auth.service";
import {phoneNumberValidator} from "../../../shared/validators/custom-validators";
import {NotificationService} from "../../../shared/services/notification.service";
import {AdminUserService} from "../../../shared/services/admin-user.service";

@Component({
  selector: 'app-admin-detail',
  templateUrl: './admin-detail.component.html'
})
export class AdminDetailComponent implements OnInit {
  @Input() isVisible: boolean;
  @Output() modalIsVisibleEmitter: EventEmitter<{ isVisible: boolean, refresh: boolean}> = new EventEmitter<{ isVisible: boolean, refresh: boolean }>();
  @Output() refreshListEmitter: EventEmitter<{ refreshList: boolean }> = new EventEmitter<{ refreshList: boolean }>();
  adminForm: FormGroup;
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
  }

  handleCancel() {
    this.closeModal(false);
  }

  handleOk() {
    if (this.adminForm.valid) {
      this.adminService.addNewStaff(this.adminForm.value).subscribe(resp => {
        if (resp) {
          this.notificationService.createSuccessNotification("New staff has been created.");
          this.closeModal(true);
        }
      }, error => {
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
