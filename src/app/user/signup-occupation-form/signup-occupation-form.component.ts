import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validators
} from "@angular/forms";
import {DropdownConstant} from "../../shared/constants/dropdown-constant";
import {phoneNumberValidator} from "../../shared/validators/custom-validators";

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

  @Input('isVisible') isVisible: boolean;
  occupationForm: FormGroup;
  EMPLOYMENT_TYPE_CHOICE_LIST = DropdownConstant.EMPLOYMENT_TYPE_DROPDOWN;
  showEmployerCompanyField: boolean = false;
  showEmployerContactNoField: boolean = false;
  showSalaryField: boolean = false;
  showOccupationNameField: boolean = false;

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.occupationForm = this.fb.group({
      occupationType: ['', Validators.required],
      occupationName: [''],
      salary: [''],
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
    this.occupationForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.occupationForm.disable() : this.occupationForm.enable();
  }

  validate(c: AbstractControl): ValidationErrors | null {
    return this.occupationForm.valid ? null : {
      invalidForm: {
        valid: false,
        message: "Occupation Form has invalid field(s)."
      }
    };
  }

  updateTouchAndDirty() {
    for (const i in this.occupationForm.controls) {
      this.occupationForm.controls[i].markAsDirty();
      this.occupationForm.controls[i].updateValueAndValidity();
    }
  }

  employmentTypeHasChange(value: string) {
    const isUnemployed = value === '-';
    const needEmployerDetails = value === 'GOVT' || value === 'PVT';

    this.showOccupationNameField = !isUnemployed;
    this.showSalaryField = !isUnemployed;
    this.showEmployerCompanyField = needEmployerDetails;
    this.showEmployerContactNoField = needEmployerDetails;

    if (isUnemployed) {
      this.occupationForm.get('occupationName').setValidators(null);
      this.occupationForm.get('occupationName').updateValueAndValidity();
      this.occupationForm.get('salary').setValidators(null);
      this.occupationForm.get('salary').updateValueAndValidity();
    } else {
      this.occupationForm.get('occupationName').setValidators([Validators.required]);
      this.occupationForm.get('occupationName').updateValueAndValidity();
      this.occupationForm.get('salary').setValidators([Validators.required]);
      this.occupationForm.get('salary').updateValueAndValidity();
    }

    if (needEmployerDetails) {
      this.occupationForm.get('companyName').setValidators([Validators.required]);
      this.occupationForm.get('companyContactNo').setValidators([Validators.required, phoneNumberValidator()]);
      this.occupationForm.get('companyName').updateValueAndValidity();
      this.occupationForm.get('companyContactNo').updateValueAndValidity();
    } else {
      this.occupationForm.get('companyName').setValidators(null);
      this.occupationForm.get('companyContactNo').setValidators(null);
      this.occupationForm.get('companyName').updateValueAndValidity();
      this.occupationForm.get('companyContactNo').updateValueAndValidity();
    }
  }
}
