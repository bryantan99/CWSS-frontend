import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {SignupPersonalDetailFormComponent} from "../signup-personal-detail-form/signup-personal-detail-form.component";
import {SignupAddressFormComponent} from "../signup-address-form/signup-address-form.component";
import {SignupOccupationFormComponent} from "../signup-occupation-form/signup-occupation-form.component";
import {SignupHealthFormComponent} from "../signup-health-form/signup-health-form.component";
import {SignupService} from "../signup.service";
import {NotificationService} from "../../shared/services/notification.service";
import {ActivatedRoute, Router} from "@angular/router";
import {CommunityUserService} from "../../shared/services/community-user.service";
import {Location} from "@angular/common";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html'
})
export class UpdateProfileComponent implements OnInit {

  @ViewChild(SignupPersonalDetailFormComponent) personalDetailFormComponent: SignupPersonalDetailFormComponent;
  @ViewChild(SignupAddressFormComponent) addressFormComponent: SignupAddressFormComponent;
  @ViewChild(SignupOccupationFormComponent) occupationFormComponent: SignupOccupationFormComponent;
  @ViewChild(SignupHealthFormComponent) healthFormComponent: SignupHealthFormComponent;

  form: FormGroup = this.fb.group({
    personalDetail: new FormControl(""),
    address: new FormControl(""),
    occupation: new FormControl(""),
    health: new FormControl()
  });
  stepIndex: number = 0;

  showPersonalDetailForm: boolean = true;
  showAddressForm: boolean = false;
  showOccupationForm: boolean = false;
  showHealthForm: boolean = false;

  username: string;
  userProfile: any;

  constructor(private fb: FormBuilder,
              private signupService: SignupService,
              private notificationService: NotificationService,
              private location: Location,
              private router: Router,
              private route: ActivatedRoute,
              private communityUserService: CommunityUserService) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['username']) {
        this.username = params['username'];
        this.getUserProfile(this.username);
      } else {
        this.location.back();
      }
    })
  }

  private getUserProfile(username: string) {
    this.communityUserService.getCommunityUser(this.username).subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.userProfile = resp.data;
        this.patchFormValue();
      }
    })
  }

  private patchFormValue() {
    this.form.controls['personalDetail'].patchValue(this.userProfile.personalDetail);
    this.form.controls['personalDetail'].patchValue({
      email: this.userProfile.email
    });
    this.form.controls['personalDetail'].updateValueAndValidity();

    this.form.controls['address'].patchValue(this.userProfile.address);
    this.form.controls['address'].updateValueAndValidity();

    this.form.controls['occupation'].patchValue(this.userProfile.occupation);
    this.form.controls['occupation'].updateValueAndValidity();

    const healthIssueList: any[] = this.userProfile.healthModelList;
    if (healthIssueList) {
      let mappedHealthIssues: any[] = healthIssueList.map(toHealthDiseaseFormGroup)
      for (let i = 0; i < mappedHealthIssues.length; i++) {
        this.addDiseaseFormGroup();
      }
      this.form.controls['health'].patchValue({diseaseList: mappedHealthIssues});
      this.form.controls['health'].updateValueAndValidity();
    }

    function toHealthDiseaseFormGroup(healthIssue) {
      return {
        issueId: healthIssue.issueId ? healthIssue.issueId : null,
        diseaseId: healthIssue.diseaseId.toString(),
        description: healthIssue.diseaseDescription
      }
    }
  }

  movePage(index: number) {
    this.stepIndex = index;
    this.displayForm();
  }

  private displayForm() {
    this.showPersonalDetailForm = this.stepIndex === 0;
    this.showAddressForm = this.stepIndex === 1;
    this.showOccupationForm = this.stepIndex === 2;
    this.showHealthForm = this.stepIndex === 3;
  }

  addDiseaseFormGroup() {
    this.healthFormComponent.addDiseaseFormGroup();
  }

  submitForm() {
    this.personalDetailFormComponent.setDirty();
    this.form.get('personalDetail').updateValueAndValidity();
    this.addressFormComponent.setDirty();
    this.form.get('address').updateValueAndValidity();
    this.occupationFormComponent.setDirty();
    this.form.get('occupation').updateValueAndValidity();
    this.healthFormComponent.setDirty();
    this.form.get('health').updateValueAndValidity();

    if (!this.form.valid) {
      const invalidFormList = this.filterInvalidForm();
      this.displayInvalidFormNotification(invalidFormList);
      return;
    }

    console.log("Raw value", this.form.getRawValue());
    this.communityUserService.updateProfile(this.form.value).subscribe(resp => {
      if (resp) {
        this.notificationService.createSuccessNotification("User Profile has been updated.");
        this.router.navigate(['/profile'], {queryParams: {username: this.username}});
      }
    }, error => {
      this.notificationService.createErrorNotification("There's an error when submitting form.");
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

  private displayInvalidFormNotification(invalidFormList: string[]) {
    let errorMsg = "The following form(s) has invalid input fields. Please double check the form.<br/>";
    invalidFormList.forEach(name => {
      errorMsg += "- " + name + "<br/>"
    })

    this.notificationService.createErrorNotification(errorMsg);
  }

  onBack() {
    this.location.back();
  }
}
