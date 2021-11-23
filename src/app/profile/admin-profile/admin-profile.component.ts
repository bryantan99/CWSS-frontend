import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ImageService} from "../../shared/services/image.service";
import {NzUploadFile} from "ng-zorro-antd/upload";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {DropdownConstant} from "../../shared/constants/dropdown-constant";
import {finalize} from "rxjs/operators";
import {AuthService} from "../../auth/auth.service";
import {AdminUserService} from "../../shared/services/admin-user.service";
import {NotificationService} from "../../shared/services/notification.service";

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html'
})
export class AdminProfileComponent implements OnInit {

  @Input() adminProfile: any;
  @Input() isLoading: boolean = false;
  @Input() isSuperAdmin: boolean = false;
  @Input() isOwnerOfProfile: boolean = false;
  @Output() refreshEventEmitter: EventEmitter<{ adminUsername: string }> = new EventEmitter<{ adminUsername: string }>();
  readonly PROFILE_PIC_PLACEHOLDER = '/assets/placeholder/profile_pic_placeholder.jpg';
  readonly ACCEPTABLE_FILE_FORMAT = ['image/jpeg', 'image/png'];
  readonly ROLE_CHOICE: { text: string, value: string }[] = DropdownConstant.ACCOUNT_ROLE_DROPDOWN;
  fileList: NzUploadFile[] = [];
  adminForm: FormGroup;
  nzEditAdmin: boolean = false;
  isSubmitting: boolean = false;

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

  constructor(private imageService: ImageService,
              private fb: FormBuilder,
              private authService: AuthService,
              private adminService: AdminUserService,
              private notificationService: NotificationService) {
  }

  ngOnInit(): void {
  }

  getProfilePicture(username: string, imageName: string) {
    return imageName ? this.imageService.getProfilePicture(username, imageName) : this.PROFILE_PIC_PLACEHOLDER;
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
            this.emitRefreshProfile(this.adminProfile.username);
          }
        }, error => {
          this.isSubmitting = false;
          this.notificationService.createErrorNotification("There\' an error when updating profile.");
          console.log(error);
        })
    }
  }

  cancelNzEdit() {
    this.nzEditAdmin = false;
    this.adminForm.reset();
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
      contactNo: ['', Validators.required],
      roleList: [[], Validators.required]
    });
  }

  private patchAdminForm() {
    const roleIds = this.adminProfile.roleList ? this.adminProfile.roleList.map(r => r.roleId) : [];

    this.adminForm.patchValue({
      username: this.adminProfile.username,
      fullName: this.adminProfile.fullName,
      email: this.adminProfile.email,
      contactNo: this.adminProfile.contactNo,
      roleList: roleIds
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

  private emitRefreshProfile(adminUsername: string) {
    this.refreshEventEmitter.emit({adminUsername: adminUsername});
  }
}
