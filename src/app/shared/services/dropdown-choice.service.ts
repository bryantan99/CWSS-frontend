import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {ResponseModel} from "../models/response-model";
import {environment} from "../../../environments/environment";
import { format, parseISO } from 'date-fns'

@Injectable({
  providedIn: 'root'
})
export class DropdownChoiceService {

  private readonly API_SERVER_URL = environment.apiUrl;
  private readonly GET_DISEASE_DROPDOWN_CHOICE = this.API_SERVER_URL + "/dropdown/get-disease-choice-list";
  private readonly GET_ADMIN_DROPDOWN_CHOICE = this.API_SERVER_URL + "/dropdown/admin";
  private readonly GET_COMMUNITY_USER_DROPDOWN_CHOICE = this.API_SERVER_URL + "/dropdown/community-user";
  private readonly GET_APPOINTMENT_AVAILABLE_TIMESLOT = this.API_SERVER_URL + "/dropdown/appointment/timeslot";
  private readonly GET_ZONE_DROPDOWN_CHOICE = this.API_SERVER_URL + "/dropdown/zoneId";
  private readonly GET_ASSISTANCE_CATEGORY_DROPDOWN_CHOICE = this.API_SERVER_URL + "/dropdown/assistance-category";
  private readonly GET_MODULE_DROPDOWN_CHOICE = this.API_SERVER_URL + "/dropdown/module";

  constructor(private http: HttpClient) { }

  getDiseaseDropdownChoices():Observable<ResponseModel<any>> {
    return this.http.get<ResponseModel<any>>(this.GET_DISEASE_DROPDOWN_CHOICE);
  }

  getAdminDropdownChoices(): Observable<ResponseModel<any>> {
    return this.http.get<ResponseModel<any>>(this.GET_ADMIN_DROPDOWN_CHOICE);
  }

  getCommunityUserDropdownChoices(hasNric?: boolean) {
    let params = new HttpParams().set("hasNric", hasNric ? "Y" : "N");
    return this.http.get<ResponseModel<any>>(this.GET_COMMUNITY_USER_DROPDOWN_CHOICE, {params: params});
  }

  getAppointmentTimeslotChoices(date: Date, adminUsername?: string, username?: string) {
    let params = new HttpParams().set("date", format(parseISO(date.toISOString()), 'yyyyMMdd'));
    if (adminUsername) {
      params = params.set("adminUsername", adminUsername);
    } else {
      params = params.set("username", username);
    }
    return this.http.get<ResponseModel<any>>(this.GET_APPOINTMENT_AVAILABLE_TIMESLOT, {params: params});
  }

  getZoneDropdownChoiceList(): Observable<ResponseModel<any>> {
    return this.http.get<ResponseModel<any>>(this.GET_ZONE_DROPDOWN_CHOICE);
  }

  getAssistanceCategoryDropdown(): Observable<ResponseModel<any>> {
    return this.http.get<ResponseModel<any>>(this.GET_ASSISTANCE_CATEGORY_DROPDOWN_CHOICE);
  }

  getModuleDropdownChoices(): Observable<ResponseModel<any>> {
    return this.http.get<ResponseModel<any>>(this.GET_MODULE_DROPDOWN_CHOICE);
  }
}
