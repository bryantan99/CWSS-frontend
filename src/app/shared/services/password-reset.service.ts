import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ResponseModel} from "../models/response-model";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {

  private readonly APP_URL = environment.apiUrl;
  private readonly REQUEST_RESET_PASSWORD = this.APP_URL + "/account/request-password-reset";
  private readonly VALIDATE_OTP = this.APP_URL + "/account/validation/otp";
  private readonly RESET_PASSWORD = this.APP_URL + "/account/reset-password"
  private readonly CHANGE_PASSWORD = this.APP_URL + "/account/change-password";

  constructor(private http: HttpClient) {
  }

  requestPasswordReset(username: string): Observable<ResponseModel<any>> {
    const param = {
      username: username
    }
    return this.http.post<ResponseModel<any>>(this.REQUEST_RESET_PASSWORD, param);
  }

  validateOtp(form: { otp: string; username: string }): Observable<ResponseModel<any>> {
    return this.http.post<ResponseModel<any>>(this.VALIDATE_OTP, form);
  }

  resetPassword(form: any): Observable<ResponseModel<any>> {
    return this.http.post<ResponseModel<any>>(this.RESET_PASSWORD, form);
  }

  changePassword(form: {username: string, oldPassword: string, newPassword: string, confirmPassword: string}) {
    return this.http.post<ResponseModel<any>>(this.CHANGE_PASSWORD, form);
  }
}
