import {Injectable} from '@angular/core';
import {ResponseModel} from "../models/response-model";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class HolidayService {

  readonly APP_URL = environment.apiUrl;
  readonly GET_HOLIDAY = this.APP_URL + "/holiday";

  constructor(private http: HttpClient) {
  }

  public getHoliday(): Observable<ResponseModel<any>> {
    return this.http.get<ResponseModel<any>>(this.GET_HOLIDAY);
  }
}
