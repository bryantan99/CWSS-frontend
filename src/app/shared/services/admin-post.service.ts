import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {NzUploadFile} from "ng-zorro-antd/upload";
import {ResponseModel} from "../models/response-model";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AdminPostService {

  private readonly APP_URL = environment.apiUrl;

  private readonly GET_POSTS = this.APP_URL + "/post";
  private readonly GET_POST = this.APP_URL + "/post/postId";
  private readonly ADD_POST = this.APP_URL + "/post/new";
  private readonly DELETE_POST = this.APP_URL + "/post/postId";
  private readonly UPDATE_POST = this.APP_URL + "/post/update";

  constructor(private http: HttpClient) {
  }

  addAdminPost(newPostForm: any, fileList?: NzUploadFile[]): Observable<any> {
    const formData = new FormData();

    if (fileList) {
      fileList.forEach((file: any) => {
        formData.append('files', file);
      });
    }
    formData.append('form', JSON.stringify(newPostForm));

    return this.http.post(this.ADD_POST, formData);
  }

  getPosts(): Observable<ResponseModel<any>> {
    return this.http.get<ResponseModel<any>>(this.GET_POSTS);
  }

  deleteAdminPost(postId: number): Observable<ResponseModel<any>> {
    const url = this.DELETE_POST.replace("postId", postId.toString(10));
    return this.http.delete<ResponseModel<any>>(url);
  }

  getPost(postId: number): Observable<ResponseModel<any>> {
    const url = this.GET_POST.replace("postId", postId.toString(10));
    return this.http.get<ResponseModel<any>>(url);
  }

  updatePost(form: any, fileList: NzUploadFile[]): Observable<any> {
    const formData = new FormData();

    if (fileList) {
      fileList.forEach((file: any) => {
        formData.append('files', file);
      });
    }
    formData.append('form', JSON.stringify(form));

    return this.http.post(this.UPDATE_POST, formData);
  }
}
