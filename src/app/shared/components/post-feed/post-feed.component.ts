import {Component, OnInit, ViewChild} from '@angular/core';
import {AdminPostService} from "../../services/admin-post.service";
import {finalize} from "rxjs/operators";
import {AuthService} from "../../../auth/auth.service";
import {NewPostModalComponent} from "../new-post-modal/new-post-modal.component";
import {ImageService} from "../../services/image.service";
import {HttpStatusConstant} from "../../constants/http-status-constant";
import {User} from "../../models/user";
import {EventData} from "../../models/event-data";
import {NotificationService} from "../../services/notification.service";
import {EventBusService} from "../../services/event-bus.service";

@Component({
  selector: 'app-post-feed',
  templateUrl: './post-feed.component.html'
})
export class PostFeedComponent implements OnInit {

  @ViewChild(NewPostModalComponent) newPostModalComponent: NewPostModalComponent;

  adminPost: any[] = [];
  isLoading: boolean = false;
  isAdminLoggedIn: boolean = false;
  editPostModalIsVisible: boolean = false;
  user: User;
  isAdmin: boolean = false;
  nzEdit: boolean = false;

  constructor(private adminPostService: AdminPostService,
              private authService: AuthService,
              private imageService: ImageService,
              private notificationService: NotificationService,
              private eventBusService: EventBusService) {
    this.authService.user.subscribe(resp => {
      this.user = resp;
      this.isAdmin = this.authService.isAdminLoggedIn();
    })
  }

  ngOnInit(): void {
    this.getAdminPosts();
    this.isAdminLoggedIn = this.authService.isAdminLoggedIn();
  }

  getAdminPosts() {
    this.adminPost = [];
    this.isLoading = true;
    this.adminPostService.getPosts()
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.adminPost = resp.data ? resp.data : [];
        }
      }, () => {
        this.notificationService.createErrorNotification("There\'s an error when getting admin posts.");
        this.isLoading = false;
      })
  }

  deletePost(postId: number) {
    this.adminPostService.deleteAdminPost(postId)
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.getAdminPosts();
        }
      }, error => {
        if (error.status === HttpStatusConstant.FORBIDDEN) {
          this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
          this.eventBusService.emit(new EventData('logout', null));
        } else {
          this.notificationService.createErrorNotification("There's an error when deleting new post.");
        }
      })
  }

  editPost(postId: number) {
    this.nzEdit = true;
    this.newPostModalComponent.editPost(postId);
  }

  modalVisibleHasChange(isVisible: boolean) {
    this.editPostModalIsVisible = isVisible;
  }

  postListHasChanges(hasChange: boolean) {
    if (hasChange) {
      this.getAdminPosts();
    }
  }

  getPostImg(img: any) {
    return this.imageService.getPostImg(img.postId, img.mediaDirectory);
  }

  openNewPostModal() {
    this.nzEdit = false;
    this.editPostModalIsVisible = true;
  }

  getProfilePicture(adminBean: any) {
    return this.imageService.getProfilePicture(adminBean.username, adminBean.profilePicDirectory);
  }
}
