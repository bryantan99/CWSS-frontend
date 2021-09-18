import {Component, OnInit, ViewChild} from '@angular/core';
import {AdminPostService} from "../../services/admin-post.service";
import {finalize} from "rxjs/operators";
import {AuthService} from "../../../auth/auth.service";
import {NewPostModalComponent} from "../new-post-modal/new-post-modal.component";
import {ImageService} from "../../services/image.service";
import {HttpStatusConstant} from "../../constants/http-status-constant";

@Component({
  selector: 'app-post-feed',
  templateUrl: './post-feed.component.html'
})
export class PostFeedComponent implements OnInit {

  @ViewChild(NewPostModalComponent) newPostModalComponent: NewPostModalComponent;

  adminPost: any[] = [];
  isLoading: boolean = false;
  dummyPhotoUrl: string = "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png";
  isAdminLoggedIn: boolean = false;
  editPostModalIsVisible: boolean = false;

  constructor(private adminPostService: AdminPostService,
              private authService: AuthService,
              private imageService: ImageService) {
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
      }, error => {
        console.log("There's an error when getting admin posts.", error);
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
        console.log("There's an error when deleting new post.", error);
      })
  }

  editPost(postId: number) {
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
}
