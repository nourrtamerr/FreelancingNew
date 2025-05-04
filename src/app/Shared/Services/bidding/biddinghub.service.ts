import { Injectable, OnDestroy } from '@angular/core';
// import { HubConnection } from '@microsoft/signalr';
import { Environment } from '../../../base/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../Auth/auth.service';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
export interface bidchange{
  price:number
  average:number
}

@Injectable({
  providedIn: 'root'
})
export class BiddinghubService {
  public hubConnection!: HubConnection;
  private connectionEstablished = false;
  // public AllNotificaitions:BehaviorSubject<Notifications[]> = new BehaviorSubject<Notifications[]>([]);
  // public unreadNotifications: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private apiUrl = `${Environment.biddingUrl}`;
  // private connectionStatus$ = new BehaviorSubject<boolean>(false);
  constructor(private _HttpClient:HttpClient,private authService:AuthService) {
    this.initializeSignalRConnection();
    // this.setupNotificationHandlers();
    
   }

   private initializeSignalRConnection(): void {
    try {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(Environment.biddingUrl, { 
          accessTokenFactory: () => {
           console.log("accessing token");
            const token = this.authService.getTokenFromCookie();
            if (!token) {
              console.warn('No auth token available');
              return '';
            }
            return token;
          }
        })
        .withAutomaticReconnect()
        .build();
  
      this.hubConnection.start()
        .then(() => {
          console.log('SignalR Connected');
         //  this.connectionStatus$.next(true);
        })
        .catch((err: unknown) => {
          console.error('SignalR Connection Error:', err);
         //  this.connectionStatus$.next(false);
        });
  
    } catch (error) {
      console.error('SignalR Initialization Error:', error);
     //  this.connectionStatus$.next(false);
    }
  }
   
     private setupNotificationHandlers(): void {
      this.hubConnection.on("BiddingChanged", (bidchange: bidchange) => {
        console.log('New bidchange:', bidchange);

          this.Price=bidchange.price,
          this.average=Math.round(bidchange.average)
          this.changesnumber++
        // const current = this.AllNotificaitions.getValue();
        // this.AllNotificaitions.next([notification, ...current]);
        // if (!notification.isRead) {
        //   this.unreadNotifications.next(this.unreadNotifications.value + 1);
        // }
      });
    }
    public Price:number|undefined=undefined
    public average:number|undefined=undefined
    public changesnumber=0


    private async waitForConnection(): Promise<void> {
      while (this.hubConnection.state !== 'Connected') {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    public async joinBidGroup(projectId: number): Promise<void> {
      await this.waitForConnection();
      if (this.hubConnection.state === 'Connected') {
        try {
          await this.hubConnection.invoke('JoinBidGroup', projectId); // pass primitive, not object
          console.log(`Successfully joined bid group for project ${projectId}`);
        } catch (err) {
          console.error(`Error joining bid group: ${err}`);
        }
      } else {
        console.warn('Cannot join group - connection not established');
      }
    }
}
