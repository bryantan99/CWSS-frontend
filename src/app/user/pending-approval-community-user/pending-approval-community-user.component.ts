import {Component, OnInit} from '@angular/core';
import {CommunityUserService} from "../../shared/services/community-user.service";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {finalize} from "rxjs/operators";
import {NotificationService} from "../../shared/services/notification.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {EventData} from "../../shared/models/event-data";
import {EventBusService} from "../../shared/services/event-bus.service";

@Component({
    selector: 'app-pending-approval-community-user',
    templateUrl: './pending-approval-community-user.component.html'
})
export class PendingApprovalCommunityUserComponent implements OnInit {
    isLoading: boolean = false;
    pendingUserList: any[] = [];
    pageIndex: number = 1;
    pageSize: number = 10
    queryForm: FormGroup;

    constructor(private communityUserService: CommunityUserService,
                private notificationService: NotificationService,
                private eventBusService: EventBusService,
                private fb: FormBuilder) {
    }

    ngOnInit(): void {
        this.initQueryForm();
        this.getPendingApprovalCommunityUsers();
    }

    public getPendingApprovalCommunityUsers() {
        this.isLoading = true;
        this.communityUserService.getPendingApprovalCommunityUsers(this.queryForm.controls['nric'].value)
            .pipe(finalize(() => {
                this.isLoading = false;
            }))
            .subscribe(resp => {
                if (resp && resp.status === HttpStatusConstant.OK) {
                    this.pendingUserList = resp.data ? resp.data : [];
                }
            }, error => {
                this.isLoading = false;
                this.pendingUserList = [];

                if (error.status === HttpStatusConstant.FORBIDDEN) {
                    this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
                    this.eventBusService.emit(new EventData('logout', null));
                } else {
                    const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when retrieving community user(s) that are pending approval.";
                    this.notificationService.createErrorNotification(msg);
                }
            })
    }

    private initQueryForm() {
        this.queryForm = this.fb.group({
            nric: ['']
        })
    }
}
