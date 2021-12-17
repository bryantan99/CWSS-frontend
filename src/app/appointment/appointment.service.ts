import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {ResponseModel} from "../shared/models/response-model";
import {environment} from "../../environments/environment";
import {format, parseISO} from "date-fns";
import {UpdateAppointmentStatusFormModel} from "../shared/models/update-appointment-status-form-model";
import {ConfirmationFormModel} from "../shared/models/confirmation-form-model";
import {UpdateDatetimeForm} from "../shared/models/update-datetime-form";

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private readonly APP_URL = environment.apiUrl;
  private readonly GET_APPOINTMENT = this.APP_URL + "/appointment/appointmentId";
  private readonly GET_PENDING_APPOINTMENTS = this.APP_URL + "/appointment/pending"
  private readonly GET_USER_APPOINTMENTS = this.APP_URL + "/appointment/user"
  private readonly CANCEL_APPOINTMENT = this.APP_URL + "/appointment/appointmentId"
  private readonly UPDATE_APPOINTMENT_DATETIME = this.APP_URL + "/appointment/update-datetime";
  private readonly CONFIRM_APPOINTMENT = this.APP_URL + "/appointment/confirm";
  private readonly SCHEDULE_APPOINTMENT = this.APP_URL + "/appointment";
  private readonly GET_SCHEDULED_APPOINTMENT = this.APP_URL + "/appointment/upcoming";
  private readonly UPDATE_APPOINTMENT_STATUS = this.APP_URL + "/appointment/update-status";

  constructor(private http: HttpClient) {
  }

  getAppointment(appointmentId: number): Observable<ResponseModel<any>> {
    const url = this.GET_APPOINTMENT.replace("appointmentId", appointmentId.toString(10));
    return this.http.get<ResponseModel<any>>(url);
  }

  getPendingAppointments(appointmentId?: number): Observable<ResponseModel<any>> {
    let params = new HttpParams();
    if (appointmentId) {
      params = params.set("appointmentId", appointmentId.toString(10));
    }
    return this.http.get<ResponseModel<any>>(this.GET_PENDING_APPOINTMENTS, {params: params});
  }

  getLoggedInUserAppointment(appointmentId?: number, status?: string): Observable<ResponseModel<any>> {
    let params = new HttpParams();

    if (appointmentId) {
      params = params.set("appointmentId", appointmentId.toString(10));
    }

    if (status && status !== 'A') {
      params = params.set("status", status);
    }

    return this.http.get<ResponseModel<any>>(this.GET_USER_APPOINTMENTS, {params: params});
  }

  cancelAppointment(appointmentId: any): Observable<ResponseModel<any>> {
    const url = this.CANCEL_APPOINTMENT.replace("appointmentId", appointmentId);
    return this.http.delete<ResponseModel<any>>(url);
  }

  updateAppointmentDatetime(form: UpdateDatetimeForm) {
    return this.http.post<ResponseModel<any>>(this.UPDATE_APPOINTMENT_DATETIME, form);
  }

  confirmAppointment(form: ConfirmationFormModel) {
    return this.http.post<ResponseModel<any>>(this.CONFIRM_APPOINTMENT, form);
  }

  scheduleAppointment(form: any) {
    return this.http.post<ResponseModel<any>>(this.SCHEDULE_APPOINTMENT, form);
  }

  getConfirmedAppointments(date?: Date): Observable<ResponseModel<any>> {
    if (date) {
      let params = new HttpParams().set("date", format(parseISO(date.toISOString()), 'yyyyMMdd'));
      return this.http.get<ResponseModel<any>>(this.GET_SCHEDULED_APPOINTMENT, {params: params});
    }
    return this.http.get<ResponseModel<any>>(this.GET_SCHEDULED_APPOINTMENT);
  }

  updateAppointmentStatus(form: UpdateAppointmentStatusFormModel): Observable<ResponseModel<any>> {
    return this.http.post<ResponseModel<any>>(this.UPDATE_APPOINTMENT_STATUS, form);
  }
}
