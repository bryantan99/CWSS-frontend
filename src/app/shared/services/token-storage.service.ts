import {Injectable} from '@angular/core';
import {User} from "../models/user";

@Injectable({
    providedIn: 'root'
})
export class TokenStorageService {

    private readonly KEY_USERNAME = "username";
    private readonly KEY_USER = "user";
    private readonly KEY_REFRESH_TOKEN = "refreshToken";
    private readonly KEY_TOKEN = "token";

    constructor() {
    }

    public getToken(): string | null {
        return window.sessionStorage.getItem(this.KEY_TOKEN);
    }

    public getRefreshToken(): string | null {
        return window.sessionStorage.getItem(this.KEY_REFRESH_TOKEN);
    }

    public getUser(): any {
        const user = window.sessionStorage.getItem(this.KEY_USER);
        return user ? JSON.parse(user) : {};
    }

    public getUsername(): string | null {
        return window.sessionStorage.getItem(this.KEY_USERNAME);
    }

    public setToken(token: string): void {
        window.sessionStorage.removeItem(this.KEY_TOKEN);
        window.sessionStorage.setItem(this.KEY_TOKEN, token);
        const user: User = this.getUser();
        if (user.username) {
            this.setUser({...user, jwtToken: token});
        }
    }

    public setRefreshToken(token: string): void {
        window.sessionStorage.removeItem(this.KEY_REFRESH_TOKEN);
        window.sessionStorage.setItem(this.KEY_REFRESH_TOKEN, token);
    }

    public setUser(user: User): void {
        window.sessionStorage.removeItem(this.KEY_USER);
        window.sessionStorage.setItem(this.KEY_USER, JSON.stringify(user));
    }

    public setUsername(username: string): void {
        window.sessionStorage.removeItem(this.KEY_USERNAME);
        window.sessionStorage.setItem(this.KEY_USERNAME, username);
    }

    public saveLoginSessionData(userData: User) {
        this.setUser(userData)
        this.setUsername(userData.username);
        this.setToken(userData.jwtToken);
        this.setRefreshToken(userData.refreshToken);
    }

    public clear(): void {
        window.sessionStorage.removeItem(this.KEY_USERNAME);
        window.sessionStorage.removeItem(this.KEY_USER);
        window.sessionStorage.removeItem(this.KEY_TOKEN);
        window.sessionStorage.removeItem(this.KEY_REFRESH_TOKEN);
    }
}
