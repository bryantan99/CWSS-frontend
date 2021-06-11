import { Injectable } from '@angular/core';
import {NzNotificationService} from "ng-zorro-antd/notification";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private nzNotificationService: NzNotificationService) { }

  createSuccessNotification(bodyMsg: string, title?: string) {
    title = title ? title : 'Success';
    this.nzNotificationService.success(title, bodyMsg);
  }

  createWarningNotification(bodyMsg: string, title?: string) {
    title = title ? title : 'Warning';
    this.nzNotificationService.warning(title, bodyMsg);
  }

  createInfoNotification(bodyMsg: string, title?: string) {
    title = title ? title : 'Warning';
    this.nzNotificationService.info(title, bodyMsg);
  }

  createErrorNotification(bodyMsg: string, title?: string) {
    title = title ? title : 'Error';
    this.nzNotificationService.error(title, bodyMsg);
  }
}
