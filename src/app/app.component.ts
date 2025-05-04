import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./Components/navbar/navbar.component";
import { FooterComponent } from "./Components/footer/footer.component";
import { ChatComponent } from "./Layout/Pages/chat/chat.component";
import { ChatbotComponent } from './Layout/Pages/Chatbot/chatbot/chatbot.component';
import { filter } from 'rxjs';
// import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ChatComponent,ChatbotComponent, CommonModule],
  templateUrl: './app.component.html',
  // styleUrl: './app.component.css',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Prolance';
  showNavbar = true;

    // Subscribe to navigation events
    
    constructor(private router: Router) {
      // Subscribe to navigation events
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        console.log('url issss',url)
        this.showNavbar = url !== '/login' && url !== '/register';
        console.log('this.showNavbar',this.showNavbar)

      });

    }
  
}
