import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {ResponseModel} from "../shared/models/response-model";
import {environment} from "../../environments/environment";
import {AssistanceRequestFormModel} from "../shared/models/assistance-request-form-model";
import {NzUploadFile} from "ng-zorro-antd/upload";

@Injectable({
  providedIn: 'root'
})
export class AssistanceService {

  private readonly APP_URL = environment.apiUrl;

  private readonly FIND_USER_ASSISTANCE_RECORD = this.APP_URL + "/assistance/current-user";
  private readonly FIND_ALL_ASSISTANCE_RECORD = this.APP_URL + "/assistance";
  private readonly ADD_ASSISTANCE_RECORD = this.APP_URL + "/assistance/new-request";
  private readonly DELETE_ASSISTANCE_RECORD = this.APP_URL + "/assistance";
  private readonly GET_ASSISTANCE_RECORD_DETAIL = this.APP_URL + "/assistance/assistanceId/detail";
  private readonly GET_ASSISTANCE_COMMENTS: string = this.APP_URL + "/assistance/assistanceId/comment";
  private readonly ADD_ASSISTANCE_COMMENT: string = this.APP_URL + "/assistance/comment";
  private readonly UPDATE_ASSISTANCE_RECORD = this.APP_URL + "/assistance/update";
  private readonly FIND_PENDING_ASSISTANCE_REQUESTS = this.APP_URL + "/assistance/pending";
  private readonly GET_HANDLED_ASSISTANCE_RECORDS = this.APP_URL + "/assistance/handled";
  private readonly REJECT_ASSISTANCE_REQUEST = this.APP_URL + "/assistance/reject";
  private readonly DELETE_ASSISTANCE_CATEGORY = this.APP_URL + "/assistance/category";
  private readonly ADD_ASSISTANCE_CATEGORY = this.APP_URL + "/assistance/category";
  private readonly UPDATE_ASSISTANCE_CATEGORY = this.APP_URL + "/assistance/category/update";

  constructor(private http: HttpClient) {
  }

  getPendingAssistanceRecords(assistanceId?: number): Observable<ResponseModel<any>> {
    let params = new HttpParams();
    if (assistanceId) {
      params = params.set("assistanceId", assistanceId.toString(10));
    }
    return this.http.get<ResponseModel<any>>(this.FIND_PENDING_ASSISTANCE_REQUESTS, {params: params});
  }

  findUserAssistanceRecords(username: string, assistanceId?: number, title?: string, status?: string): Observable<ResponseModel<any[]>> {
    let param = new HttpParams().set("username", username);
    if (assistanceId) {
      param = param.set("assistanceId", assistanceId.toString(10));
    }
    if (title) {
      param = param.set("title", title);
    }
    if (status && status != 'A') {
      param = param.set("status", status);
    }
    return this.http.get<ResponseModel<any[]>>(this.FIND_USER_ASSISTANCE_RECORD, {params: param});
  }

  addAssistance(form: AssistanceRequestFormModel): Observable<ResponseModel<any>> {
    return this.http.post<ResponseModel<any>>(this.ADD_ASSISTANCE_RECORD, form);
  }

  deleteRec(assistanceId: number): Observable<ResponseModel<any>> {
    const url = this.DELETE_ASSISTANCE_RECORD + "/" + assistanceId;
    return this.http.delete<ResponseModel<any>>(url);
  }

  findAssistanceRecordDetail(assistanceId: number): Observable<ResponseModel<any>> {
    const url = this.GET_ASSISTANCE_RECORD_DETAIL.replace("assistanceId", assistanceId.toString(10));
    return this.http.get<ResponseModel<any>>(url);
  }

  findAllAssistanceRecords(queryForm?: { assistanceId?: number, categoryId?: number | string, title?: string, status?: string, nric?: string, adminUsername?: string}): Observable<ResponseModel<any[]>> {
    let params = new HttpParams();
    if (queryForm.assistanceId) {
      params = params.set("assistanceId", queryForm.assistanceId.toString(10));
    }
    if (queryForm.categoryId && queryForm.categoryId != 'A') {
      params = params.set("categoryId", queryForm.categoryId.toString(10));
    }
    if (queryForm.title) {
      params = params.set("title", queryForm.title);
    }
    if (queryForm.status && queryForm.status != 'A') {
      params = params.set("status", queryForm.status);
    }
    if (queryForm.nric) {
      params = params.set("nric", queryForm.nric);
    }
    if (queryForm.adminUsername) {
      params = params.set("adminUsername", queryForm.adminUsername);
    }
    return this.http.get<ResponseModel<any[]>>(this.FIND_ALL_ASSISTANCE_RECORD, {params: params});
  }

  addComment(form: { commentDesc: string, assistanceId: number }, fileList: NzUploadFile[]): Observable<ResponseModel<any>> {
    const formData = new FormData();
    if (fileList) {
      fileList.forEach((file: any) => {
        formData.append('files', file);
      });
    }
    formData.append('form', JSON.stringify(form));
    return this.http.post<ResponseModel<any>>(this.ADD_ASSISTANCE_COMMENT, formData);
  }

  findComments(assistanceId: number): Observable<ResponseModel<any[]>> {
    const url = this.GET_ASSISTANCE_COMMENTS.replace("assistanceId", assistanceId.toString(10));
    return this.http.get<ResponseModel<any>>(url);
  }

  updateRecord(form: any): Observable<ResponseModel<any>> {
    return this.http.post<ResponseModel<any>>(this.UPDATE_ASSISTANCE_RECORD, form);
  }

  getAdminHandledAssistanceRecords(assistanceId?: number, title?: string, status?: string, username?: string): Observable<ResponseModel<any>> {
    let params = new HttpParams();
    if (assistanceId) {
      params = params.set("assistanceId", assistanceId.toString(10));
    }
    if (title) {
      params = params.set("title", title);
    }
    if (status && status !== 'A') {
      params = params.set("status", status);
    }
    if (username) {
      params = params.set("username", username);
    }
    return this.http.get<ResponseModel<any>>(this.GET_HANDLED_ASSISTANCE_RECORDS, {params: params});
  }

  rejectAssistance(form: any): Observable<ResponseModel<any>> {
    return this.http.post<ResponseModel<any>>(this.REJECT_ASSISTANCE_REQUEST, form);
  }

  deleteCategory(categoryId: number): Observable<ResponseModel<any>> {
    const url = this.DELETE_ASSISTANCE_CATEGORY + "/" + categoryId;
    return this.http.delete<ResponseModel<any>>(url);
  }

  addCategory(form: {categoryId?: number, categoryName: string}): Observable<ResponseModel<any>> {
    return this.http.post<ResponseModel<any>>(this.ADD_ASSISTANCE_CATEGORY, form);
  }

  updateCategory(form: {categoryId?: number, categoryName: string}): Observable<ResponseModel<any>> {
    return this.http.post<ResponseModel<any>>(this.UPDATE_ASSISTANCE_CATEGORY, form);
  }
}
