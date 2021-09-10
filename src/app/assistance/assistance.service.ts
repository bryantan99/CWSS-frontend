import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {ResponseModel} from "../shared/models/response-model";

@Injectable({
  providedIn: 'root'
})
export class AssistanceService {

  private readonly APP_URL = "http://localhost:8080";

  private readonly FIND_USER_ASSISTANCE_RECORD = this.APP_URL + "/assistance/current-user";
  private readonly ADD_ASSISTANCE_RECORD = this.APP_URL + "/assistance/new-request";
  private readonly DELETE_ASSISTANCE_RECORD = this.APP_URL + "/assistance";

  constructor(private http: HttpClient) {
  }

  findUserAssistanceRecords(username: string): Observable<ResponseModel<any[]>> {
    const param = new HttpParams().set("username", username);
    return this.http.get<ResponseModel<any[]>>(this.FIND_USER_ASSISTANCE_RECORD, {params: param});
  }

  addAssistance(value: any): Observable<ResponseModel<any>> {
    return this.http.post<ResponseModel<any>>(this.ADD_ASSISTANCE_RECORD, value);
  }

  deleteRec(assistanceId: number):Observable<ResponseModel<any>> {
    const url = this.DELETE_ASSISTANCE_RECORD + "/" + assistanceId;
    return this.http.delete<ResponseModel<any>>(url);
  }
}
