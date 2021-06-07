import {Component, OnInit, ViewChild} from '@angular/core';
import {PostFeedComponent} from "../../shared/components/post-feed/post-feed.component";
import {AuthService} from "../../auth/auth.service";

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html'
})
export class HomepageComponent implements OnInit {

  @ViewChild(PostFeedComponent) postFeedComponent: PostFeedComponent;

  nzSelectedIndex = 0;
  newPostModalIsVisible: boolean = false;
  isAdminLoggedIn: boolean = false;

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    this.isAdminLoggedIn = this.authService.isAdminLoggedIn();
  }

  openNewPostModal() {
    this.newPostModalIsVisible = true;
  }

  modalVisibleHasChange(isVisible: boolean) {
    this.newPostModalIsVisible = isVisible;
  }

  postListHasChanges(hasNewPost: boolean) {
    if (hasNewPost) {
      this.postFeedComponent.getAdminPosts();
    }
  }
}
