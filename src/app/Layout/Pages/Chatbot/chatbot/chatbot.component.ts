import { Component, OnInit } from '@angular/core';
import { ChatbotService } from '../../../../Shared/Services/Chatbot/chatbot.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatResponse } from '../../../../Shared/Interfaces/ChatResponse';
import { MarkdownModule ,provideMarkdown} from 'ngx-markdown';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
})
export class ChatbotComponent implements OnInit {
  isChatOpen = false;
  userInput = '';
  messages: { sender: 'user' | 'bot'; text: string }[] = [];
  isLoading = false;

  constructor(private chatbotService: ChatbotService) {}

  ngOnInit(): void {
    this.messages.push({
      sender: 'bot',
      text: '👋 Hello! I\'m Prolance. Ask me anything about freelancing websites!',
    });
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
  }

  sendMessage(): void {
    const prompt = this.userInput.trim();
    if (!prompt) return;

    this.messages.push({ sender: 'user', text: prompt });
    this.isLoading = true;

    this.chatbotService.sendPrompt(prompt).subscribe({
      next: (response: ChatResponse) => {
        const reply = response.isSuccess
          ? response.message
          : `❌ Error: ${response.errorMessage || 'Something went wrong'}`;
        this.messages.push({ sender: 'bot', text: reply });
        this.isLoading = false;
      },
      error: (err) => {
        const errorMsg = err?.error?.errorMessage || err?.message || 'Unknown error occurred.';
        this.messages.push({ sender: 'bot', text: `❌ Error: ${errorMsg}` });
        this.isLoading = false;
      },
    });

    this.userInput = ''; // Clear input
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
