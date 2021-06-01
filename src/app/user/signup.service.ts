import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SignupService {

  readonly apiServerUrl = 'http://localhost:8080';

  readonly REGISTER_ACCOUNT = this.apiServerUrl + "/register";

  constructor(private http: HttpClient) { }

  registerAccount(form : any):Observable<any> {
    return this.http.post(this.REGISTER_ACCOUNT, form);
  }
}
