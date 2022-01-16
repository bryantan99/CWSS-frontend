import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Router} from "@angular/router";
import {GeneralConstant} from "../../shared/constants/general-constant";

@Component({
  selector: 'app-assistance-table',
  templateUrl: './assistance-table.component.html'
})
export class AssistanceTableComponent implements OnInit {

  @Input() nzData: any[] = [];
  @Input() isLoading: boolean = false;
  @Input() adminInChargeColumnIsVisible: boolean = false;
  @Output() refreshTableEventEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  pageIndex: number = 1;
  pageSize: number = 10;
  readonly DATE_FORMAT = GeneralConstant.NZ_DATE_FORMAT;

  constructor(private router: Router) {
  }

  ngOnInit(): void {
  }

  viewRec(assistanceId: number) {
    this.router.navigate(['/assistance/detail'], {queryParams: {assistanceId: assistanceId}});
  }
}
