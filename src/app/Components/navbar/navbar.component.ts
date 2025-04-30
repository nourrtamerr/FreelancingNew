import { Component } from '@angular/core';
import { AuthService } from '../../Shared/Services/Auth/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isLoggedIn: boolean = false;
  constructor(private  AuthService: AuthService){

    this.AuthService.isLoggedIn$.subscribe((status :any) => {
      this.isLoggedIn = status;
    });
  }
  logout() {
     this.AuthService.logout();
      this.isLoggedIn = false;


}


}
