import {Component, Input, OnInit} from '@angular/core';
import {FormGroup, FormGroupDirective} from "@angular/forms";
import {StateConstant} from "../../shared/constants/state-constant";

@Component({
  selector: 'app-signup-address-form',
  templateUrl: './signup-address-form.component.html'
})
export class SignupAddressFormComponent implements OnInit {

  @Input() formGroupName!: string;

  form!: FormGroup
  STATE_FEDERAL_TERRITORY_DROPDOWN = StateConstant.STATE_AND_FEDERAL_TERRITORY_DROPDOWN;

  constructor(private rootFormGroup: FormGroupDirective) { }

  ngOnInit(): void {
    this.form = this.rootFormGroup.control.get(this.formGroupName) as FormGroup;
  }

}
