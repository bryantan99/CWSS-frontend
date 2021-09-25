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

  getPostImg(postId: number, imgName: string): string {
    return this.GET_POST_IMG + "/" + postId.toString(10) + "/" + imgName;
  }


}
