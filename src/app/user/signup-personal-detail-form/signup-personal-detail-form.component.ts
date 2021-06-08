import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormGroup, NG_VALIDATORS,
  NG_VALUE_ACCESSOR, ValidationErrors,
  Validators
} from "@angular/forms";
import {
  confirmPasswordMatchValidator,
  passwordValidator,
  phoneNumberValidator
} from "../../shared/validators/custom-validators";
import {uniqueUsernameValidator} from "../../shared/validators/custom-async-validator";
import {AuthService} from "../../auth/auth.service";

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
export class SignupPersonalDetailFormComponent implements OnInit, ControlValueAccessor {

  @Input('isVisible') isVisible: boolean;
  personalDetailForm: FormGroup;

  constructor(private fb: FormBuilder,
              private authService: AuthService) {
  }

  ngOnInit(): void {
    this.personalDetailForm = this.fb.group({
      fullName: ['', Validators.required],
      nric: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required],[uniqueUsernameValidator(this.authService)]],
      password: ['', [Validators.required, passwordValidator()]],
      confirmPassword: [''],
      gender: ['', Validators.required],
      contactNo: ['', [Validators.required, phoneNumberValidator()]],
      ethnic: ['', Validators.required]
    })

    this.personalDetailForm.get('confirmPassword').setValidators(
      [Validators.required,
      confirmPasswordMatchValidator(this.personalDetailForm.get('password'))]
    );

  }

  onTouched: () => void = () => {
  };

  writeValue(val: any): void {
    val && this.personalDetailForm.setValue(val, {emitEvent: false});
  }

  registerOnChange(fn: any): void {
    console.log("on change");
    this.personalDetailForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    console.log("on blur");
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.personalDetailForm.disable() : this.personalDetailForm.enable();
  }

  validate(c: AbstractControl): ValidationErrors | null {
    if (this.personalDetailForm.valid) {
      return null;
    }

    let invalidCtrl = [];
    for (const ctrlName in this.personalDetailForm.controls) {
      const ctrl = this.personalDetailForm.get(ctrlName);
      if (!ctrl.valid) {
        invalidCtrl.push(ctrlName);
      }
    }

    return {
      invalidForm: {
        valid: false,
        message: "Personal Detail Form has invalid field(s)." + invalidCtrl
      }
    }
  }

  updateTouchAndDirty() {
    for (const i in this.personalDetailForm.controls) {
      this.personalDetailForm.controls[i].markAsDirty();
      this.personalDetailForm.controls[i].updateValueAndValidity();
    }
    console.log(this.personalDetailForm);
  }
}
