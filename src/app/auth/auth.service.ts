import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {map} from "rxjs/operators";
import {BehaviorSubject, Observable} from "rxjs";
import {ResponseModel} from "../shared/models/response-model";
import {User} from "../shared/models/user";
import {Router} from "@angular/router";
import {environment} from "../../environments/environment";
import {TokenStorageService} from "../shared/services/token-storage.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userSubject: BehaviorSubject<User>
  user: Observable<User>;

  private readonly API_SERVER_URL = environment.apiUrl;

  private readonly LOGIN = this.API_SERVER_URL + "/authenticate";
  private readonly IS_UNIQUE_USERNAME = this.API_SERVER_URL + "/account/validation/username";
  private readonly IS_UNIQUE_EMAIL = this.API_SERVER_URL + "/account/validation/email";
  private readonly IS_UNIQUE_NRIC = this.API_SERVER_URL + "/account/validation/nric";
  private readonly REFRESH_TOKEN = this.API_SERVER_URL + "/refresh-token";

  constructor(private http: HttpClient,
              private router: Router,
              private tokenStorageService: TokenStorageService) {
    this.userSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('user')));
    this.user = this.userSubject.asObservable();
  }

  get userValue(): User {
    return this.userSubject.value;
  }

  //  Store JWT Token in session if authentication is successful
  login(loginForm: { username: string, password: string }) {
    return this.http.post<any>(this.LOGIN, loginForm)
      .pipe(
        map(resp => {
          const userData = resp.data;
          this.tokenStorageService.saveLoginSessionData(userData);
          this.userSubject.next(userData);
          return userData;
        })
      );
  }

  hasRole(roleName: string) {
    let found = false;
    const decodedJwt = AuthService.decodeJwtToken();
    if (decodedJwt) {
      const roleList = decodedJwt.roleList;
      if (roleList) {
        found = roleList.includes(roleName);
      }
    }
    return found;
  }

  isAdminLoggedIn() {
    let user = sessionStorage.getItem("username");
    return !(user === null) && (this.hasRole("ROLE_ADMIN") || this.hasRole("ROLE_SUPER_ADMIN"));
  }

  logOut() {
    this.tokenStorageService.clear();
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  isUniqueUsername(username: string): Observable<any> {
    const params = new HttpParams().set("username", username);
    return this.http.get(this.IS_UNIQUE_USERNAME, {params: params});
  }

  isUniqueEmail(email: string): Observable<ResponseModel<any>> {
    const params = new HttpParams().set("email", email);
    return this.http.get<ResponseModel<any>>(this.IS_UNIQUE_EMAIL, {params: params});
  }

  private static decodeJwtToken() {
    let jwtToken = sessionStorage.getItem("token");
    if (!jwtToken) {
      return null;
    }

    jwtToken = jwtToken.replace("Bearer ", "");
    const jwtTokenArr = jwtToken.split(".");
    return JSON.parse(atob(jwtTokenArr[1]));
  }

  isUniqueNric(nric: string): Observable<ResponseModel<any>> {
    const params = new HttpParams().set("nric", nric);
    return this.http.get<ResponseModel<any>>(this.IS_UNIQUE_NRIC, {params: params});
  }

  refreshToken(token: string): Observable<ResponseModel<any>> {
    return this.http.post<ResponseModel<any>>(this.REFRESH_TOKEN, {refreshToken: token});
  }
}
