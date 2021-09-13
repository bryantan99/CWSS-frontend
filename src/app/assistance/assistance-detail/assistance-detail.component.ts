import {Component, OnInit} from '@angular/core';
import {AssistanceService} from "../assistance.service";
import {ActivatedRoute} from "@angular/router";
import {Location} from "@angular/common";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {NotificationService} from "../../shared/services/notification.service";
import {finalize} from "rxjs/operators";
import {AuthService} from "../../auth/auth.service";

@Component({
  selector: 'app-assistance-detail',
  templateUrl: './assistance-detail.component.html'
})
export class AssistanceDetailComponent implements OnInit {

  assistanceId: number;
  assistanceRecord: any;
  isLoading: boolean = false;
  isAdmin: boolean = false;
  commentDrawerIsVisible: boolean = false;

  constructor(private assistanceService: AssistanceService,
              private notificationService: NotificationService,
              private route: ActivatedRoute,
              private location: Location,
              private authService: AuthService) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['assistanceId']) {
        this.assistanceId = params['assistanceId'];
        this.getAssistanceDetail();
      } else {
        this.location.back();
      }
    });
    this.isAdmin = this.authService.isAdminLoggedIn();
  }

  private getAssistanceDetail() {
    this.isLoading = true;
    this.assistanceService.findAssistanceRecordDetail(this.assistanceId)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK && resp.data) {
          this.assistanceRecord = resp.data;
        }
      }, error => {
        this.isLoading = false;
        this.notificationService.createErrorNotification("There\'s an error when retrieving assistance record detail.");
        console.log(error.error);
      });
  }

  navigateToPreviousPage() {
    this.location.back();
  }

  deleteRec(assistanceId: any) {
    this.assistanceService.deleteRec(assistanceId).subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.notificationService.createSuccessNotification("Assistance request ID : " + assistanceId + " has been deleted.");
        this.location.back();
      }
    }, error => {
      this.notificationService.createErrorNotification("There\'s an error when deleting assistance request.");
      console.log(error.error);
    })
  }

  closeCommentDrawer() {
    this.commentDrawerIsVisible = false;
  }

  openCommentDrawer() {
    this.commentDrawerIsVisible = true;
  }
}
