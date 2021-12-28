import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {CommunityUserService} from "../../shared/services/community-user.service";
import {NotificationService} from "../../shared/services/notification.service";
import {Router} from "@angular/router";
import {GeneralConstant} from "../../shared/constants/general-constant";
import {AuthService} from "../../auth/auth.service";
import {User} from "../../shared/models/user";
import {Location} from "@angular/common";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DropdownConstant} from "../../shared/constants/dropdown-constant";
import {phoneNumberValidator, postCodeValidator} from "../../shared/validators/custom-validators";
import {DropdownChoiceModel} from "../../shared/models/dropdown-choice-model";
import {DropdownChoiceService} from "../../shared/services/dropdown-choice.service";

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html'
})
export class UserProfileComponent implements OnInit {

  @Input() userProfile: any;
  @Input() isLoading: boolean = false;
  @Output() refreshEventEmitter: EventEmitter<{ username: string }> = new EventEmitter<{ username: string }>();
  pageIndex: number = 1;
  pageSize: number = 10;
  isEdit: boolean = false;
  readonly DATE_FORMAT = GeneralConstant.NZ_DATE_FORMAT;
  user: User;
  isAdmin: boolean = false;
  isOwner: boolean = false;
  isActiveProfile: boolean = false;
  userProfileForm: FormGroup;
  readonly GENDER_DROPDOWN = DropdownConstant.GENDER_DROPDOWN;
  readonly ETHNIC_DROPDOWN = DropdownConstant.ETHNIC_DROPDOWN;
  readonly STATE_DROPDOWN = DropdownConstant.STATE_AND_FEDERAL_TERRITORY_DROPDOWN;
  diseaseDropdownList: DropdownChoiceModel[] = [];
  readonly NZ_DATE_FORMAT = GeneralConstant.NZ_DATE_FORMAT;
  blockModalIsVisible: boolean = false;
  blockForm: FormGroup;

  constructor(private authService: AuthService,
              private communityUserService: CommunityUserService,
              private dropdownChoiceService: DropdownChoiceService,
              private notificationService: NotificationService,
              private router: Router,
              private location: Location,
              private fb: FormBuilder) {
    this.authService.user.subscribe(resp => {
      this.user = resp;
      this.isAdmin = this.authService.isAdminLoggedIn();
    })
  }

  get diseaseList(): FormArray {
    return this.userProfileForm.controls['health'].get('diseaseList') as FormArray;
  }

  ngOnInit(): void {
    if (this.userProfile) {
      this.isOwner = this.user.username === this.userProfile.username;
      this.isActiveProfile = this.userProfile && this.userProfile.accIsActivate == 'Y';
      this.initForm();
    } else {
      this.location.back();
    }
  }

