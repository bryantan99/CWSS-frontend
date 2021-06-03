import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {CommunityUserTableModel} from "../models/community-user-table-model";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CommunityUserService {

  readonly API_SERVER_URL = "http://localhost:8080";
  readonly GET_COMMUNITY_USERS_TABLE_DATA = this.API_SERVER_URL + "/community-user/get-community-users";
  readonly GET_COMMUNITY_USER_PROFILE = this.API_SERVER_URL + "/community-user/view-profile";
  readonly APPROVE_USER_ACCOUNT = this.API_SERVER_URL + "/community-user/approve-user";

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

  approveAccount(username: string) {
    const params = new HttpParams()
      .set("username", username);
    return this.http.get(this.APPROVE_USER_ACCOUNT, {params: params});
  }
}
