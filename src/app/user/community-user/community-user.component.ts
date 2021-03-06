import {Component, OnInit, ViewChild} from '@angular/core';
import {CommunityUserService} from "../../shared/services/community-user.service";
import {finalize} from "rxjs/operators";
import {TableColumnItemModel} from "../../shared/models/table-column-item-model";
import {NotificationService} from "../../shared/services/notification.service";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {GoogleMap, MapInfoWindow, MapMarker} from "@angular/google-maps";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CommunityUserGraphComponent} from "../community-user-graph/community-user-graph.component";
import {DropdownChoiceService} from "../../shared/services/dropdown-choice.service";
import {DropdownChoiceModel} from "../../shared/models/dropdown-choice-model";
import {EventBusService} from "../../shared/services/event-bus.service";
import {EventData} from "../../shared/models/event-data";

@Component({
  selector: 'app-community-user',
  templateUrl: './community-user.component.html'
})
export class CommunityUserComponent implements OnInit {
  @ViewChild(GoogleMap, {static: false}) map: GoogleMap;
  @ViewChild(MapInfoWindow, {static: false}) info: MapInfoWindow;
  @ViewChild(CommunityUserGraphComponent, {static: false}) graphComponent: CommunityUserGraphComponent;
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
  isLoading: boolean = false;
  pageIndex: number = 1;
  pageSize: number = 10;

  accountStatusColumnItem: TableColumnItemModel = {
    listOfFilter: [
      {text: "Activated", value: "Y"},
      {text: "Unactivated", value: "N"},
    ],
    filterFn: (value: string, item: any) => item.accIsActivate.indexOf(value) !== -1
  }

  queryForm: FormGroup;
  queryDrawerIsVisible: boolean = false;
  diseaseDropdownList: DropdownChoiceModel[] = [];
  zoneDropdownList: DropdownChoiceModel[] = [];

  constructor(private communityUserService: CommunityUserService,
              private notificationService: NotificationService,
              private dropdownChoiceService: DropdownChoiceService,
              private fb: FormBuilder,
              private eventBusService: EventBusService) {
  }

  ngOnInit(): void {
    this.initQueryForm();
    this.initDiseaseDropdownList();
    this.initZoneDropdownList();
    this.getCommunityUsers();
  }

  private initDiseaseDropdownList() {
    this.diseaseDropdownList = [];
    this.dropdownChoiceService.getDiseaseDropdownChoices().subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.diseaseDropdownList = resp.data ? resp.data : [];
      }
    }, () => {
      this.notificationService.createErrorNotification("There's an error when retrieving disease dropdown choice list.");
    })
  }

  private initMarker() {
    this.markers = [];
    let i = 1;
    for (const user of this.users) {
      user.index = i;
      if (user.address && user.address.latLng) {
        const latitude = user.address.latLng.lat;
        const longitude = user.address.latLng.lng;
        this.markers.push({
          position: {
            lat: latitude,
            lng: longitude,
          },
          label: {
            color: 'white',
            text: user.index.toString(),
          },
          title: user.fullName,
          info: user.fullName,
          // options: {
          //   icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          // },
        })
      }
      i += 1;
    }
  }

  openInfo(marker: MapMarker, content) {
    this.infoContent = content;
    this.info.open(marker);
  }

  getCommunityUsers() {
    this.isLoading = true;
    this.communityUserService.getCommunityUsers(
        this.queryForm.controls['name'].value,
        this.queryForm.controls['nric'].value,
        this.queryForm.controls['gender'].value,
        this.queryForm.controls['ethnic'].value,
        this.queryForm.controls['disease'].value,
        this.queryForm.controls['zoneId'].value,
        this.queryForm.controls['isEligibleForAssistance'].value)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.users = resp.data ? resp.data : [];
          this.initMarker();
          // this.graphComponent.initCharts();
        }
      }, error => {
        this.users = [];
        if (error.status === HttpStatusConstant.FORBIDDEN) {
          this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
          this.eventBusService.emit(new EventData('logout', null));
        } else {
          this.notificationService.createErrorNotification("There\'s an error when retrieving community users.");
        }
      });
    this.queryDrawerIsVisible = false;
  }

  generateAddress(address: any) {
    let fullAddress = "-";
    if (address) {
      fullAddress = address.addressLine1 + " " + address.addressLine2 + " " + address.postcode + " " + address.city + " " + address.state;
    }
    return fullAddress;
  }

  private initQueryForm() {
    this.queryForm = this.fb.group({
      name: [null],
      nric: [null],
      gender: this.fb.control('A'),
      ethnic: this.fb.control('A'),
      disease: this.fb.control('A'),
      zoneId: this.fb.control('A'),
      isEligibleForAssistance: this.fb.control('A')
    })
  }

  resetQueryForm() {
    this.initQueryForm();
    this.getCommunityUsers();
  }

  closeQueryDrawer() {
    this.queryDrawerIsVisible = false;
  }

  openQueryDrawer() {
    this.queryDrawerIsVisible = true;
  }

  private initZoneDropdownList() {
    this.zoneDropdownList = [];
    this.dropdownChoiceService.getZoneDropdownChoiceList().subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.zoneDropdownList = resp.data ? resp.data : [];
      }
    }, () => {
      this.notificationService.createErrorNotification("There's an error when retrieving zone dropdown choice list.");
    })
  }
}
