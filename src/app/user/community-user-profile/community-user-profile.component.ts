import {Component, Input, OnInit} from '@angular/core';
import {CommunityUserService} from "../../shared/services/community-user.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {finalize} from "rxjs/operators";
import {NotificationService} from "../../shared/services/notification.service";

@Component({
  selector: 'app-community-user-profile',
  templateUrl: './community-user-profile.component.html'
})
export class CommunityUserProfileComponent implements OnInit {

  @Input('username') username: string;
  userProfile: any;
  healthTablePageSize: number = 10;
  healthTablePageIndex: number = 1;
  isLoading: boolean = false;

  constructor(private route: ActivatedRoute,
              private location: Location,
              private router: Router,
              private communityUserService: CommunityUserService,
              private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['username']) {
        this.username = params['username'];
        this.getCommunityUserProfile();
      } else {
        this.location.back();
      }
    })
  }

  getCommunityUserProfile() {
    this.isLoading = true;
    this.communityUserService.getCommunityUser(this.username)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(resp => {
        this.userProfile = resp ? resp : null;
      }, error => {
        this.notificationService.createErrorNotification("There's an error when retrieving user profile.")
        console.log(error);
        this.userProfile = null;
      })
  }

  approveAccount() {
    this.communityUserService.approveAccount(this.username)
      .subscribe(resp => {
        this.notificationService.createSuccessNotification("User account has been approved.");
        this.getCommunityUserProfile();
      }, error => {
        this.notificationService.createErrorNotification("There\'s an error when approving user account.");
        console.log(error);
      })
  }

  rejectAccount() {
    this.communityUserService.rejectAccount(this.username).subscribe(resp => {
      if (resp) {
        this.notificationService.createSuccessNotification("User account has been rejected.");
        this.router.navigate(['/community-user']);
      }
    }, error => {
      this.notificationService.createErrorNotification("There\'s an error when rejecting user account.");
      console.log(error);
    })
  }
}
