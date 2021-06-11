import {Component, OnInit} from '@angular/core';
import {CommunityUserTableModel} from "../../shared/models/community-user-table-model";
import {CommunityUserService} from "../../shared/services/community-user.service";
import {finalize} from "rxjs/operators";
import {TableColumnItemModel} from "../../shared/models/table-column-item-model";

@Component({
  selector: 'app-community-user',
  templateUrl: './community-user.component.html'
})
export class CommunityUserComponent implements OnInit {

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
  nricFilterIsVisible: boolean = false;
  nricSearchValue = '';

  constructor(private communityUserService: CommunityUserService) {
  }

  ngOnInit(): void {
    this.getCommunityUsers()
  }

  private getCommunityUsers() {
    this.listOfData = [];
    this.isLoading = true;

    this.communityUserService.getCommunityUsers()
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
      //  Filter by fullName & nric if nric is present
      if (this.nricSearchValue) {
        return item.fullName.toLowerCase().indexOf(this.fullNameSearchValue.toLowerCase()) !== -1 &&
          item.nricNo.toLowerCase().indexOf(this.nricSearchValue.toLowerCase()) !== -1
      }

      //  Filter by fullName only
      return item.fullName.toLowerCase().indexOf(this.fullNameSearchValue.toLowerCase()) !== -1
    });
  }

  searchNric() {
    this.nricFilterIsVisible = false;
    this.listOfDisplayData = this.listOfData.filter((item: CommunityUserTableModel) => {

      //  Filter by nric and fullname if full name is present
      if (this.fullNameSearchValue) {
        return item.nricNo.toLowerCase().indexOf(this.nricSearchValue.toLowerCase()) !== -1 &&
          item.fullName.toLowerCase().indexOf(this.fullNameSearchValue.toLowerCase()) !== -1;
      }

      //  Filter by nric only
      return item.nricNo.toLowerCase().indexOf(this.nricSearchValue.toLowerCase()) !== -1;
    });
  }

  resetNric() {
    this.nricSearchValue = '';
    this.searchNric();
  }
}
