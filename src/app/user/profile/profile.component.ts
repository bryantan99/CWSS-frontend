import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../auth/auth.service";
import {User} from "../../shared/models/user";
import {AdminUserService} from "../../shared/services/admin-user.service";
import {CommunityUserService} from "../../shared/services/community-user.service";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {NotificationService} from "../../shared/services/notification.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {finalize} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";
import {GeneralConstant} from "../../shared/constants/general-constant";
import {ImageService} from "../../shared/services/image.service";
import {NzUploadFile} from "ng-zorro-antd/upload";
import {RoleConstant} from "../../shared/constants/role-constant";
import {Location} from "@angular/common";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {

  currentLoggedInUser: User;
  isAdmin: boolean = false;
  adminProfile: any;
  userProfile: any;
  nzEditAdmin: boolean = false;
  adminForm: FormGroup;
  isSubmitting: boolean = false;
  queryParamUsername: string;
  queryParamAdminUsername: string;
  isLoading: boolean = false;
  healthTablePageIndex: number = 1;
  healthTablePageSize = 10;
  DATE_FORMAT = GeneralConstant.NZ_DATE_FORMAT;
  readonly PROFILE_PIC_PLACEHOLDER = '/assets/placeholder/profile_pic_placeholder.jpg';
  readonly ACCEPTABLE_FILE_FORMAT = ['image/jpeg', 'image/png'];
  fileList: NzUploadFile[] = [];

  beforeUpload = (file: NzUploadFile): boolean => {
    if (!this.fileList.some(e => e.name === file.name) && this.fileList.length < 1 && this.ACCEPTABLE_FILE_FORMAT.includes(file.type)) {
      this.fileList = this.fileList.concat(file);
    }
    return false;
  };

  removeFile = (file: NzUploadFile): boolean => {
    const index = this.fileList.indexOf(file);
    if (index > -1) {
      this.fileList.splice(index, 1);
    }
    return false;
  }
  isSuperAdmin: boolean = false;
  isOwner: boolean = false;

  constructor(private authService: AuthService,
              private adminService: AdminUserService,
              private communityUserService: CommunityUserService,
              private notificationService: NotificationService,
              private fb: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private imageService: ImageService,
              private location: Location) {
    this.route.queryParams.subscribe(params => {
      if (!params['username'] && !params['adminUsername']) {
        this.location.back();
      } else {
        this.queryParamUsername = params['username'];
        this.queryParamAdminUsername = params['adminUsername'];
        this.getProfile();
      }
    });
    this.authService.user.subscribe(resp => {
      this.currentLoggedInUser = resp;
      this.isAdmin = this.authService.isAdminLoggedIn();
      this.isSuperAdmin = this.authService.hasRole(RoleConstant.ROLE_SUPER_ADMIN);
    });
  }

  ngOnInit(): void {
  }

  private getProfile() {
    this.adminProfile = null;
    this.userProfile = null;
    if (this.queryParamUsername) {
      this.getCommunityUserProfile(this.queryParamUsername);
    } else if (this.queryParamAdminUsername) {
      this.getAdminProfile(this.queryParamAdminUsername)
    }
  }

  private getAdminProfile(username: string) {
    this.adminService.getProfile(username)
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.adminProfile = resp.data;
          this.isOwner = this.adminProfile.username === this.currentLoggedInUser.username;
        }
      }, error => {
        this.notificationService.createErrorNotification("There\'s an error when retrieving profile.");
        console.log(error);
      });
  }

  private getCommunityUserProfile(username: string) {
    this.communityUserService.getCommunityUser(username)
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.userProfile = resp.data;
          this.isOwner = this.userProfile.username === this.currentLoggedInUser.username;
        }
      }, error => {
        this.notificationService.createErrorNotification("There\'s an error when retrieving profile.");
        console.log(error);
      });
  }

  enterEditAdminMode() {
    this.initAdminForm();
    this.patchAdminForm();
    this.nzEditAdmin = true;
  }

  private initAdminForm() {
    this.adminForm = this.fb.group({
      username: ['', [Validators.required]],
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      contactNo: ['', Validators.required]
    });
  }

  private patchAdminForm() {
    this.adminForm.patchValue({
      username: this.adminProfile.username,
      fullName: this.adminProfile.fullName,
      email: this.adminProfile.email,
      contactNo: this.adminProfile.contactNo
    });

    if (this.adminProfile.profilePicDirectory) {
      const list = [];
      const obj: NzUploadFile = {
        uid: this.adminProfile.username,
        name: this.adminProfile.profilePicDirectory,
        status: 'done',
        url: this.imageService.getProfilePicture(this.adminProfile.username, this.adminProfile.profilePicDirectory),
        thumbUrl: this.imageService.getProfilePicture(this.adminProfile.username, this.adminProfile.profilePicDirectory)
      }
      list.push(obj);
      this.fileList = [...list];
    }
  }

  cancelNzEdit() {
    this.nzEditAdmin = false;
    this.adminForm.reset();
  }

  validateEmail() {
    if (this.nzEditAdmin) {
      const emailValue = this.adminForm.controls['email'].value;
      if (emailValue === this.adminProfile.email) {
        this.adminForm.controls['email'].setErrors(null);
        return;
      }

      this.authService.isUniqueEmail(emailValue).subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          const error = resp.data ? null : {emailTaken: true};
          this.adminForm.controls['email'].setErrors(error);
        }
      })
    }
  }

  submitAdminForm() {
    if (this.adminForm.valid) {
      this.isSubmitting = true;
      this.adminService.updateAdmin(this.adminForm.value, this.fileList)
        .pipe(finalize(() => {
          this.isSubmitting = false;
        }))
        .subscribe(resp => {
          if (resp && resp.status === HttpStatusConstant.OK) {
            this.notificationService.createSuccessNotification("Successfully updated profile.");
            this.cancelNzEdit();
            this.getProfile();
          }
        }, error => {
          this.isSubmitting = false;
          this.notificationService.createErrorNotification("There\' an error when updating profile.");
          console.log(error);
        })
    }
  }

  approveAccount(username: string) {
    this.communityUserService.approveAccount(username)
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.notificationService.createSuccessNotification("User account has been approved.");
          this.getCommunityUserProfile(username);
        }
      }, error => {
        this.notificationService.createErrorNotification("There\'s an error when approving user account.");
        console.log(error);
      })
  }

  rejectAccount(username
                  :
                  string
  ) {
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

  getProfilePicture(username
                      :
                      string, imageName
                      :
                      string
  ) {
    return imageName ? this.imageService.getProfilePicture(username, imageName) : this.PROFILE_PIC_PLACEHOLDER;
  }
}
