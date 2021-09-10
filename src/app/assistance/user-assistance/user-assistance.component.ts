import {Component, OnInit, ViewChild} from '@angular/core';
import {AssistanceService} from "../assistance.service";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {AuthService} from "../../auth/auth.service";
import {NotificationService} from "../../shared/services/notification.service";
import {finalize} from "rxjs/operators";
import {AssistanceDetailComponent} from "../assistance-detail/assistance-detail.component";

@Component({
  selector: 'app-community-user-assistance',
  templateUrl: './user-assistance.component.html'
})
export class UserAssistanceComponent implements OnInit {
  @ViewChild(AssistanceDetailComponent) assistanceDetailComponent: AssistanceDetailComponent;

  listOfAssistanceRecord: any[] = [];
  pageSize: number = 10;
  pageIndex: number = 1;
  assistanceDetailIsVisible: boolean = false;
  isEdit: boolean = false;
  nzTitle: string;
  username: string;
  isLoading: boolean = false;

  constructor(private assistanceService: AssistanceService,
              private authService: AuthService,
              private notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.authService.getCurrentLoggedInUsername().subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK && resp.data) {
        this.username = resp.data;
        this.findUserAssistanceRecord();
      }
    }, error => {
      this.notificationService.createErrorNotification("There\'s an error when retrieving current logged in user.");
      console.log(error.error);
    });
  }

  openAddAssistanceModal() {
    this.isEdit = true;
    this.nzTitle = "Request New Assistance"
    this.assistanceDetailIsVisible = true;
  }

  cancelNewAssistance() {
    this.assistanceDetailIsVisible = false;
  }

  submitNewAssistance() {
    this.assistanceDetailComponent.submit();
  }

  private findUserAssistanceRecord() {
    this.isLoading = true;
    this.assistanceService.findUserAssistanceRecords(this.username)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.listOfAssistanceRecord = resp.data;
        }
      }, error => {
        this.isLoading = false;
        this.listOfAssistanceRecord = []
        this.notificationService.createErrorNotification("There\'s an error when retrieving user assistance records.");
        console.log(error.error);
      })
  }

  viewRec(assistanceId: number) {
    this.isEdit = false;
    this.nzTitle = "Assistance Record [ID: " + assistanceId.toString(10) + "]";
    this.assistanceDetailIsVisible = true;
  }

  modalVisibleHasChange(data: any) {
    this.assistanceDetailIsVisible = data.modalIsVisible;
  }

  listHasChange(data: any) {
    if (data.refreshList) {
      this.findUserAssistanceRecord();
    }
  }

  deleteRec(assistanceId: number) {
    this.assistanceService.deleteRec(assistanceId)
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.findUserAssistanceRecord();
        }
      }, error => {
        this.notificationService.createErrorNotification("There\'s an error when deleting assistance request.");
        console.log(error.error);
      })
  }
}
