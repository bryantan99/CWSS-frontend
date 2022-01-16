import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../auth/auth.service";
import {User} from "../../shared/models/user";
import {AdminUserService} from "../../shared/services/admin-user.service";
import {CommunityUserService} from "../../shared/services/community-user.service";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {NotificationService} from "../../shared/services/notification.service";
import {FormBuilder} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ImageService} from "../../shared/services/image.service";
import {RoleConstant} from "../../shared/constants/role-constant";
import {Location} from "@angular/common";
import {EventData} from "../../shared/models/event-data";
import {EventBusService} from "../../shared/services/event-bus.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {

  currentLoggedInUser: User;
  isAdmin: boolean = false;
  adminProfile: any;
  userProfile: any;
  queryParamUsername: string;
  queryParamAdminUsername: string;
  isLoading: boolean = false;
  isSuperAdmin: boolean = false;
  isOwnerOfProfile: boolean = false;

  constructor(private authService: AuthService,
              private adminService: AdminUserService,
              private communityUserService: CommunityUserService,
              private notificationService: NotificationService,
              private fb: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private imageService: ImageService,
              private location: Location,
              private eventBusService: EventBusService) {
    this.route.queryParams.subscribe(params => {
      if (!params['username'] && !params['adminUsername']) {
        this.location.back();
      } else {
        this.queryParamUsername = params['username'];
        this.queryParamAdminUsername = params['adminUsername'];
      }
    });
    this.authService.user.subscribe(resp => {
      this.currentLoggedInUser = resp;
      this.isAdmin = this.authService.isAdminLoggedIn();
      this.isSuperAdmin = this.authService.hasRole(RoleConstant.ROLE_SUPER_ADMIN);
    });
  }

  ngOnInit(): void {
    this.updateIsOwnerOfProfile();
    if (!this.isAdmin && !this.isOwnerOfProfile) {
      this.location.back();
    }
    this.getProfile();
  }

  private getProfile() {
    this.adminProfile = null;
    this.userProfile = null;
    if (this.queryParamUsername && (this.isAdmin || this.isOwnerOfProfile)) {
      this.getCommunityUserProfile(this.queryParamUsername);
    } else if (this.queryParamAdminUsername && this.isAdmin) {
      this.getAdminProfile(this.queryParamAdminUsername)
    }
  }

  private getAdminProfile(username: string) {
    this.adminService.getProfile(username)
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.adminProfile = resp.data;
          this.isOwnerOfProfile = this.adminProfile.username === this.currentLoggedInUser.username;
        }
      }, error => {
        console.log(error);
        if (error.status === HttpStatusConstant.FORBIDDEN) {
          this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
          this.eventBusService.emit(new EventData('logout', null));
        } else if (error.status === HttpStatusConstant.NOT_FOUND) {
          this.notificationService.createErrorNotification("Requested admin profile was not found.");
          this.location.back();
        } else {
          const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when retrieving profile.";
          this.notificationService.createErrorNotification(msg);
        }
      });
  }

  private getCommunityUserProfile(username: string) {
    this.communityUserService.getCommunityUser(username)
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.userProfile = resp.data;
          this.isOwnerOfProfile = this.userProfile.username === this.currentLoggedInUser.username;
        }
      }, error => {
        if (error.status === HttpStatusConstant.FORBIDDEN) {
          this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
          this.eventBusService.emit(new EventData('logout', null));
        } else if (error.status == HttpStatusConstant.NOT_FOUND) {
          this.notificationService.createErrorNotification("The requested profile is not found.");
          this.location.back();
        } else {
          const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when retrieving profile.";
          this.notificationService.createErrorNotification(msg);
        }
      });
  }

  refreshProfile(data: {username?: string, adminUsername?: string}) {
    if (data && data.username) {
      this.getCommunityUserProfile(data.username);
    } else if (data && data.adminUsername) {
      this.getAdminProfile(data.adminUsername);
    }
  }

  private updateIsOwnerOfProfile() {
    const currentUsername = this.currentLoggedInUser.username;
    this.isOwnerOfProfile = (this.queryParamUsername && this.queryParamUsername === currentUsername) || (this.queryParamAdminUsername && this.queryParamAdminUsername === currentUsername);
  }
}
