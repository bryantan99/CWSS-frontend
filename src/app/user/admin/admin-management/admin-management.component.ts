import {Component, OnInit} from '@angular/core';
import {CommunityUserTableModel} from "../../../shared/models/community-user-table-model";
import {TableColumnItemModel} from "../../../shared/models/table-column-item-model";
import {NotificationService} from "../../../shared/services/notification.service";
import {finalize} from "rxjs/operators";
import {AdminUserService} from "../../../shared/services/admin-user.service";

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

  constructor(private adminUserService: AdminUserService,
              private notificationService: NotificationService) {
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
        this.listOfData = resp ? resp : [];
        this.listOfDisplayData = [...this.listOfData];
      }, error => {
        console.log("There's an error when retrieving community users.", error);
        this.isLoading = false;
        this.listOfData = []
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
    this.adminUserService.deleteStaff(username).subscribe(() => {
      this.notificationService.createSuccessNotification("User account has been deleted.")
      this.getAdminUsers();
    }, error => {
      this.notificationService.createErrorNotification("There\'s an error when deleting user account.")
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
}
