import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./Components/navbar/navbar.component";
import { FooterComponent } from "./Components/footer/footer.component";
import { ChatComponent } from "./Layout/Pages/chat/chat.component";
import { ChatbotComponent } from './Layout/Pages/Chatbot/chatbot/chatbot.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ChatComponent,ChatbotComponent],
  templateUrl: './app.component.html',
  // styleUrl: './app.component.css',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'FreelancingNew';
}