  rejectAccount(username: string) {
    this.communityUserService.rejectAccount(username)
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.notificationService.createSuccessNotification("User account has been rejected.");
          this.router.navigate(['/community-user']);
        }
      }, error => {
        this.notificationService.createErrorNotification("There\'s an error when rejecting user account.");
        console.log(error);
      })
  }

  approveAccount(username: string) {
    this.communityUserService.approveAccount(username)
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.notificationService.createSuccessNotification("User account has been approved.");
          this.emitRefreshProfile(username);
        }
      }, error => {
        this.notificationService.createErrorNotification("There\'s an error when approving user account.");
        console.log(error);
      })
  }

  deleteAccount(username: string) {
    this.communityUserService.deleteCommunityUser(username)
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.notificationService.createSuccessNotification("User account has been deleted.");
          this.router.navigate(['/community-user']);
        }
      }, error => {
        this.notificationService.createErrorNotification("There\'s an error when deleting user account.");
        console.log(error);
      })
  }

  private emitRefreshProfile(username: string) {
    this.refreshEventEmitter.emit({username: username});
  }

  enterEditMode() {
    this.initDropdownChoice();
    this.patchForm();
    this.updateFormValidity(this.userProfileForm);
    this.userProfileForm.markAllAsTouched();
    this.isEdit = true;
  }

  exitEditMode() {
    this.initForm();
    this.isEdit = false;
  }

  private initForm() {
    this.userProfileForm = this.fb.group({
      personalDetail: this.fb.group({
        username: ['', [Validators.required]],
        fullName: ['', [Validators.required]],
        gender: [''],
        ethnic: [''],
        nric: ['', [Validators.required]],
        contactNo: ['', [Validators.required, phoneNumberValidator()]],
        email: [''],
      }),
      address: this.fb.group({
        addressLine1: ['', [Validators.required]],
        addressLine2: ['', [Validators.required]],
        postcode: ['', [Validators.required, postCodeValidator()]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
      }),
      health: this.fb.group({
        diseaseList: this.fb.array([])
      })
    })
  }

  private patchForm() {
    if (this.userProfile.personalDetail) {
      this.userProfileForm.patchValue({
        personalDetail: {
          username: this.userProfile.username,
          fullName: this.userProfile.personalDetail.fullName,
          gender: this.userProfile.personalDetail.gender,
          ethnic: this.userProfile.personalDetail.ethnic,
          nric: this.userProfile.personalDetail.nric,
          contactNo: this.userProfile.personalDetail.contactNo,
          email: this.userProfile.personalDetail.email
        }
      });
    }

    if (this.userProfile.address) {
      this.userProfileForm.patchValue({
        address: {
          addressLine1: this.userProfile.address.line1,
          addressLine2: this.userProfile.address.line2,
          state: this.userProfile.address.state,
          postcode: this.userProfile.address.postcode,
          city: this.userProfile.address.city
        }
      });
    }

    if (this.userProfile.healthModelList) {
      let mappedHealthIssues: any[] = this.userProfile.healthModelList.map(healthIssue => {
        return {
          healthIssueId: healthIssue.issueId ? healthIssue.issueId : null,
          diseaseId: healthIssue.diseaseId.toString(),
          description: healthIssue.diseaseDescription,
          isApproved: healthIssue.approvedBy != null && healthIssue.approvedDate != null
        }
      });
      for (let i = 0; i < this.userProfile.healthModelList.length; i++) {
        this.addDiseaseFormGroup();
      }
      this.diseaseList.patchValue(mappedHealthIssues);
    }
  }

  addDiseaseFormGroup() {
    this.diseaseList.push(this.initDiseaseForm());
    this.updateFormValidity(this.diseaseList);
    this.diseaseList.markAllAsTouched();
  }

  private initDiseaseForm() {
    return this.fb.group({
      healthIssueId: [null],
      diseaseId: ['', Validators.required],
      description: [''],
      isApproved: ['']
    });
  }

  private updateFormValidity(group: FormGroup | FormArray) {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.controls[key];
      abstractControl instanceof FormGroup || abstractControl instanceof FormArray ? this.updateFormValidity(abstractControl) : abstractControl.updateValueAndValidity();
    });
  }

  updateProfile() {
    this.communityUserService.updateProfile(this.userProfileForm.value).subscribe(resp => {
      if (resp && resp.status == HttpStatusConstant.OK) {
        this.exitEditMode();
        this.notificationService.createSuccessNotification("Successfully updated user profile.");
        this.emitRefreshProfile(this.userProfile.username);
      }
    })
  }

  private initDropdownChoice() {
    this.dropdownChoiceService.getDiseaseDropdownChoices().subscribe(resp => {
      if (resp && resp.status == HttpStatusConstant.OK) {
        this.diseaseDropdownList = resp.data ? resp.data : [];
      }
    }, error => {
      const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when retrieving disease dropdown list.";
      this.notificationService.createErrorNotification(msg);
    })
  }

  deleteDiseaseFormGroup(index: number) {
    this.diseaseList.removeAt(index);
  }

  showBlockModal() {
    this.initBlockForm();
    this.blockModalIsVisible = true;
  }

  initBlockForm() {
    this.blockForm = this.fb.group({
      username: [this.userProfile.username, Validators.required],
      reason: ['', Validators.required],
    });
  }

  submitBlockForm() {
    this.communityUserService.blockUser(this.blockForm.value).subscribe(resp => {
      if (resp && resp.status == HttpStatusConstant.OK) {
        this.notificationService.createSuccessNotification("Successfully block user.");
        this.closeBlockForm();
        this.emitRefreshProfile(this.userProfile.username);
      }
    }, error => {
      const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when attempting to block user.";
      this.notificationService.createErrorNotification(msg);
    })
  }

  closeBlockForm() {
    this.blockForm.reset();
    this.blockModalIsVisible = false;
  }

  unblockUser() {
    this.communityUserService.unblockUser(this.userProfile.username).subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.notificationService.createSuccessNotification("Successfully unblock user.");
        this.emitRefreshProfile(this.userProfile.username);
      }
    }, error => {
      const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when attempting to unblock user.";
      this.notificationService.createErrorNotification(msg);
    })
  }
}
