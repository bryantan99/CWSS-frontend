import {Component, Input, OnInit} from '@angular/core';
import {CommunityUserService} from "../../shared/services/community-user.service";
import {ActivatedRoute} from "@angular/router";
import {Location} from "@angular/common";

@Component({
  selector: 'app-community-user-profile',
  templateUrl: './community-user-profile.component.html'
})
export class CommunityUserProfileComponent implements OnInit {

  @Input('username') username: string;
  userProfile: any;

  constructor(private route: ActivatedRoute,
              private location: Location,
              private communityUserService: CommunityUserService) { }

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
    this.communityUserService.getCommunityUser(this.username).subscribe(resp => {
      this.userProfile = resp ? resp : null;
    }, error => {
      console.log("There's an error when retrieving " + this.username + "'s profile.", error);
      this.userProfile = null;
    })
  }

  approveAccount() {
    this.communityUserService.approveAccount(this.username).subscribe(resp => {
      this.getCommunityUserProfile();
    }, error => {
      console.log(error);
    })
  }

  rejectAccount() {

  }
}
