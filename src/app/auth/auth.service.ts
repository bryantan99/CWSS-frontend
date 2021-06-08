import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {map} from "rxjs/operators";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  readonly API_SERVER_URL = 'http://localhost:8080';

  readonly LOGIN = this.API_SERVER_URL + "/authenticate";
  readonly IS_UNIQUE_USERNAME = this.API_SERVER_URL + "/account/is-valid-username";

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

  isAdminLoggedIn() {
    let user = sessionStorage.getItem("username");
    return !(user === null) && this.hasRole("ROLE_ADMIN") || this.hasRole("ROLE_SUPER_ADMIN");
  }

  logOut() {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("roleList");
  }

  isUniqueUsername(username: string): Observable<any> {
    const params = new HttpParams().set("username", username);
    return this.http.get(this.IS_UNIQUE_USERNAME, {params: params});
  }
}
