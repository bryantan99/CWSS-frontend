import {Component, Input, OnInit} from '@angular/core';

import {AssistanceService} from "../assistance.service";
import {NotificationService} from "../../shared/services/notification.service";
import {finalize} from "rxjs/operators";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {GeneralConstant} from "../../shared/constants/general-constant";
import {EventBusService} from "../../shared/services/event-bus.service";
import {EventData} from "../../shared/models/event-data";

@Component({
  selector: 'app-assistance-comment',
  templateUrl: './assistance-comment.component.html'
})
export class AssistanceCommentComponent implements OnInit {
  @Input() assistanceId: number;
  commentList: any = [];
  commentDisplayList: any = [];
  user = {
    author: 'Han Solo',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  };
  inputValue = '';
  isSubmitting: boolean = false;
  isLoading: boolean = false;
  pageIndex: number = 1;
  pageSize: number = 5;
  readonly DATE_FORMAT = GeneralConstant.NZ_DATE_FORMAT;

  constructor(private assistanceService: AssistanceService,
              private notificationService: NotificationService,
              private eventBusService: EventBusService) {
  }

  ngOnInit(): void {
    this.findComments();
  }

  handleSubmit(): void {
    this.isSubmitting = true;
    const form: { commentDesc: string, assistanceId: number } = {
      commentDesc: this.inputValue,
      assistanceId: this.assistanceId
    };
    this.assistanceService.addComment(form)
      .pipe(finalize(() => {
        this.isSubmitting = false;
      }))
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.findComments();
          this.inputValue = "";
        }
      }, error => {
        this.isSubmitting = false;
        if (error.status === HttpStatusConstant.FORBIDDEN) {
          this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
          this.eventBusService.emit(new EventData('logout', null));
        } else {
          this.notificationService.createErrorNotification("There\'s an error when adding new comment.");
        }
        console.log(error.error);
      });
  }

  findComments() {
    this.assistanceService.findComments(this.assistanceId)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.commentList = resp.data ? resp.data : [];
          this.initCommentDisplayList();
        }
      }, error => {
        this.isLoading = false;
        this.commentList = [];
        console.log(error.error);
        if (error.status === HttpStatusConstant.FORBIDDEN) {
          this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
          this.eventBusService.emit(new EventData('logout', null));
        } else {
          this.notificationService.createErrorNotification("There\'s an error when retrieving comment list.");
        }
      })
  }

  initCommentDisplayList() {
    const startPoint = (this.pageIndex - 1) * this.pageSize;
    const endPoint = startPoint + this.pageSize;
    this.commentDisplayList = this.commentList.slice(startPoint, endPoint);
  }
}
