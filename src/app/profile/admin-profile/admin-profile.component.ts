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
import {Subscription} from "rxjs";
import {phoneNumberValidator} from "../../shared/validators/custom-validators";
import {uniqueEmailValidator} from "../../shared/validators/custom-async-validator";
import {EventBusService} from "../../shared/services/event-bus.service";
import {EventData} from "../../shared/models/event-data";

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
  fileListValueChanges: EventEmitter<any> = new EventEmitter<any>();
  fileListValueChangesSubscription: Subscription;
  adminForm: FormGroup;
  nzEditAdmin: boolean = false;
  isSubmitting: boolean = false;

  beforeUpload = (file: NzUploadFile): boolean => {
    if (!this.fileList.some(e => e.name === file.name) && this.fileList.length < 1 && this.ACCEPTABLE_FILE_FORMAT.includes(file.type)) {
      this.fileList = this.fileList.concat(file);
      this.fileListValueChanges.emit(this.fileList);
    }
    return false;
  };

  removeFile = (file: NzUploadFile): boolean => {
    const index = this.fileList.indexOf(file);
    if (index > -1) {
      this.fileList.splice(index, 1);
      this.fileListValueChanges.emit(this.fileList);
    }
    return false;
  }

  constructor(private imageService: ImageService,
              private fb: FormBuilder,
              private authService: AuthService,
              private adminService: AdminUserService,
              private notificationService: NotificationService,
              private eventBusService: EventBusService) {
  }

  ngOnInit(): void {
  }

  getProfilePicture(username: string, imageName: string) {
    return imageName ? this.imageService.getProfilePicture(username, imageName) : this.PROFILE_PIC_PLACEHOLDER;
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
          if (error.status === HttpStatusConstant.FORBIDDEN) {
            this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
            this.eventBusService.emit(new EventData('logout', null));
          } else {
            this.notificationService.createErrorNotification("There\' an error when updating profile.");
          }
          console.log(error);
        })
    }
  }

  cancelNzEdit() {
    this.nzEditAdmin = false;
    this.adminForm.reset();
    this.fileListValueChangesSubscription.unsubscribe();
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
      email: ['', [Validators.required, Validators.email], [uniqueEmailValidator(this.authService, this.adminProfile.email)]],
      contactNo: ['', [Validators.required, phoneNumberValidator()]],
      roleList: [[], Validators.required],
      isActive: ['', [Validators.required]],
    });

    this.fileListValueChangesSubscription = this.fileListValueChanges.subscribe(() => {
      if (this.nzEditAdmin) {
        this.adminForm.markAllAsTouched();
        this.adminForm.markAsDirty();
        this.adminForm.updateValueAndValidity();
      }
    })
  }

  private patchAdminForm() {
    const roleIds = this.adminProfile.roleList ? this.adminProfile.roleList.map(r => r.roleId) : [];

    this.adminForm.patchValue({
      username: this.adminProfile.username,
      fullName: this.adminProfile.fullName,
      email: this.adminProfile.email,
      contactNo: this.adminProfile.contactNo,
      isActive: this.adminProfile.isActive,
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
