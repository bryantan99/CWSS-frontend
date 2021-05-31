import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html'
})
export class SignupComponent implements OnInit {

  readonly REVIEW_STEP_INDEX = 4;
  form: FormGroup;
  stepIndex: number = 0;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      personalDetail: this.initPersonalDetailForm(),
      address: this.initAddressForm(),
      occupation: this.initOccupationForm()
    });
  }

  private initPersonalDetailForm(): FormGroup {
    return this.fb.group({
      fullName: ['', Validators.required],
      nric: ['', Validators.required],
      email: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      gender: ['', Validators.required],
      contactNo: ['', Validators.required],
      ethnic: ['', Validators.required]
    })
  }

  private initAddressForm():FormGroup {
    return this.fb.group({
      addressLine1: ['', Validators.required],
      addressLine2: ['', Validators.required],
      postcode: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required]
    })
  }

  private initOccupationForm():FormGroup {
    return this.fb.group({
      occupationType: ['', Validators.required],
      occupationName: ['', Validators.required],
      salary: ['', Validators.required],
      companyName: [''],
      companyContactNo: [''],
    });
  }

  submitForm() {
    console.log("Form value", this.form.value);
  }

  onIndexChange(index: number) {
    this.stepIndex = index;
    this.stepIndex === this.REVIEW_STEP_INDEX ? this.disableAllInputs() : this.enableAllInputs();
  }

  private disableAllInputs() {
    this.form.get('personalDetail').disable();
    this.form.get('address').disable();
    this.form.get('occupation').disable();
  }

  private enableAllInputs() {
    this.form.get('personalDetail').enable();
    this.form.get('address').enable();
    this.form.get('occupation').enable();
  }

  movePage(newIndex: number) {
    this.stepIndex = newIndex;
    this.stepIndex === this.REVIEW_STEP_INDEX ? this.disableAllInputs() : this.enableAllInputs();
  }
}
