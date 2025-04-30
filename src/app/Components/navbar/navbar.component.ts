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

    this.isLoggedIn = this.AuthService.isLoggedIn();
    console.log(this.isLoggedIn); // Log the initial status of isLoggedI

    this.AuthService.isLoggedIn$.subscribe((status :any) => {
      this.isLoggedIn = status;
      console.log(status); // Log the status t
    });
  }
  logout() {
    this.isLoggedIn = false;
     this.AuthService.logout();


}


}
