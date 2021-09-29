import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {CommunityUserTableModel} from "../models/community-user-table-model";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {ResponseModel} from "../models/response-model";

@Injectable({
  providedIn: 'root'
})
export class CommunityUserService {

  readonly API_SERVER_URL = environment.apiUrl;
  readonly GET_COMMUNITY_USERS_TABLE_DATA = this.API_SERVER_URL + "/community-user/get-community-users";
  readonly GET_COMMUNITY_USER_PROFILE = this.API_SERVER_URL + "/community-user/profile";
  private readonly APPROVE_USER_ACCOUNT = this.API_SERVER_URL + "/community-user/approve-user";
  private readonly REJECT_USER_ACCOUNT = this.API_SERVER_URL + '/community-user/reject-user';
  readonly DELETE_COMMUNITY_USER = this.API_SERVER_URL + "/community-user/delete-user";
  readonly UPDATE_COMMUNITY_USER_PROFILE = this.API_SERVER_URL + "/community-user/update-user";

  constructor(private http: HttpClient) {
  }

  getCommunityUsers(): Observable<CommunityUserTableModel[]> {
    return this.http.get<CommunityUserTableModel[]>(this.GET_COMMUNITY_USERS_TABLE_DATA);
  }

  getCommunityUser(username: string): Observable<any> {
    const params = new HttpParams()
      .set("username", username);

    return this.http.get<any>(this.GET_COMMUNITY_USER_PROFILE, {params: params});
  }

  approveAccount(username: string): Observable<ResponseModel<any>> {
    const params = new HttpParams()
      .set("username", username);
    return this.http.get<ResponseModel<any>>(this.APPROVE_USER_ACCOUNT, {params: params});
  }

  deleteCommunityUser(username: string) {
    const url = this.DELETE_COMMUNITY_USER + "/" + username;
    return this.http.delete(url);
  }

  updateProfile(form: any):Observable<any> {
    return this.http.post(this.UPDATE_COMMUNITY_USER_PROFILE, form);
  }

  rejectAccount(username: string): Observable<ResponseModel<any>> {
    const params = new HttpParams()
      .set("username", username);
    return this.http.get<ResponseModel<any>>(this.REJECT_USER_ACCOUNT, {params: params});
  }
}
