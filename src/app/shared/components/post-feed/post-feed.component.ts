import {Component, OnInit} from '@angular/core';
import {AdminPostService} from "../../services/admin-post.service";
import {finalize} from "rxjs/operators";
import {AuthService} from "../../../auth/auth.service";

@Component({
  selector: 'app-post-feed',
  templateUrl: './post-feed.component.html'
})
export class PostFeedComponent implements OnInit {

  adminPost: any[] = [];
  isLoading: boolean = false;
  dummyPhotoUrl: string = "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png";
  hasUserLoggedIn: boolean = false;

  constructor(private adminPostService: AdminPostService,
              private authService: AuthService) {
  }

  ngOnInit(): void {
    this.getAdminPosts();
    this.hasUserLoggedIn = this.authService.isUserLoggedIn();
  }

  getAdminPosts() {
    this.adminPost = [];
    this.isLoading = true;
    this.adminPostService.getAdminPost()
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(resp => {
        this.adminPost = resp ? resp : [];
      }, error => {
        console.log("There's an error when getting admin posts.", error);
        this.isLoading = false;
      })

  }

  deletePost(postId: number) {
    this.adminPostService.deleteAdminPost(postId)
      .subscribe(resp => {
        this.getAdminPosts();
      }, error => {
        console.log("There's an error when deleting new post.", error);
      })
  }
}
