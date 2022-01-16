import {Component, OnInit} from '@angular/core';
import {AssistanceService} from "../assistance.service";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {NotificationService} from "../../shared/services/notification.service";
import * as Highcharts from 'highcharts';
import HC_stock from 'highcharts/modules/stock';
import {FormBuilder, FormGroup} from "@angular/forms";
import {DropdownChoiceModel} from "../../shared/models/dropdown-choice-model";
import {DropdownConstant} from "../../shared/constants/dropdown-constant";
import {AuthService} from "../../auth/auth.service";
import {finalize} from "rxjs/operators";
import {DropdownChoiceService} from "../../shared/services/dropdown-choice.service";
import {EventBusService} from "../../shared/services/event-bus.service";
import {EventData} from "../../shared/models/event-data";

HC_stock(Highcharts);

@Component({
  selector: 'app-all-assistance',
  templateUrl: './all-assistance.component.html'
})
export class AllAssistanceComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts;
  assistanceRecords: any[] = [];
  categoryColumnChartOption: any;
  statusPieChartOption: any;
  filterDrawerIsVisible: boolean = false;
  filterForm: FormGroup;
  STATUS_DROPDOWN_LIST: DropdownChoiceModel[] = DropdownConstant.ASSISTANCE_STATUS_DROPDOWN;
  CATEGORY_DROPDOWN: DropdownChoiceModel[] = [];
  ADMIN_DROPDOWN_LIST: DropdownChoiceModel[] = [];
  isAdmin: boolean = false;
  isLoading: boolean = false;
  chartType: string = 'status';

  constructor(private fb: FormBuilder,
              private assistanceService: AssistanceService,
              private authService: AuthService,
              private dropdownChoiceService: DropdownChoiceService,
              private notificationService: NotificationService,
              private eventBusService: EventBusService) {
    this.isAdmin = this.authService.isAdminLoggedIn();
  }

  ngOnInit(): void {
    this.initFilterForm();
    this.getAllAssistanceRecords();
  }

  private getAllAssistanceRecords() {
    this.isLoading = true;
    this.assistanceService.findAllAssistanceRecords(this.filterForm.value)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.assistanceRecords = resp.data ? resp.data : [];
          this.initChart();
        }
      }, error => {
        this.isLoading = false;
        if (error.status === HttpStatusConstant.FORBIDDEN) {
          this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
          this.eventBusService.emit(new EventData('logout', null));
        } else {
          const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when retrieving all assistance record.";
          this.notificationService.createErrorNotification(msg);
        }
      })
  }

  private initStatusPieChartOption() {
    const data = [];
    let map: Map<string, number> = new Map();
    if (this.assistanceRecords) {
      map = this.assistanceRecords.reduce((acc, e) => acc.set(e.status, (acc.get(e.status) || 0) + 1), new Map());
    }
    map.forEach((value, key) => {
      let formattedKey = this.getFullStatusName(key);
      data.push({
        name: formattedKey,
        y: value
      })
    });

    this.statusPieChartOption = {
      chart: {
        type: 'pie'
      },
      title: {
        text: 'Status'
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
        name: 'Status',
        colorByPoint: true,
        data: data
      }]
    }
  }

  private getFullStatusName(key: string) {
    switch (key) {
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'processing':
        return 'Processing';
      case 'rejected':
        return 'Rejected';
    }
  }

  openFilterDrawer() {
    this.initDropdownChoices();
    this.filterDrawerIsVisible = true;
  }

  closeFilterDrawer() {
    this.filterDrawerIsVisible = false;
  }

  private initFilterForm() {
    this.filterForm = this.fb.group({
      assistanceId: [''],
      categoryId: ['A'],
      title: [''],
      status: ['A'],
      nric: [''],
      adminUsername:['']
    });
  }

  searchByFilter() {
    this.closeFilterDrawer();
    this.getAllAssistanceRecords();
  }

  resetFilterSettings() {
    this.closeFilterDrawer();
    this.initFilterForm();
    this.getAllAssistanceRecords();
  }

  initChart() {
    switch (this.chartType) {
      case 'status':
        this.initStatusPieChartOption();
        break;
      case 'category':
        this.initCategoryColumnChartOption();
        break;
      default:
        break;
    }
  }

  private initCategoryColumnChartOption() {
    let map: Map<string, number> = new Map();
    if (this.assistanceRecords) {
      map = this.assistanceRecords.reduce((acc, e) => {
        const categoryName = e.categoryName ? e.categoryName : "-";
        acc.set(categoryName, (acc.get(categoryName) || 0) + 1);
        return acc;
      }, new Map());
    }

    const data = this.generateDataArr(map);
    const categories = Array.from(map.keys());
    categories.sort();

    this.categoryColumnChartOption = {
      chart: {
        type: 'column'
      },
      title: {
        text: 'Category'
      },
      xAxis: {
        categories: categories,
        min: 0,
        max: 9,
        scrollbar: {
          enabled: true
        },
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Number of case(s)'
        }
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          dataLabels: {
            enabled: true
          }
        }
      },
      series: [{
        name: 'Category',
        data: data
      }]
    }
  }

  private generateDataArr(map: Map<string, number>) {
    const data = [];
    if (map && map.size > 0) {
      map.forEach((value, key) => {
        data.push({
          name: key,
          y: value
        })
      });
      data.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    }
    return data;
  }

  private initDropdownChoices() {
    this.initCategoryDropdownChoices();
    this.initAdminDropdownChoices();
  }

  private initCategoryDropdownChoices() {
    this.dropdownChoiceService.getAssistanceCategoryDropdown().subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.CATEGORY_DROPDOWN = resp.data ? resp.data : [];
      }
    }, error => {
      if (error.status === HttpStatusConstant.FORBIDDEN) {
        this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
        this.eventBusService.emit(new EventData('logout', null));
      } else {
        const msg = error && error.error && error.error.message ? error.error.message : "There\' an error when retrieving assistance category dropdown choice(s).";
        this.notificationService.createErrorNotification(msg);
      }
    })
  }

  private initAdminDropdownChoices() {
    this.dropdownChoiceService.getAdminDropdownChoices().subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.ADMIN_DROPDOWN_LIST = resp.data ? resp.data : [];
      }
    }, error => {
      if (error.status === HttpStatusConstant.FORBIDDEN) {
        this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
        this.eventBusService.emit(new EventData('logout', null));
      } else {
        const msg = error && error.error && error.error.message ? error.error.message : "There\' an error when retrieving assistance category dropdown choice(s).";
        this.notificationService.createErrorNotification(msg);
      }
    })
  }
}
