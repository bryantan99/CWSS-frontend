import {Component, OnInit, ViewChild} from '@angular/core';
import {AssistanceService} from "../assistance.service";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {AuthService} from "../../auth/auth.service";
import {NotificationService} from "../../shared/services/notification.service";
import {finalize} from "rxjs/operators";
import {AssistanceFormComponent} from "../assistance-form/assistance-form.component";
import {Router} from "@angular/router";
import {User} from "../../shared/models/user";
import {GeneralConstant} from "../../shared/constants/general-constant";

@Component({
  selector: 'app-assistance-mngmt',
  templateUrl: './assistance-mngmt.component.html'
})
export class AssistanceMngmtComponent implements OnInit {
  @ViewChild(AssistanceFormComponent) assistanceFormComponent: AssistanceFormComponent;

  user: User;
  isAdmin: boolean = false;

  listOfAssistanceRecord: any[] = [];
  pageSize: number = 10;
  pageIndex: number = 1;
  assistanceDetailIsVisible: boolean = false;
  isEdit: boolean = false;
  readonly nzTitle = 'Request New Assistance';
  isLoading: boolean = false;
  readonly DATE_FORMAT = GeneralConstant.NZ_DATE_FORMAT;

  constructor(private assistanceService: AssistanceService,
              private authService: AuthService,
              private notificationService: NotificationService,
              private router: Router) {
    this.authService.user.subscribe(resp => {
      this.user = resp;
      this.isAdmin = this.authService.isAdminLoggedIn();
    });
  }

  ngOnInit(): void {
    this.getAssistanceRecords();
  }

  openAddAssistanceModal() {
    this.isEdit = true;
    this.assistanceDetailIsVisible = true;
  }

  cancelNewAssistance() {
    this.assistanceDetailIsVisible = false;
  }

  submitNewAssistance() {
    this.assistanceFormComponent.submit();
  }

  private getAssistanceRecords() {
    this.isLoading = true;
    if (this.isAdmin) {
      this.findAssistanceRecords();
    } else {
      this.findUserAssistanceRecord();
    }
  }

  private findAssistanceRecords() {
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
        this.listOfAssistanceRecord = [];
        this.notificationService.createErrorNotification("There\'s an error when retrieving all assistance requests.");
        console.log(error.error);
      });
  }

  private findUserAssistanceRecord() {
    this.assistanceService.findUserAssistanceRecords(this.user.username)
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
    this.router.navigate(['/assistance/detail'], {queryParams: {assistanceId: assistanceId}});
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
          this.notificationService.createSuccessNotification("Assistance request ID : " + assistanceId + " has been deleted.");
          this.findUserAssistanceRecord();
        }
      }, error => {
        this.notificationService.createErrorNotification("There\'s an error when deleting assistance request.");
        console.log(error.error);
      })
  }
}
