import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors,
  Validators
} from "@angular/forms";
import {DropdownConstant} from "../../shared/constants/dropdown-constant";
import {postCodeValidator} from "../../shared/validators/custom-validators";
import {DropdownChoiceModel} from "../../shared/models/dropdown-choice-model";
import {DropdownChoiceService} from "../../shared/services/dropdown-choice.service";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {NotificationService} from "../../shared/services/notification.service";

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

  @Input('isVisible') isVisible: boolean;
  addressForm: FormGroup;
  STATE_FEDERAL_TERRITORY_DROPDOWN = DropdownConstant.STATE_AND_FEDERAL_TERRITORY_DROPDOWN;
  ZONE_DROPDOWN: DropdownChoiceModel[] = [];

  constructor(private fb: FormBuilder,
              private dropdownService: DropdownChoiceService,
              private notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.initZoneDropdown();
    this.addressForm = this.fb.group({
      addressLine1: ['', Validators.required],
      addressLine2: ['', Validators.required],
      postcode: ['', [Validators.required, postCodeValidator()]],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zoneId: ['', Validators.required]
    })
  }

  onTouched: () => void = () => {
  };

  writeValue(val: any): void {
    val && this.addressForm.patchValue(val, {emitEvent: false});
  }

  registerOnChange(fn: any): void {
    if (this.addressForm) {
      this.addressForm.valueChanges.subscribe(fn);
    }
  }

  registerOnTouched(fn: any): void {
    console.log("on blur");
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.addressForm.disable() : this.addressForm.enable();
  }

  validate(c: AbstractControl): ValidationErrors | null {
    console.log("Validating address form.", this.addressForm.valid);
    return this.addressForm.valid ? null : {
      invalidForm: {
        valid: false,
        message: "Address Form has invalid field(s)."
      }
    };
  }

  setDirty() {
    for (const i in this.addressForm.controls) {
      this.addressForm.controls[i].markAsDirty();
    }
  }

  getValidity(): boolean {
    return this.addressForm.valid;
  }

  private initZoneDropdown() {
    this.dropdownService.getZoneDropdownChoiceList().subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.ZONE_DROPDOWN = resp.data ? resp.data : [];
      }
    }, () => {
      this.notificationService.createErrorNotification("There\'s an error when retrieving zone dropdown choices.");
    })
  }
}
