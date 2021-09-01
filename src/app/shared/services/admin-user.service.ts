import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

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

  getAdminUsers(): Observable<any> {
    return this.http.get<Observable<any>>(this.GET_ADMINS_PROFILES);
  }

  deleteStaff(username: string): Observable<any> {
    const url = this.DELETE_STAFF + "/" + username;
    return this.http.delete(url);
  }

  addNewStaff(form: any): Observable<any> {
    return this.http.post(this.ADD_STAFF, form);
  }
}
