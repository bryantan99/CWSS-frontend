import {Component, forwardRef, OnInit} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validators
} from "@angular/forms";

@Component({
  selector: 'app-signup-occupation-form',
  templateUrl: './signup-occupation-form.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SignupOccupationFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SignupOccupationFormComponent),
      multi: true
    }
  ]
})
export class SignupOccupationFormComponent implements OnInit, ControlValueAccessor {

  occupationForm: FormGroup

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.occupationForm = this.fb.group({
      occupationType: ['', Validators.required],
      occupationName: ['', Validators.required],
      salary: ['', Validators.required],
      companyName: [''],
      companyContactNo: [''],
    });
  }

  onTouched: () => void = () => {
  };

  writeValue(val: any): void {
    val && this.occupationForm.setValue(val, {emitEvent: false});
  }

  registerOnChange(fn: any): void {
    console.log("on change");
    this.occupationForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    console.log("on blur");
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.occupationForm.disable() : this.occupationForm.enable();
  }

  validate(c: AbstractControl): ValidationErrors | null {
    console.log("Occupation Form validation", c);
    return this.occupationForm.valid ? null : {
      invalidForm: {
        valid: false,
        message: "Occupation Form has invalid field(s)."
      }
    };
  }
}
