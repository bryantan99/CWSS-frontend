import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {SignupService} from "../signup.service";
import {SignupHealthFormComponent} from "../signup-health-form/signup-health-form.component";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {SignupPersonalDetailFormComponent} from "../signup-personal-detail-form/signup-personal-detail-form.component";
import {SignupAddressFormComponent} from "../signup-address-form/signup-address-form.component";
import {SignupOccupationFormComponent} from "../signup-occupation-form/signup-occupation-form.component";
import {Router} from "@angular/router";

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

  showInfoPage: boolean = true;
  showPersonalDetailForm: boolean = false;
  showAddressForm: boolean = false;
  showOccupationForm: boolean = false;
  showHealthForm: boolean = false;

  constructor(private fb: FormBuilder,
              private signupService: SignupService,
              private notificationService: NzNotificationService,
              private router: Router) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      personalDetail: new FormControl(""),
      address: new FormControl(""),
      occupation: new FormControl(""),
      health: new FormControl()
    });
  }

  submitForm() {
    this.personalDetailFormComponent.setDirty();
    this.form.controls['personalDetail'].updateValueAndValidity({emitEvent: false});

    this.addressFormComponent.setDirty();
    this.form.controls['address'].updateValueAndValidity({emitEvent: false});

    this.occupationFormComponent.setDirty();
    this.form.controls['occupation'].updateValueAndValidity({emitEvent: false});

    this.healthFormComponent.setDirty();
    this.form.controls['health'].updateValueAndValidity({emitEvent: false});

    if (!this.form.valid) {
      const invalidFormList = this.filterInvalidForm();
      this.displayInvalidFormNotification(invalidFormList);
      return;
    }

    this.signupService.registerAccount(this.form.value).subscribe(resp => {
      if (resp) {
        this.displaySignUpSuccessfulNotification();
        this.router.navigate(['login']);
      }
    }, error => {
      this.notificationService.error("Error", "There's an error when submitting form.");
    });
  }

  private filterInvalidForm(): string[] {
    let formName: string[] = [];
    Object.keys(this.form.controls).forEach(key => {
      if (!this.form.controls[key].valid) {
        key = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
        key = key.replace(/\w\S*/g,
          function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          })
        formName.push(key);
      }
    });
    return formName;
  }

  movePage(newIndex: number) {
    // this.updateTouchAndDirty(this.stepIndex);
    this.stepIndex = newIndex;
    this.displayChildForm(newIndex);
  }

  addDiseaseFormGroup() {
    this.healthFormComponent.addDiseaseFormGroup();
  }

  private displayInvalidFormNotification(invalidForms: string[]) {
    let errorMsg = "The following form(s) has invalid input fields. Please double check the form.<br/>";
    invalidForms.forEach(name => {
      errorMsg += "- " + name + "<br/>"
    })

    this.notificationService.create(
      'error',
      'Form is invalid',
      errorMsg
    )
  }

  private updateTouchAndDirty(indexBeforeMovePage: number) {
    switch (indexBeforeMovePage) {
      case 1:
        this.personalDetailFormComponent.setDirty();
        break;
      case 2:
        this.addressFormComponent.setDirty();
        break;
      case 3:
        this.occupationFormComponent.setDirty();
        break;
      case 4:
        this.healthFormComponent.setDirty();
        break;
    }
  }

  private displayChildForm(newIndex: number) {
    this.showInfoPage = newIndex === 0;
    this.showPersonalDetailForm = newIndex === 1;
    this.showAddressForm = newIndex === 2;
    this.showOccupationForm = newIndex === 3;
    this.showHealthForm = newIndex === 4;
  }

  private displaySignUpSuccessfulNotification() {
    const title: string = "Form is submitted!";
    const content: string = "Your submission will be reviewed by the admin. Please schedule an appointment with the admin " +
      "to review the submission. You should bring along supporting documents to support your details provided in occupation and health section."
    this.notificationService.success(title, content);
  }
}
