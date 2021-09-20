import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {ResponseModel} from "../models/response-model";

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {

  private readonly APP_SERVER_URL = "http://localhost:8080";
  private readonly GET_ADMINS_PROFILES = this.APP_SERVER_URL + "/admins/profiles";
  private readonly ADD_STAFF = this.APP_SERVER_URL + "/admin";
  private readonly DELETE_STAFF = this.APP_SERVER_URL + "/admin";

  constructor(private http: HttpClient) {
  }

  getAdminUsers(): Observable<ResponseModel<any>> {
    return this.http.get<ResponseModel<any>>(this.GET_ADMINS_PROFILES);
  }

  deleteStaff(username: string): Observable<ResponseModel<any>> {
    const url = this.DELETE_STAFF + "/" + username;
    return this.http.delete<ResponseModel<any>>(url);
  }

  addNewStaff(form: any): Observable<ResponseModel<any>> {
    return this.http.post<ResponseModel<any>>(this.ADD_STAFF, form);
  }
}
