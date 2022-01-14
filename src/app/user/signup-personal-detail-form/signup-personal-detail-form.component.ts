import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder, FormControl,
  FormGroup, NG_VALIDATORS,
  NG_VALUE_ACCESSOR, ValidationErrors,
  Validators
} from "@angular/forms";
import {
  nricValidator,
  passwordValidator,
  phoneNumberValidator, usernameValidator
} from "../../shared/validators/custom-validators";
import {
  uniqueEmailValidator,
  uniqueNricValidator,
  uniqueUsernameValidator
} from "../../shared/validators/custom-async-validator";
import {AuthService} from "../../auth/auth.service";
import {DropdownConstant} from "../../shared/constants/dropdown-constant";
import {DropdownChoiceModel} from "../../shared/models/dropdown-choice-model";

@Component({
  selector: 'app-signup-personal-detail-form',
  templateUrl: './signup-personal-detail-form.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SignupPersonalDetailFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SignupPersonalDetailFormComponent),
      multi: true
    }
  ]
})
export class SignupPersonalDetailFormComponent implements OnInit, ControlValueAccessor, Validators {

  @Input('isVisible') isVisible: boolean;
  personalDetailForm: FormGroup;
  readonly GENDER_CHOICE: DropdownChoiceModel[] = DropdownConstant.GENDER_DROPDOWN;
  readonly ETHNIC_DROPDOWN: DropdownChoiceModel[] = DropdownConstant.ETHNIC_DROPDOWN;

  constructor(private fb: FormBuilder,
              private authService: AuthService) {
  }

  get passwordFormControl() {
    return this.personalDetailForm.get('password') as FormControl;
  }

  get confirmPasswordFormControl() {
    return this.personalDetailForm.get('confirmPassword') as FormControl;
  }

  ngOnInit(): void {
    this.initForm();
  }

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(val: any): void {
    val && this.personalDetailForm.patchValue(val, {emitEvent: false});
  }

  registerOnChange(fn: any): void {
    this.personalDetailForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.personalDetailForm.disable() : this.personalDetailForm.enable();
  }

  validate(c: AbstractControl): ValidationErrors | null {
    console.log("Validating personal detail form.", this.personalDetailForm.valid);
    return this.personalDetailForm.valid ? null : {
      invalidForm: {
        valid: false,
        message: "Personal Detail Form has invalid field(s)."
      }
    }
  }

  setDirty() {
    for (const i in this.personalDetailForm.controls) {
      this.personalDetailForm.controls[i].markAsDirty();
    }
  }

  getValidity(): boolean {
    return this.personalDetailForm.valid;
  }

  matchPassword() {
    this.confirmPasswordFormControl.setErrors(null);
    const passwordValue = this.passwordFormControl.value;
    const confirmPasswordValue = this.confirmPasswordFormControl.value;
    if (passwordValue !== confirmPasswordValue) {
      this.confirmPasswordFormControl.setErrors({passwordNotMatch: true})
    }
  }

  private initForm() {
    this.personalDetailForm = this.fb.group({
      fullName: ['', Validators.required],
      nric: ['', [Validators.required, nricValidator()], [uniqueNricValidator(this.authService)]],
      username: ['', [Validators.required, usernameValidator()], [uniqueUsernameValidator(this.authService)]],
      password: ['', [Validators.required, passwordValidator()]],
      confirmPassword: ['', [Validators.required]],
      contactNo: ['', [Validators.required, phoneNumberValidator()]],
      email: ['', [Validators.email], [uniqueEmailValidator(this.authService)]],
      gender: [''],
      ethnic: ['']
    });
  }
}
