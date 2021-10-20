import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {ResponseModel} from "../models/response-model";

@Injectable({
  providedIn: 'root'
})
export class CommunityUserService {

  private readonly API_SERVER_URL = environment.apiUrl;
  private readonly GET_COMMUNITY_USERS = this.API_SERVER_URL + "/community-user";
  private readonly GET_COMMUNITY_USER_PROFILE = this.API_SERVER_URL + "/community-user/profile";
  private readonly APPROVE_USER_ACCOUNT = this.API_SERVER_URL + "/community-user/approve-user";
  private readonly REJECT_USER_ACCOUNT = this.API_SERVER_URL + '/community-user/reject-user';
  private readonly DELETE_COMMUNITY_USER = this.API_SERVER_URL + "/community-user/delete-user";
  private readonly UPDATE_COMMUNITY_USER_PROFILE = this.API_SERVER_URL + "/community-user/update-user";

  constructor(private http: HttpClient) {
  }

  getCommunityUsers(name?: string,
                    nric?: string,
                    gender?: string,
                    ethnic?: string,
                    diseaseId?: string,
                    address?: boolean,
                    occupation?: boolean,
                    healthIssue?: boolean): Observable<ResponseModel<any>> {
    let params = new HttpParams();
    if (name) {
      params = params.set("name", name);
    }
    if (nric) {
      params = params.set("nric", nric);
    }
    if (gender && gender != 'A') {
      params = params.set("gender", gender);
    }
    if (ethnic && ethnic != 'A') {
      params = params.set("ethnic", ethnic);
    }
    if (diseaseId && diseaseId != 'A') {
      params = params.set("diseaseId", diseaseId);
    }
    if (address) {
      params = params.set("address", "Y");
    }
    if (occupation) {
      params = params.set("occupation", "Y");
    }
    if (healthIssue) {
      params = params.set("healthIssue", "Y");
    }
    return this.http.get<ResponseModel<any>>(this.GET_COMMUNITY_USERS, {params: params});
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
