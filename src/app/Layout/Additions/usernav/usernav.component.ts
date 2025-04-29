import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../Shared/Services/Auth/auth.service';

@Component({
  selector: 'app-usernav',
  imports: [RouterModule],
  templateUrl: './usernav.component.html',
  styleUrl: './usernav.component.css'
})
export class UsernavComponent {
  constructor(private _AuthService:AuthService) { }

  
logout() {
    this._AuthService.logout();
    this._AuthService.userData.next(null);
    this._AuthService.isLoggedIn.set(false);
    this._AuthService.deleteCookie('user_Token');
}


}
