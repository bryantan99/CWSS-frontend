import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {passwordValidator} from "../../shared/validators/custom-validators";
import {User} from "../../shared/models/user";
import {AuthService} from "../../auth/auth.service";
import {PasswordResetService} from "../../shared/services/password-reset.service";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {NotificationService} from "../../shared/services/notification.service";

@Component({
  selector: 'app-account-setting',
  templateUrl: './account-setting.component.html'
})
export class AccountSettingComponent implements OnInit {

  passwordForm: FormGroup;
  user: User;
  newPasswordIsVisible: boolean = false;
  confirmPasswordIsVisible: boolean = false;
  oldPasswordIsVisible: boolean = false;

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private passwordResetService: PasswordResetService,
              private notificationService: NotificationService) {
    this.authService.user.subscribe(resp => {
      this.user = resp;
    });
    this.initPasswordForm();
  }

  get oldPasswordFormControl(): FormControl {
    return this.passwordForm.controls['oldPassword'] as FormControl;
  }

  get newPasswordFormControl(): FormControl {
    return this.passwordForm.controls['newPassword'] as FormControl;
  }

  get confirmPasswordFormControl(): FormControl {
    return this.passwordForm.controls['confirmPassword'] as FormControl;
  }

  ngOnInit(): void {
  }

  private initPasswordForm() {
    this.passwordForm = this.fb.group({
      username: this.fb.control(this.user.username, [Validators.required]),
      oldPassword: this.fb.control('', [Validators.required]),
      newPassword: this.fb.control('', [Validators.required, passwordValidator()]),
      confirmPassword: this.fb.control('', [Validators.required])
    });
  }

  updatePassword() {
    this.oldPasswordFormControl.setErrors(null);
    if (this.passwordForm.valid) {
      this.passwordResetService.changePassword(this.passwordForm.value)
        .subscribe(resp => {
            if (resp && resp.status === HttpStatusConstant.OK) {
              this.notificationService.createSuccessNotification("Successfully updated password.");
              this.initPasswordForm();
            }
        }, error => {
          this.notificationService.createErrorNotification("There\'s an error when updating new password.");
          if (error.status === HttpStatusConstant.UNAUTHORIZED) {
            this.oldPasswordFormControl.setErrors({mismatch: true});
          }
        })
    }
  }

  matchPassword() {
    this.confirmPasswordFormControl.setErrors(null);
    const passwordValue = this.newPasswordFormControl.value;
    const confirmPasswordValue = this.confirmPasswordFormControl.value;
    if (passwordValue && confirmPasswordValue && passwordValue !== confirmPasswordValue) {
      this.confirmPasswordFormControl.setErrors({passwordMismatch: true})
    }
  }
}
