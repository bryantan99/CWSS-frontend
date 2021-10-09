import {Component, OnInit, ViewChild} from '@angular/core';
import {CommunityUserService} from "../../shared/services/community-user.service";
import {finalize} from "rxjs/operators";
import {TableColumnItemModel} from "../../shared/models/table-column-item-model";
import {NotificationService} from "../../shared/services/notification.service";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {GoogleMap, MapInfoWindow, MapMarker} from "@angular/google-maps";

@Component({
  selector: 'app-community-user',
  templateUrl: './community-user.component.html'
})
export class CommunityUserComponent implements OnInit {
  @ViewChild(GoogleMap, {static: false}) map: GoogleMap;
  @ViewChild(MapInfoWindow, {static: false}) info: MapInfoWindow;
  zoom: number = 15;
  readonly center: google.maps.LatLngLiteral = {
    lat: 4.852512156374134,
    lng: 100.7216031800132
  };
  readonly options: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    maxZoom: 20,
    minZoom: 12,
  }
  markers = [];
  infoContent = '';
  users: any[] = [];
  displayData: any = [];
  isLoading: boolean = false;
  pageIndex: number = 1;
  pageSize: number = 10;

  fullNameFilterIsVisible: boolean = false;
  fullNameSearchValue = '';
  nricFilterIsVisible: boolean = false;
  nricSearchValue = '';
  genderColumnItem: TableColumnItemModel = {
    listOfFilter: [
      {text: "Male", value: "M"},
      {text: "Female", value: "F"},
    ],
    filterFn: (value: string, item: any) => item.personalDetail.gender.indexOf(value) !== -1
  }
  accountStatusColumnItem: TableColumnItemModel = {
    listOfFilter: [
      {text: "Activated", value: "Y"},
      {text: "Unactivated", value: "N"},
    ],
    filterFn: (value: string, item: any) => item.accIsActivate.indexOf(value) !== -1
  }

  constructor(private communityUserService: CommunityUserService,
              private notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.getCommunityUsers();
  }

  private initMarker() {
    this.markers = [];
    let i = 1;
    for (const user of this.displayData) {
      user.index = i;
      if (user.address) {
        this.markers.push({
          position: {
            lat: user.address.latitude,
            lng: user.address.longitude,
          },
          label: {
            color: 'white',
            text: user.index.toString(),
          },
          title: user.personalDetail.fullName,
          info: user.personalDetail.fullName,
          // options: {
          //   icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          // },
        })
      }
      i += 1;
    }
    console.log("user: ", this.users);
    console.log("markers: ", this.markers);
  }

  openInfo(marker: MapMarker, content) {
    this.infoContent = content;
    this.info.open(marker);
  }

  private getCommunityUsers() {
    this.isLoading = true;
    this.communityUserService.getCommunityUsers(true)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.users = resp.data ? resp.data : [];
          this.displayData = [...this.users];
          this.initMarker();
        }
      }, error => {
        this.users = [];
        this.displayData = [...this.users];
        this.notificationService.createErrorNotification("There\'s an error when retrieving community users.");
        console.log(error.error);
      });
  }

  generateAddress(address: any) {
    let fullAddress = "-";
    if (address) {
      fullAddress = address.addressLine1 + " " + address.addressLine2 + " " + address.postcode + " " + address.city + " " + address.state;
    }
    return fullAddress;
  }

  searchFullName(): void {
    this.fullNameFilterIsVisible = false;
    this.displayData = this.users.filter((item: any) => {
      //  Filter by fullName & nric if nric is present
      if (this.nricSearchValue) {
        return item.personalDetail.fullName.toLowerCase().indexOf(this.fullNameSearchValue.toLowerCase()) !== -1 &&
          item.personalDetail.nric.toLowerCase().indexOf(this.nricSearchValue.toLowerCase()) !== -1
      }

      //  Filter by fullName only
      return item.personalDetail.fullName.toLowerCase().indexOf(this.fullNameSearchValue.toLowerCase()) !== -1
    });
    this.initMarker();
  }

  resetFullName(): void {
    this.fullNameSearchValue = '';
    this.searchFullName();
  }

  searchNric() {
    this.nricFilterIsVisible = false;
    this.displayData = this.users.filter((item: any) => {

      //  Filter by nric and fullname if full name is present
      if (this.fullNameSearchValue) {
        return item.personalDetail.nric.toLowerCase().indexOf(this.nricSearchValue.toLowerCase()) !== -1 &&
          item.personalDetail.fullName.toLowerCase().indexOf(this.fullNameSearchValue.toLowerCase()) !== -1;
      }

      //  Filter by nric only
      return item.personalDetail.nric.toLowerCase().indexOf(this.nricSearchValue.toLowerCase()) !== -1;
    });
    this.initMarker();
  }

  resetNric() {
    this.nricSearchValue = '';
    this.searchNric();
  }
}
