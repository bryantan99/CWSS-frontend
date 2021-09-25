import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor() {
  }

  private readonly APP_URL = "http://localhost:8080";
  private readonly GET_POST_IMG = this.APP_URL + "/image/post";

  getPostImg(postId: number, imgName: string): string {
    return this.GET_POST_IMG + "/" + postId.toString(10) + "/" + imgName;
  }


}
