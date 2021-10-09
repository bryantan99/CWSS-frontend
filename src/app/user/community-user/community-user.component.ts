import {Component, OnInit, ViewChild} from '@angular/core';
import {CommunityUserService} from "../../shared/services/community-user.service";
import {finalize} from "rxjs/operators";
import {TableColumnItemModel} from "../../shared/models/table-column-item-model";
import {NotificationService} from "../../shared/services/notification.service";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {GoogleMap, MapInfoWindow, MapMarker} from "@angular/google-maps";
import * as Highcharts from 'highcharts';
import {FormBuilder, FormGroup} from "@angular/forms";

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
  Highcharts: typeof Highcharts = Highcharts;
  genderPieChartOption: any;
  ethnicPieChartOptions: any;
  locationPieChartOptions: any;
  queryForm: FormGroup;
  queryDrawerIsVisible: boolean = false;

  constructor(private communityUserService: CommunityUserService,
              private notificationService: NotificationService,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.initQueryForm();
    this.getCommunityUsers();
  }

  private initMarker() {
    this.markers = [];
    let i = 1;
    for (const user of this.users) {
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
      true,
      false,
      false)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.users = resp.data ? resp.data : [];
          this.initMarker();
          this.initCharts();
        }
      }, error => {
        this.users = [];
        this.notificationService.createErrorNotification("There\'s an error when retrieving community users.");
        console.log(error.error);
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

  private initCharts() {
    this.initGenderPieChartOption();
    this.initEthnicPieChartOption();
    this.initLocationPieChartOption();
  }

  private initGenderPieChartOption() {
    const data = [];
    let map: Map<string, number> = new Map();
    if (this.users) {
      map = this.users.reduce((acc, e) => acc.set(e.personalDetail.gender, (acc.get(e.personalDetail.gender) || 0) + 1), new Map());
    }
    map.forEach((value, key) => {
      data.push({
        name: key,
        y: value
      })
    });

    this.genderPieChartOption = {
      chart: {
        type: 'pie'
      },
      title: {
        text: 'Gender'
      },
      tooltip: {
        pointFormat: '{series.name}: {point.percentage:.2f}%'
      },
      accessibility: {
        point: {
          valueSuffix: '%'
        }
      },
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: true,
            format: '{point.name}: {point.percentage:.2f} %'
          }
        }
      },
      series: [{
        name: 'Gender',
        colorByPoint: true,
        data: data
      }]
    }
  }

  private initEthnicPieChartOption() {
    const data = [];
    let map: Map<string, number> = new Map();
    if (this.users) {
      map = this.users.reduce((acc, e) => acc.set(e.personalDetail.ethnic, (acc.get(e.personalDetail.ethnic) || 0) + 1), new Map());
    }
    map.forEach((value, key) => {
      data.push({
        name: key,
        y: value
      })
    });

    this.ethnicPieChartOptions = {
      chart: {
        type: 'pie'
      },
      title: {
        text: 'Ethnic'
      },
      tooltip: {
        pointFormat: '{series.name}: {point.percentage:.2f}%'
      },
      accessibility: {
        point: {
          valueSuffix: '%'
        }
      },
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: true,
            format: '{point.name}: {point.percentage:.2f} %'
          }
        }
      },
      series: [{
        name: 'Ethnic',
        colorByPoint: true,
        data: data
      }]
    }
  }

  private initLocationPieChartOption() {
    const data = [];
    let map: Map<string, number> = new Map();
    if (this.users) {
      map = this.users.reduce((acc, e) => {
        const addressLine2 = e.address ? e.address.addressLine2 : "-";
        acc.set(addressLine2, (acc.get(addressLine2) || 0) + 1);
        return acc;
      }, new Map());
    }
    map.forEach((value, key) => {
      data.push({
        name: key,
        y: value
      })
    });

    this.locationPieChartOptions = {
      chart: {
        type: 'pie'
      },
      title: {
        text: 'Location'
      },
      tooltip: {
        pointFormat: '{series.name}: {point.percentage:.2f}%'
      },
      accessibility: {
        point: {
          valueSuffix: '%'
        }
      },
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: true,
            format: '{point.name}: {point.percentage:.2f} %'
          }
        }
      },
      series: [{
        name: 'Location',
        colorByPoint: true,
        data: data
      }]
    }
  }

  private initQueryForm() {
    this.queryForm = this.fb.group({
      name: [null],
      nric: [null],
      gender: this.fb.control('A'),
      ethnic: this.fb.control('A')
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
}
