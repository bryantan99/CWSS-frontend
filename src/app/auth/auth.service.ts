import {EventEmitter, Injectable, Output} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiServerUrl = 'http://localhost:8080';

  LOGIN = this.apiServerUrl + "/authenticate";

  constructor(private http: HttpClient) {
  }

  //  Store JWT Token in session if authentication is successful
  login(loginForm: { username: string, password: string }) {
    return this.http.post<any>(this.LOGIN, loginForm)
      .pipe(
        map(userData => {
          sessionStorage.setItem("username", loginForm.username);
          sessionStorage.setItem("roleList", userData?.roleList);
          let tokenStr = "Bearer " + userData.jwtToken;
          sessionStorage.setItem("token", tokenStr);
          return userData;
        })
      );
  }

  hasRole(roleName: string) {
    let found = false;
    const roleList: string = sessionStorage.getItem("roleList");
    if (roleList) {
      found = roleList.includes(roleName);
    }
    return found;
  }

  isUserLoggedIn() {
    let user = sessionStorage.getItem("username");
    return !(user === null);
  }

  logOut() {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("roleList");
  }
}
