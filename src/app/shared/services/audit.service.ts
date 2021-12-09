import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {ResponseModel} from "../models/response-model";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuditService {

  private readonly APP_SERVER_URL = environment.apiUrl;
  private GET_AUDIT_LOGS = this.APP_SERVER_URL + "/audit";


  constructor(private http: HttpClient) {
  }

  getAuditLogs(moduleName?: string): Observable<ResponseModel<any>> {
    let params = new HttpParams();
    if (moduleName) {
      params = params.set("moduleName", moduleName);
    }
    return this.http.get<ResponseModel<any>>(this.GET_AUDIT_LOGS, {params: params});
  }


}
