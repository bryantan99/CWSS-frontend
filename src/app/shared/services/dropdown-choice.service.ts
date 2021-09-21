import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {DropdownChoiceModel} from "../models/dropdown-choice-model";
import {ResponseModel} from "../models/response-model";

@Injectable({
  providedIn: 'root'
})
export class DropdownChoiceService {

  private readonly API_SERVER_URL ="http://localhost:8080";
  private readonly GET_DISEASE_DROPDOWN_CHOICE = this.API_SERVER_URL + "/dropdown/get-disease-choice-list";
  private readonly GET_ADMIN_DROPDOWN_CHOICE = this.API_SERVER_URL + "/dropdown/admin";

  constructor(private http: HttpClient) { }

  getDiseaseDropdownChoices():Observable<DropdownChoiceModel[]> {
    return this.http.get<DropdownChoiceModel[]>(this.GET_DISEASE_DROPDOWN_CHOICE);
  }

  getAdminDropdownChoices(): Observable<ResponseModel<any>> {
    return this.http.get<ResponseModel<any>>(this.GET_ADMIN_DROPDOWN_CHOICE);
  }
}
