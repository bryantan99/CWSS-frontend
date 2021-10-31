import {Injectable} from '@angular/core';
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor() {
  }

  private readonly APP_URL = environment.apiUrl;
  private readonly GET_POST_IMG = this.APP_URL + "/image/post";
  private readonly GET_PROFILE_PICTURE = this.APP_URL + "/image/account/profile-pic";

  getPostImg(postId: number, imgName: string): string {
    return this.GET_POST_IMG + "/" + postId.toString(10) + "/" + imgName;
  }

  getProfilePicture(username: string, imageName: string) {
    return this.GET_PROFILE_PICTURE + "/" + username + "/" + imageName;
  }
}
