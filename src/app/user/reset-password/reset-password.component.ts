import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {NotificationService} from "../../shared/services/notification.service";
import {PasswordResetService} from "../../shared/services/password-reset.service";
import {finalize} from "rxjs/operators";
import {Router} from "@angular/router";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {passwordValidator} from "../../shared/validators/custom-validators";
import {AuthService} from "../../auth/auth.service";
import {User} from "../../shared/models/user";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {

  resetForm: FormGroup;

  passwordIsVisible: boolean = false;
  submitted: boolean = false;
  currentStep: number;
  otpIsValid: boolean = false;
  user: User;

  constructor(private fb: FormBuilder,
              private notificationService: NotificationService,
              private passwordResetService: PasswordResetService,
              private router: Router,
              private authService: AuthService) {
    this.authService.user.subscribe(resp => {
      this.user = resp;
      if (this.user) {
        this.router.navigate(['/']);
      }
    })
  }

  get usernameFormControl() {
    return this.resetForm.get('username') as FormControl;
  }

  get otpFormControl() {
    return this.resetForm.get('otp') as FormControl;
  }

  get passwordFormControl() {
    return this.resetForm.get('password') as FormControl;
  }

  get confirmPasswordFormControl() {
    return this.resetForm.get("confirmPassword") as FormControl;
  }

  ngOnInit(): void {
    this.currentStep = 0;

    this.resetForm = this.fb.group({
      username: ['', [Validators.required]],
      otp: ['', Validators.required],
      password: ['', [Validators.required, passwordValidator()]],
      confirmPassword: ['', Validators.required]
    });

    this.confirmPasswordFormControl.setValidators([Validators.required]);
  }

  requestPasswordReset() {
    this.passwordResetService.requestPasswordReset(this.usernameFormControl.value).subscribe(resp => {
      if (resp) {
        if (resp.status === HttpStatusConstant.OK) {
          this.currentStep = this.currentStep + 1;
        } else {
          this.notificationService.createErrorNotification(resp.message);
        }
      }
    }, error => {
      this.notificationService.createErrorNotification(error.error);
    })
  }

  validateOtp() {
    //  Send request to backend
    const obj = {
      username: this.usernameFormControl.value,
      otp: this.otpFormControl.value
    }

    this.passwordResetService.validateOtp(obj).subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        if (resp.data === true) {
          this.otpIsValid = resp.data;
          this.otpFormControl.setErrors(null);
          this.currentStep = this.currentStep + 1;
        } else {
          this.otpIsValid = false;
          this.otpFormControl.setErrors({mismatch: true});
        }
      }
    }, () => {
      this.notificationService.createErrorNotification("There\'s an error when requesting for password reset.");
    })
  }

  resetPassword() {
    for (const key in this.resetForm.controls) {
      this.resetForm.controls[key].markAsDirty();
      this.resetForm.controls[key].markAsTouched();
      this.resetForm.controls[key].updateValueAndValidity();
    }

    if (this.resetForm.valid) {
      this.submitted = true;
      this.passwordResetService.resetPassword(this.resetForm.value)
        .pipe(finalize(() => {
          this.submitted = false;
        }))
        .subscribe(resp => {
          if (resp && resp.data && resp.status === HttpStatusConstant.OK) {
            this.notificationService.createSuccessNotification("Your password has been reset and you may login with your new password now.");
            this.router.navigate(['login']);
          }
        }, () => {
          this.submitted = false;
          this.notificationService.createErrorNotification("There\'s an error when resetting password.");
        })
    }
  }

  clearError() {
    if (this.otpFormControl.hasError('mismatch')) {
      this.otpFormControl.setErrors(null);
    }
  }

  matchPassword() {
    this.confirmPasswordFormControl.setErrors(null);
    const passwordValue = this.passwordFormControl.value;
    const confirmPasswordValue = this.confirmPasswordFormControl.value;
    if (passwordValue !== confirmPasswordValue) {
      this.confirmPasswordFormControl.setErrors({passwordNotMatch: true})
    }
  }
}
