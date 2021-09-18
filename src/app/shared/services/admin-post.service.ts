import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {NzUploadFile} from "ng-zorro-antd/upload";
import {ResponseModel} from "../models/response-model";

@Injectable({
  providedIn: 'root'
})
export class AdminPostService {

  private apiServerUrl = 'http://localhost:8080';

  GET_ADMIN_POST = this.apiServerUrl + "/post/get-admin-posts";
  ADD_ADMIN_POST = this.apiServerUrl + "/post/add-admin-post";
  private readonly DELETE_ADMIN_POST = this.apiServerUrl + "/post";
  readonly GET_POST = this.apiServerUrl + "/post/get-post";
  readonly UPDATE_POST = this.apiServerUrl + "/post/update-post";

  constructor(private http:HttpClient) { }

  addAdminPost(newPostForm: any, fileList?: NzUploadFile[]):Observable<any> {
    const formData = new FormData();

    if (fileList) {
      fileList.forEach((file: any) => {
        formData.append('files', file);
      });
    }
    formData.append('form', JSON.stringify(newPostForm));

    return this.http.post(this.ADD_ADMIN_POST, formData);
  }

  getAdminPost():Observable<any> {return this.http.get(this.GET_ADMIN_POST);}

  deleteAdminPost(postId: number):Observable<ResponseModel<any>> {
    const url = this.DELETE_ADMIN_POST + "/" + postId;
    return this.http.delete<ResponseModel<any>>(url);
  }

  getOneAdminPost(postId: number) {
    const params = new HttpParams().set("postId", postId.toString(10));
    return this.http.get(this.GET_POST, {params: params});
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
