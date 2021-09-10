import {Component, OnInit} from '@angular/core';
import {AssistanceRecordModel} from "../../shared/models/assistance-record-model";
import {AssistanceService} from "../assistance.service";
import {AuthService} from "../../auth/auth.service";
import {NotificationService} from "../../shared/services/notification.service";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {finalize} from "rxjs/operators";

@Component({
  selector: 'app-admin-assistance',
  templateUrl: './admin-assistance.component.html'
})
export class AdminAssistanceComponent implements OnInit {

  listOfAssistanceRecord: AssistanceRecordModel[] = [];
  pageIndex: number = 1;
  pageSize: number = 10;
  isLoading: boolean = false;

  constructor(private assistanceService: AssistanceService,
              private authService: AuthService,
              private notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.getAssistanceRecords();
  }

  private getAssistanceRecords() {
    this.isLoading = true;
    this.assistanceService.findAllAssistanceRecords()
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.listOfAssistanceRecord = resp.data ? resp.data : [];
        }
      }, error => {
        this.isLoading = false;
        this.notificationService.createErrorNotification("There\'s an error when retrieving all assistance requests.");
        console.log(error.error);
      });
  }
}
