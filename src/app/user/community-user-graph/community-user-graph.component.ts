import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import * as Highcharts from 'highcharts';
import HC_stock from 'highcharts/modules/stock';
HC_stock(Highcharts);
import {GenderUtil} from "../../shared/utilities/genderUtil";
import {EthnicUtil} from "../../shared/utilities/ethnicUtil";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-community-user-graph',
  templateUrl: './community-user-graph.component.html'
})
export class CommunityUserGraphComponent implements OnInit, OnChanges {

  @Input() userData: any[] = [];
  @Input() filterSetting: any;
  readonly GRAPH_LIST = [
    {text: 'Gender', value: 'gender'},
    {text: 'Ethnic', value: 'ethnic'},
    {text: 'Location', value: 'location'},
    {text: 'Health', value: 'health'},
  ];
  Highcharts: typeof Highcharts = Highcharts;
  genderPieChartOption: any;
  ethnicPieChartOptions: any;
  locationColumnChartOption: any;
  healthColumnChartOption: any;
  genderUtil: GenderUtil = new GenderUtil();
  ethnicUtil: EthnicUtil = new EthnicUtil();
  graphId: string = 'gender';
  chartSettingForm: FormGroup;

  get graphIdControl(): FormControl {
    return this.chartSettingForm.controls['graphId'] as FormControl;
  }

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.userData) {
      this.initCharts();
    }
  }

  initCharts() {
    switch (this.chartSettingForm.controls['graphId'].value) {
      case "gender":
        this.initGenderPieChartOption();
        break;
      case "ethnic":
        this.initEthnicPieChartOption();
        break;
      case "location":
        this.initLocationColumnChartOption();
        break;
      case "health":
        this.initHealthColumnChartOption();
        break;
    }
  }

  private initGenderPieChartOption() {
    const data = [];
    let map: Map<string, number> = new Map();
    if (this.userData) {
      map = this.userData.reduce((acc, e) => acc.set(e.gender, (acc.get(e.gender) || 0) + 1), new Map());
    }
    map.forEach((value, key) => {
      let formattedKey = this.getFullGenderName(key);
      data.push({
        name: formattedKey,
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
    if (this.userData) {
      map = this.userData.reduce((acc, e) => acc.set(e.ethnic, (acc.get(e.ethnic) || 0) + 1), new Map());
    }
    map.forEach((value, key) => {
      let formattedKey = this.getFullEthnicName(key);
      data.push({
        name: formattedKey,
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

  private initLocationColumnChartOption() {
    let map: Map<string, number> = new Map();
    if (this.userData) {
      map = this.userData.reduce((acc, e) => {
        const zoneName = e.address.zoneName ? e.address.zoneName : "-";
        acc.set(zoneName, (acc.get(zoneName) || 0) + 1);
        return acc;
      }, new Map());
    }

    const data = this.generateDataArr(map);
    const categories = Array.from(map.keys());
    categories.sort();

    this.locationColumnChartOption = {
      chart: {
        type: 'column',
      },
      title: {
        text: 'Location'
      },
      xAxis: {
        categories: categories,
        min: 0,
        max: 5,
        scrollbar: {
          enabled: true
        },
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Number of resident(s)'
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
        name: 'Location',
        data: data
      }]
    }
  }

  private initHealthColumnChartOption() {
    let map: Map<string, number> = new Map();
    if (this.userData) {
      map = this.userData.reduce((acc, e) => {
        const healthModelList: Array<any> = e.healthIssues;
        if (healthModelList) {
          healthModelList.forEach(o => {
            const diseaseName = o.diseaseName;
            if ((this.filterSetting.disease === 'A' || this.filterSetting.disease == o.diseaseId) && o.approvedByUsername != null) {
              acc.set(diseaseName, (acc.get(diseaseName) || 0) + 1);
            }
          })
        }
        return acc;
      }, new Map());
    }

    const data = this.generateDataArr(map);
    const categories = Array.from(map.keys());
    categories.sort();

    this.healthColumnChartOption = {
      chart: {
        type: 'column'
      },
      title: {
        text: 'Health Issue'
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
          text: 'Number of resident(s)'
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
        name: 'Disease',
        data: data
      }]
    }
  }

  private getFullEthnicName(key: string) {
    return this.ethnicUtil.getEthnicFullName(key);
  }

  private getFullGenderName(key: string) {
    return this.genderUtil.getGenderFullName(key);
  }

  private initForm() {
    this.chartSettingForm = this.fb.group({
      graphId: this.fb.control('gender')
    });
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
}
