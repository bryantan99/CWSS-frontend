import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {DropdownChoiceModel} from "../models/dropdown-choice-model";

@Injectable({
  providedIn: 'root'
})
export class DropdownChoiceService {

  readonly API_SERVER_URL ="http://localhost:8080";
  readonly GET_DISEASE_DROPDOWN_CHOICE = this.API_SERVER_URL + "/dropdown/get-disease-choice-list";

  constructor(private http: HttpClient) { }

  getDiseaseDropdownChoices():Observable<DropdownChoiceModel[]> {
    return this.http.get<DropdownChoiceModel[]>(this.GET_DISEASE_DROPDOWN_CHOICE);
  }
}
