import {Injectable} from '@angular/core';
import {ResponseModel} from "../models/response-model";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {NzUploadFile} from "ng-zorro-antd/upload";

@Injectable({
  providedIn: 'root'
})
export class HolidayService {

  readonly APP_URL = environment.apiUrl;
  readonly GET_HOLIDAY = this.APP_URL + "/holiday";
  readonly GET_HOLIDAY_BY_ID = this.APP_URL + "/holiday/id/{holidayId}";
  readonly GET_HOLIDAY_DROPDOWN = this.APP_URL + "/holiday/year/{year}";
  readonly ADD_HOLIDAY = this.APP_URL + "/holiday";
  readonly ADD_HOLIDAY_USING_EXCEL = this.APP_URL + "/holiday/excel";
  readonly UPDATE_HOLIDAY = this.APP_URL + "/holiday/update";
  readonly DELETE_HOLIDAY = this.APP_URL + "/holiday/{holidayId}";
  readonly DOWNLOAD_HOLIDAY_EXCEL_TPL = this.APP_URL + "/holiday/excel/template";

  constructor(private http: HttpClient) {
  }

  public getHoliday(): Observable<ResponseModel<any>> {
    return this.http.get<ResponseModel<any>>(this.GET_HOLIDAY);
  }

  public getHolidayModelList(year: string): Observable<ResponseModel<any>> {
    const url = this.GET_HOLIDAY_DROPDOWN.replace("{year}", year);
    return this.http.get<ResponseModel<any>>(url);
  }

  public getHolidayById(holidayId: number): Observable<ResponseModel<any>> {
    const url = this.GET_HOLIDAY_BY_ID.replace("{holidayId}", holidayId.toString(10));
    return this.http.get<ResponseModel<any>>(url);
  }

  public addHoliday(form :{holidayName: string, holidayDate: Date}): Observable<ResponseModel<any>> {
    return this.http.post<ResponseModel<any>>(this.ADD_HOLIDAY, form);
  }

  public addHolidayUsingExcel(fileList: NzUploadFile[]): Observable<ResponseModel<any>> {
    const formData = new FormData();
    if (fileList) {
      fileList.forEach((file: any) => {
        formData.append('file', file);
      });
    }
    return this.http.post<ResponseModel<any>>(this.ADD_HOLIDAY_USING_EXCEL, formData);
  }

  public updateHoliday(form: {holidayId: number, holidayName: string, holidayDate: Date}) {
    return this.http.post<ResponseModel<any>>(this.UPDATE_HOLIDAY, form);
  }

  public deleteHoliday(holidayId: number) {
    const url = this.DELETE_HOLIDAY.replace("{holidayId}", holidayId.toString(10));
    return this.http.delete<ResponseModel<any>>(url);
  }

  public downloadHolidayExcelTpl(): Observable<any> {
    return this.http.get(this.DOWNLOAD_HOLIDAY_EXCEL_TPL, {responseType: 'blob'});
  }
}
