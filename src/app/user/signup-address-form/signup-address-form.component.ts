import {Component, forwardRef, OnInit} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors,
  Validators
} from "@angular/forms";
import {StateConstant} from "../../shared/constants/state-constant";
import {DropdownConstant} from "../../shared/constants/dropdown-constant";

@Component({
  selector: 'app-signup-address-form',
  templateUrl: './signup-address-form.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SignupAddressFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SignupAddressFormComponent),
      multi: true
    }
  ]
})
export class SignupAddressFormComponent implements OnInit, ControlValueAccessor {

  addressForm: FormGroup;
  STATE_FEDERAL_TERRITORY_DROPDOWN = DropdownConstant.STATE_AND_FEDERAL_TERRITORY_DROPDOWN;

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.addressForm = this.fb.group({
      addressLine1: ['', Validators.required],
      addressLine2: ['', Validators.required],
      postcode: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
    })
  }

  onTouched: () => void = () => {
  };

  writeValue(val: any): void {
    val && this.addressForm.setValue(val, {emitEvent: false});
  }

  registerOnChange(fn: any): void {
    console.log("on change");
    this.addressForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    console.log("on blur");
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.addressForm.disable() : this.addressForm.enable();
  }

  validate(c: AbstractControl): ValidationErrors | null {
    console.log("Address Form validation", c);
    return this.addressForm.valid ? null : {
      invalidForm: {
        valid: false,
        message: "Address Form has invalid field(s)."
      }
    };
  }
}
