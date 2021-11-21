import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AssistanceService} from "../assistance.service";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {NotificationService} from "../../shared/services/notification.service";
import {DropdownChoiceModel} from "../../shared/models/dropdown-choice-model";
import {AuthService} from "../../auth/auth.service";
import {DropdownChoiceService} from "../../shared/services/dropdown-choice.service";
import {RoleConstant} from "../../shared/constants/role-constant";
import {User} from "../../shared/models/user";

@Component({
  selector: 'app-assistance-form',
  templateUrl: './assistance-form.component.html'
})
export class AssistanceFormComponent implements OnInit {

  @Input() addToRequestPool: boolean = true;
  @Output() refreshListEventEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() modalIsVisibleEventEmitter: EventEmitter<any> = new EventEmitter<any>();
  nzTitle: string;
  form: FormGroup;
  COMMUNITY_USER_DROPDOWN: DropdownChoiceModel[] = [];
  CATEGORY_DROPDOWN: DropdownChoiceModel[] = [];
  user: User;
  isAdmin: boolean = false;
  isSuperAdmin: boolean = false;

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private assistanceService: AssistanceService,
              private dropdownChoiceService: DropdownChoiceService,
              private notificationService: NotificationService) {
    this.authService.user.subscribe(resp => {
      this.user = resp;
    })
    this.isAdmin = this.authService.isAdminLoggedIn();
    this.isSuperAdmin = this.authService.hasRole(RoleConstant.ROLE_SUPER_ADMIN);
  }

  ngOnInit(): void {
    this.initDropdownChoices();
    this.initForm();
  }

  submit() {
    for (const key in this.form.controls) {
      this.form.controls[key].markAsTouched();
      this.form.controls[key].markAsDirty();
      this.form.controls[key].updateValueAndValidity();
    }

    if (this.form.valid) {
      this.assistanceService.addAssistance(this.form.value).subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.CREATED) {
          this.notificationService.createSuccessNotification("Created new assistance request.");
          this.refreshListEventEmitter.emit({refreshList: true});
          this.modalIsVisibleEventEmitter.emit({modalIsVisible: false});
        }
      }, error => {
        this.notificationService.createErrorNotification("There\'s an error when adding new assistance request.");
        console.log(error.error);
      });
    }
  }

  private initDropdownChoices() {
    if (this.isAdmin) {
      this.initCommunityUserDropdownChoices();
      this.initCategoryDropdownChoices();
    }
  }

  private initCommunityUserDropdownChoices() {
    this.dropdownChoiceService.getCommunityUserDropdownChoices(true).subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.COMMUNITY_USER_DROPDOWN = resp.data ? resp.data : [];
      }
    }, error => {
      const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when retrieving community user's dropdown choice(s).";
      this.notificationService.createErrorNotification(msg);
    })
  }

  private initCategoryDropdownChoices() {
    this.dropdownChoiceService.getAssistanceCategoryDropdown().subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.CATEGORY_DROPDOWN = resp.data ? resp.data : [];
      }
    }, error => {
      const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when retrieving assistance category dropdown choice(s).";
      this.notificationService.createErrorNotification(msg);
    })
  }

  private initForm() {
    this.form = this.fb.group({
      assistanceTitle: ['', Validators.required],
      assistanceDescription: ['', Validators.required],
      categoryId: [''],
      username: [''],
      adminUsername: ['']
    });

    if (this.isAdmin) {
      if (!this.addToRequestPool) {
        this.form.patchValue({
          adminUsername: this.user.username
        });
      }
      this.form.controls['categoryId'].setValidators(Validators.required);
      this.form.controls['username'].setValidators(Validators.required);
    } else {
      this.form.patchValue({
        username: this.user.username
      });
    }
  }
}
