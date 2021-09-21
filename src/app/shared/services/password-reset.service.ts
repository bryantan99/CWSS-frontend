import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ResponseModel} from "../models/response-model";

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {

  private readonly APP_URL = "http://localhost:8080";
  private readonly REQUEST_RESET_PASSWORD = this.APP_URL + "/account/request-password-reset";
  private readonly VALIDATE_OTP = this.APP_URL + "/account/validation/otp";
  private readonly RESET_PASSWORD = this.APP_URL + "/account/reset-password"

  constructor(private http: HttpClient) {
  }

  requestPasswordReset(email: string): Observable<ResponseModel<any>> {
    const param = {
      email: email
    }
    return this.http.post<ResponseModel<any>>(this.REQUEST_RESET_PASSWORD, param);
  }

  validateOtp(form: { otp: string; email: string }): Observable<ResponseModel<any>> {
    return this.http.post<ResponseModel<any>>(this.VALIDATE_OTP, form);
  }

  resetPassword(form: any): Observable<ResponseModel<any>> {
    return this.http.post<ResponseModel<any>>(this.RESET_PASSWORD, form);
  }
}
