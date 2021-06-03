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
  fullNameSortFn = (a: CommunityUserTableModel, b: CommunityUserTableModel) => a.fullName.localeCompare(b.fullName);
  accountStatusColumnItem: TableColumnItemModel = {
    name: "Account Status",
    listOfFilter: [
      {text: "Activated", value: "Y"},
      {text: "Unactivated", value: "N"},
    ],
    filterFn: (value: string, item: CommunityUserTableModel) => item.isActive.indexOf(value) !== -1
  }

  visible: boolean = false;
  searchValue = '';

  constructor(private communityUserService: CommunityUserService) {
  }

  ngOnInit(): void {
    // this.initListOfColumn();
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

  /*
  private initListOfColumn() {
    this.listOfColumn = [
      {
        name: 'No.',
        sortOrder: null,
        sortFn: null,
        sortDirections: [],
        filterMultiple: false,
        listOfFilter: [],
        filterFn: null
      },
      {
        name: 'Full Name',
        sortOrder: null,
        sortFn: ,
        sortDirections: ['ascend', 'descend', null],
        filterMultiple: false,
        listOfFilter: [],
        filterFn: null
      },
      {
        name: 'E-mail',
        sortOrder: null,
        sortFn: (a: CommunityUserTableModel, b: CommunityUserTableModel) => a.email.localeCompare(b.email),
        sortDirections: ['ascend', 'descend', null],
        filterMultiple: true,
        listOfFilter: [
          {text: 'Without e-mail', value: null}
        ],
        filterFn: (email: string, item: CommunityUserTableModel) => !item.email
      },
      {
        name: 'Account Status',
        sortOrder: null,
        sortFn: (a: CommunityUserTableModel, b: CommunityUserTableModel) => a.isActive.localeCompare(b.isActive),
        sortDirections: ['ascend', 'descend', null],
        filterMultiple: true,
        listOfFilter: [
          {text: 'Active', value: 'Y'},
          {text: 'Inactive', value: 'N'},
        ],

      },
      {
        name: 'View',
        sortOrder: null,
        sortFn: null,
        sortDirections: [],
        filterMultiple: false,
        listOfFilter: [],
        filterFn: null
      },
    ]
  }
  */
  reset(): void {
    this.searchValue = '';
    this.search();
  }

  search(): void {
    this.visible = false;
    this.listOfDisplayData = this.listOfData.filter((item: CommunityUserTableModel) => item.fullName.indexOf(this.searchValue) !== -1);
  }
}
