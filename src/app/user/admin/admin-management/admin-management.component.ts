import {Component, OnInit} from '@angular/core';
import {CommunityUserTableModel} from "../../../shared/models/community-user-table-model";
import {TableColumnItemModel} from "../../../shared/models/table-column-item-model";
import {NotificationService} from "../../../shared/services/notification.service";
import {finalize} from "rxjs/operators";
import {AdminUserService} from "../../../shared/services/admin-user.service";
import {HttpStatusConstant} from "../../../shared/constants/http-status-constant";
import {Router} from "@angular/router";
import {AuthService} from "../../../auth/auth.service";
import {User} from "../../../shared/models/user";
import {RoleConstant} from "../../../shared/constants/role-constant";
import {EventBusService} from "../../../shared/services/event-bus.service";
import {EventData} from "../../../shared/models/event-data";

@Component({
  selector: 'app-admin-user',
  templateUrl: './admin-management.component.html'
})
export class AdminManagementComponent implements OnInit {

  listOfData: CommunityUserTableModel[] = [];
  listOfDisplayData: CommunityUserTableModel[] = [];
  isLoading: boolean = false;
  pageIndex: number = 1;
  pageSize: number = 10;

  fullNameColumnItem: TableColumnItemModel = {
    name: "Full Name",
    sortFn: (a: CommunityUserTableModel, b: CommunityUserTableModel) => a.fullName.localeCompare(b.fullName)
  };

  accountStatusColumnItem: TableColumnItemModel = {
    name: "Account Status",
    listOfFilter: [
      {text: "Activated", value: "Y"},
      {text: "Unactivated", value: "N"},
    ],
    filterFn: (value: string, item: CommunityUserTableModel) => item.isActive.indexOf(value) !== -1
  }

  fullNameFilterIsVisible: boolean = false;
  fullNameSearchValue = '';
  adminDetailModalIsVisible: boolean = false;
  isSuperAdmin: boolean = false;
  user: User;

  constructor(private adminUserService: AdminUserService,
              private notificationService: NotificationService,
              private router: Router,
              private authService: AuthService,
              private eventBusService: EventBusService) {
    this.authService.user.subscribe(resp => {
      this.user = resp;
      this.isSuperAdmin = this.authService.hasRole(RoleConstant.ROLE_SUPER_ADMIN);
    });
  }

  ngOnInit(): void {
    this.getAdminUsers()
  }

  private getAdminUsers() {
    this.listOfData = [];
    this.isLoading = true;

    this.adminUserService.getAdminUsers()
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.listOfData = resp.data ? resp.data : [];
          this.listOfDisplayData = [...this.listOfData];
        }
      }, error => {
        console.log(error);
        this.isLoading = false;
        this.listOfData = []
        if (error.status === HttpStatusConstant.FORBIDDEN) {
          this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
          this.eventBusService.emit(new EventData('logout', null));
        } else {
          this.notificationService.createErrorNotification("There's an error when retrieving admins.");
        }

      });
  }

  resetFullName(): void {
    this.fullNameSearchValue = '';
    this.searchFullName();
  }

  searchFullName(): void {
    this.fullNameFilterIsVisible = false;
    this.listOfDisplayData = this.listOfData.filter((item: CommunityUserTableModel) => {
      return item.fullName.toLowerCase().indexOf(this.fullNameSearchValue.toLowerCase()) !== -1
    });
  }

  deleteUser(username: string) {
    this.adminUserService.deleteStaff(username).subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.notificationService.createSuccessNotification("User account has been deleted.")
        this.getAdminUsers();
      }
    }, error => {
      if (error.status === HttpStatusConstant.FORBIDDEN) {
        this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
        this.eventBusService.emit(new EventData('logout', null));
      } else {
        this.notificationService.createErrorNotification("There\'s an error when deleting user account.")
      }
    });
  }

  openAddAdminModal() {
    this.adminDetailModalIsVisible = true;
  }

  modalVisibleHasChanged(data: { isVisible: boolean, refresh: boolean }) {
    this.adminDetailModalIsVisible = data.isVisible;
    if (data.refresh) {
      this.getAdminUsers();
    }
  }

  viewProfile(username: string) {
    this.router.navigate(['/profile'], {queryParams: {adminUsername: username}});
  }
}
