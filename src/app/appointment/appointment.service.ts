import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {ResponseModel} from "../shared/models/response-model";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private readonly APP_URL = environment.apiUrl;
  private readonly GET_APPOINTMENT = this.APP_URL + "/appointment/appointmentId";
  private readonly GET_ALL_APPOINTMENTS = this.APP_URL + "/appointment"
  private readonly GET_USER_APPOINTMENTS = this.APP_URL + "/appointment/user"
  private readonly CANCEL_APPOINTMENT = this.APP_URL + "/appointment/appointmentId"
  private readonly UPDATE_APPOINTMENT_DATETIME = this.APP_URL + "/appointment/update-datetime";
  private readonly CONFIRM_APPOINTMENT = this.APP_URL + "/appointment/confirm";

  constructor(private http: HttpClient) {
  }

  getAppointment(appointmentId: number): Observable<ResponseModel<any>> {
    const url = this.GET_APPOINTMENT.replace("appointmentId", appointmentId.toString(10));
    return this.http.get<ResponseModel<any>>(url);
  }

  getAppointments(): Observable<ResponseModel<any>> {
    return this.http.get<ResponseModel<any>>(this.GET_ALL_APPOINTMENTS);
  }

  getUserAppointment(username: string): Observable<ResponseModel<any>> {
    const params = new HttpParams().set("username", username);
    return this.http.get<ResponseModel<any>>(this.GET_USER_APPOINTMENTS, {params: params});
  }

  cancelAppointment(appointmentId: any): Observable<ResponseModel<any>> {
    const url = this.CANCEL_APPOINTMENT.replace("appointmentId", appointmentId);
    return this.http.delete<ResponseModel<any>>(url);
  }

  updateAppointmentDatetime(form: { datetime: Date; appointmentId: any }) {
    return this.http.post<ResponseModel<any>>(this.UPDATE_APPOINTMENT_DATETIME, form);
  }

  confirmAppointment(form: { appointmentId: number }) {
    return this.http.post<ResponseModel<any>>(this.CONFIRM_APPOINTMENT, form);
  }
}
