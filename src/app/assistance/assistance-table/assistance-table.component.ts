import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Router} from "@angular/router";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {AssistanceService} from "../assistance.service";
import {NotificationService} from "../../shared/services/notification.service";
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

  constructor(private router: Router,
              private assistanceService: AssistanceService,
              private notificationService: NotificationService) {
  }

  ngOnInit(): void {
  }

  viewRec(assistanceId: number) {
    this.router.navigate(['/assistance/detail'], {queryParams: {assistanceId: assistanceId}});
  }

  deleteRec(assistanceId: number) {
    this.assistanceService.deleteRec(assistanceId)
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.notificationService.createSuccessNotification("Assistance request ID : " + assistanceId + " has been deleted.");
          this.refreshTableRecords();
        }
      }, error => {
        const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when deleting assistance request.";
        this.notificationService.createErrorNotification(msg);
      })
  }

  private refreshTableRecords() {
    this.refreshTableEventEmitter.emit(true);
  }
}
