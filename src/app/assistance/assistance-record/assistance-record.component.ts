import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Location} from "@angular/common";

@Component({
  selector: 'app-assistance-record',
  templateUrl: './assistance-record.component.html'
})
export class AssistanceRecordComponent implements OnInit {

  assistanceId: string;

  constructor(private route: ActivatedRoute,
              private location: Location) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['assistanceId']) {
        this.assistanceId = params['assistanceId'];
        this.getAssistanceRecordDetail();
      } else {
        this.location.back();
      }
    })
  }

  private getAssistanceRecordDetail() {
  }
}
