import {Component, OnInit, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {SignupService} from "../signup.service";
import {SignupHealthFormComponent} from "../signup-health-form/signup-health-form.component";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {SignupPersonalDetailFormComponent} from "../signup-personal-detail-form/signup-personal-detail-form.component";
import {SignupAddressFormComponent} from "../signup-address-form/signup-address-form.component";
import {SignupOccupationFormComponent} from "../signup-occupation-form/signup-occupation-form.component";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html'
})
export class SignupComponent implements OnInit {

  @ViewChild(SignupPersonalDetailFormComponent) personalDetailFormComponent: SignupPersonalDetailFormComponent;
  @ViewChild(SignupAddressFormComponent) addressFormComponent: SignupAddressFormComponent;
  @ViewChild(SignupOccupationFormComponent) occupationFormComponent: SignupOccupationFormComponent;
  @ViewChild(SignupHealthFormComponent) healthFormComponent: SignupHealthFormComponent;

  form: FormGroup;
  stepIndex: number = 0;

  showPersonalDetailForm: boolean = true;
  showAddressForm: boolean = false;
  showOccupationForm: boolean = false;
  showHealthForm: boolean = false;

  constructor(private fb: FormBuilder,
              private signupService: SignupService,
              private notificationService: NzNotificationService) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      personalDetail: new FormControl(""),
      address: new FormControl(""),
      occupation: new FormControl(""),
      health: new FormControl("")
    });
  }

  submitForm() {
    this.personalDetailFormComponent.updateTouchAndDirty();
    this.addressFormComponent.updateTouchAndDirty();
    this.occupationFormComponent.updateTouchAndDirty();
    this.healthFormComponent.updateTouchAndDirty();

    if (!this.form.valid) {
      this.displayInvalidFormNotification();
      return;
    }

    this.signupService.registerAccount(this.form.value).subscribe(resp => {
      if (resp == "OK") {
        console.log("Account created successfully.");
      }
    });
  }

  movePage(newIndex: number) {
    this.updateTouchAndDirty(this.stepIndex);
    this.stepIndex = newIndex;
    this.displayChildForm(newIndex);
  }

  addDiseaseFormGroup() {
    this.healthFormComponent.addDiseaseFormGroup();
  }

  private displayInvalidFormNotification() {
    this.notificationService.create(
      'error',
      'Form is invalid',
      'Please ensure that all sections are valid.'
    )
  }

  private updateTouchAndDirty(indexBeforeMovePage: number) {
    switch (indexBeforeMovePage) {
      case 0:
        this.personalDetailFormComponent.updateTouchAndDirty();
        break;
      case 1:
        this.addressFormComponent.updateTouchAndDirty();
        break;
      case 2:
        this.occupationFormComponent.updateTouchAndDirty();
        break;
      case 3:
        this.healthFormComponent.updateTouchAndDirty();
        break;
    }
  }

  private displayChildForm(newIndex: number) {
    this.showPersonalDetailForm = newIndex === 0;
    this.showAddressForm = newIndex === 1;
    this.showOccupationForm = newIndex === 2;
    this.showHealthForm = newIndex === 3;
  }
}
