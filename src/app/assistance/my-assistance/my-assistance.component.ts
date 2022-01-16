import {Component, OnInit, ViewChild} from '@angular/core';
import {AssistanceService} from "../assistance.service";
import {NotificationService} from "../../shared/services/notification.service";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {AuthService} from "../../auth/auth.service";
import {User} from "../../shared/models/user";
import {FormBuilder, FormGroup} from "@angular/forms";
import {DropdownChoiceService} from "../../shared/services/dropdown-choice.service";
import {DropdownChoiceModel} from "../../shared/models/dropdown-choice-model";
import {DropdownConstant} from "../../shared/constants/dropdown-constant";
import {AssistanceFormComponent} from "../assistance-form/assistance-form.component";
import {finalize} from "rxjs/operators";
import {CommunityUserService} from "../../shared/services/community-user.service";
import {BlockDetailModel} from "../../shared/models/block-detail-model";
import {EventData} from "../../shared/models/event-data";
import {EventBusService} from "../../shared/services/event-bus.service";

@Component({
  selector: 'app-my-assistance',
  templateUrl: './my-assistance.component.html'
})
export class MyAssistanceComponent implements OnInit {

  @ViewChild(AssistanceFormComponent) assistanceFormComponent: AssistanceFormComponent;
  assistanceRecords: any[] = [];
  isLoading: boolean = false;
  user: User;
  isAdmin: boolean = false;
  filterDrawerIsVisible: boolean = false;
  filterForm: FormGroup;

  USERNAME_DROPDOWN_LIST: DropdownChoiceModel[] = [];
  STATUS_DROPDOWN_LIST: DropdownChoiceModel[] = DropdownConstant.ASSISTANCE_STATUS_DROPDOWN;
  assistanceFormIsVisible: boolean = false;
  blockDetail: BlockDetailModel;

  constructor(private fb: FormBuilder,
              private assistanceService: AssistanceService,
              private authService: AuthService,
              private communityUserService: CommunityUserService,
              private dropdownChoiceService: DropdownChoiceService,
              private notificationService: NotificationService,
              private eventBusService: EventBusService) {
    this.authService.user.subscribe(resp => {
      this.user = resp;
      this.isAdmin = this.authService.isAdminLoggedIn();
      if (!this.isAdmin) {
        this.validateUserAccountIsBlocked();
      }
    })
  }

  ngOnInit(): void {
    this.initFilterForm();
    this.getMyAssistanceRecords();
  }

  refreshTable(data: boolean) {
    if (data) {
      this.getMyAssistanceRecords();
    }
  }

  private getMyAssistanceRecords() {
    this.isAdmin ? this.getHandledAssistanceRecords() : this.getUserAssistanceRecords();
  }

  private getHandledAssistanceRecords() {
    const assistanceId = this.filterForm.controls['assistanceId'].value || null;
    const title = this.filterForm.controls['title'].value || null;
    const status = this.filterForm.controls['status'].value || null;
    const username = this.filterForm.controls['username'].value || null;

    this.isLoading = true;
    this.assistanceService.getAdminHandledAssistanceRecords(assistanceId, title, status, username)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.assistanceRecords = resp.data;
        }
      }, error => {
        this.isLoading = false;
        this.assistanceRecords = [];
        if (error.status === HttpStatusConstant.FORBIDDEN) {
          this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
          this.eventBusService.emit(new EventData('logout', null));
        } else {
          const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when retrieving handled assistance record(s).";
          this.notificationService.createErrorNotification(msg);
        }
      });
  }

  private getUserAssistanceRecords() {
    this.isLoading = true;
    this.assistanceService.findUserAssistanceRecords(
      this.user.username,
      this.filterForm.controls['assistanceId'].value,
      this.filterForm.controls['title'].value,
      this.filterForm.controls['status'].value
    ).pipe(finalize(() => {
      this.isLoading = false;
    }))
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.assistanceRecords = resp.data ? resp.data : [];
        }
      }, error => {
        this.isLoading = false;
        this.assistanceRecords = [];
        console.log("Error: ", error);
        if (error.status === HttpStatusConstant.FORBIDDEN) {
          this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
          this.eventBusService.emit(new EventData('logout', null));
        } else {
          const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when retrieving assistance record(s).";
          this.notificationService.createErrorNotification(msg);
        }
      });
  }

  openFilterDrawer() {
    this.initDropdown();
    this.filterDrawerIsVisible = true;
  }

  closeFilterDrawer() {
    this.filterDrawerIsVisible = false;
  }

  searchByFilter() {
    this.closeFilterDrawer();
    this.getMyAssistanceRecords();
  }

  resetFilterSettings() {
    this.initFilterForm();
    this.searchByFilter();
  }

  private initFilterForm() {
    this.filterForm = this.fb.group({
      assistanceId: [''],
      title: [''],
      status: ['A'],
      username: ['']
    });
  }

  private initDropdown() {
    this.dropdownChoiceService.getCommunityUserDropdownChoices(true).subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.USERNAME_DROPDOWN_LIST = resp.data;
      }
    }, error => {
      if (error.status === HttpStatusConstant.FORBIDDEN) {
        this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
        this.eventBusService.emit(new EventData('logout', null));
      } else {
        const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when retrieving community users dropdown list.";
        this.notificationService.createErrorNotification(msg);
      }
    })
  }

  cancelNewAssistance() {
    this.assistanceFormIsVisible = false;
  }

  submitNewAssistance() {
    this.assistanceFormComponent.submit();
  }

  modalVisibleHasChange(data: any) {
    this.assistanceFormIsVisible = data.modalIsVisible;
  }

  listHasChange(data: any) {
    if (data.refreshList) {
      this.getMyAssistanceRecords();
    }
  }

  openAddAssistanceModal() {
    this.assistanceFormIsVisible = true;
  }

  private validateUserAccountIsBlocked() {
    this.communityUserService.validateUserIsBlockedFromRequestingAssistance(this.user.username).subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.blockDetail = resp.data ? resp.data : null;
      }
    }, error => {
      this.blockDetail = {
        username: this.user.username,
        isBlocked: true
      };
      if (error.status === HttpStatusConstant.FORBIDDEN) {
        this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
        this.eventBusService.emit(new EventData('logout', null));
      } else {
        this.notificationService.createErrorNotification("There\' an error when checking if the user is blocked from requesting assistance.");
      }
    })
  }
}
