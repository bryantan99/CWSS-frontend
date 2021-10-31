import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {ResponseModel} from "../models/response-model";
import {environment} from "../../../environments/environment";
import {NzUploadFile} from "ng-zorro-antd/upload";

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {

  private readonly APP_SERVER_URL = environment.apiUrl;
  private readonly GET_ADMINS_PROFILES = this.APP_SERVER_URL + "/admins/profiles";
  private readonly GET_ADMIN_PROFILE = this.APP_SERVER_URL + "/admin/profile";
  private readonly ADD_STAFF = this.APP_SERVER_URL + "/admin";
  private readonly DELETE_STAFF = this.APP_SERVER_URL + "/admin";
  private readonly UPDATE_ADMIN_PROFILE = this.APP_SERVER_URL + "/admin/profile";

  constructor(private http: HttpClient) {
  }

  getAdminUsers(): Observable<ResponseModel<any>> {
    return this.http.get<ResponseModel<any>>(this.GET_ADMINS_PROFILES);
  }

  deleteStaff(username: string): Observable<ResponseModel<any>> {
    const url = this.DELETE_STAFF + "/" + username;
    return this.http.delete<ResponseModel<any>>(url);
  }

  addNewStaff(form: any, fileList: NzUploadFile[]): Observable<ResponseModel<any>> {
    const formData = new FormData();
    if (fileList) {
      fileList.forEach((file: any) => {
        formData.append('files', file);
      });
    }
    formData.append('form', JSON.stringify(form));
    return this.http.post<ResponseModel<any>>(this.ADD_STAFF, formData);
  }

  getProfile(username: string) {
    const params = new HttpParams().set("username", username);
    return this.http.get<ResponseModel<any>>(this.GET_ADMIN_PROFILE, {params: params});
  }

  updateAdmin(form: any, fileList: NzUploadFile[]): Observable<ResponseModel<any>> {
    const formData = new FormData();
    if (fileList) {
      fileList.forEach((file: any) => {
        formData.append('files', file);
      });
    }
    formData.append('form', JSON.stringify(form));
    return this.http.post<ResponseModel<any>>(this.UPDATE_ADMIN_PROFILE, formData);
  }
}
