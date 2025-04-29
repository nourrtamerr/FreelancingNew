import { Injectable, signal } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Environment } from '../../../base/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${Environment.baseUrl}Account`;
  userData = new BehaviorSubject<any>(null);
  private _isLoggedIn = signal<boolean>(false);

  isLoggedIn = this._isLoggedIn;
  isLoggedIn$ = toObservable(this._isLoggedIn);

  constructor(private httpClient: HttpClient, private router: Router) {
    this.checkToken();
  }

  getTokenFromCookie(): string | null {
    const name = 'user_Token=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    for (let cookie of cookieArray) {
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
    return null;
  }

  private checkToken(): void {
    const token = this.getTokenFromCookie();
    if (token) {
      try {
        const decoded = jwtDecode(token);
        this.userData.next(decoded);
        this._isLoggedIn.set(true);
      } catch (error) {
        this.logout();
      }
    }
  }

  deleteCookie(name: string): void {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=Lax`;
  }

  logout(): void {
    this.deleteCookie('user_Token');
    this.userData.next(null);
    this._isLoggedIn.set(false);
    this.router.navigate(['/home']);
  }

  login(userData: any): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/login`, userData);
  }

  deCodeUserData(token: string): void {
    try {
      const decoded = jwtDecode(token);
      this.userData.next(decoded);
      this._isLoggedIn.set(true);
    } catch {
      this.logout();
    }
  }

  getRole(): string | null {
    const token = this.getTokenFromCookie();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
    } catch {
      return null;
    }
  }
}