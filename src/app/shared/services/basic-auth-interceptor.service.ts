import {Injectable} from '@angular/core';
import {
    HTTP_INTERCEPTORS,
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest
} from "@angular/common/http";
import {BehaviorSubject, Observable, throwError} from "rxjs";
import {catchError, filter, switchMap, take} from "rxjs/operators";
import {AuthService} from "../../auth/auth.service";
import {TokenStorageService} from "./token-storage.service";
import {ResponseModel} from "../models/response-model";

const TOKEN_HEADER_KEY = 'Authorization';  // for Spring Boot back-end

@Injectable({
    providedIn: 'root'
})
export class BasicAuthInterceptorService implements HttpInterceptor {

    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private authService: AuthService,
                private tokenStorageService: TokenStorageService) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<Object>> {
        let authReq = req;
        const token = this.tokenStorageService.getToken();
        if (token != null) {
            authReq = this.addTokenHeader(req, token);
        }

        return next.handle(authReq).pipe(catchError(error => {
            if (error instanceof HttpErrorResponse && !authReq.url.includes('/login') && error.status === 401) {
                return this.handle401Error(authReq, next);
            }

            return throwError(error);
        }));
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            const refreshToken = this.tokenStorageService.getRefreshToken();

            if (refreshToken)
                return this.authService.refreshToken(refreshToken).pipe(
                    switchMap((token: ResponseModel<any>) => {
                        this.isRefreshing = false;

                        this.tokenStorageService.setToken(token.data.accessToken);
                        this.refreshTokenSubject.next(token.data.accessToken);

                        return next.handle(this.addTokenHeader(request, token.data.accessToken));
                    }),
                    catchError((err) => {
                        this.isRefreshing = false;

                        this.tokenStorageService.clear();
                        return throwError(err);
                    })
                );
        }

        return this.refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap((token) => next.handle(this.addTokenHeader(request, token)))
        );
    }

    private addTokenHeader(request: HttpRequest<any>, token: string) {
        return request.clone({ headers: request.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + token) });
    }
}

export const authInterceptorProviders = [
    { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptorService, multi: true }
];
