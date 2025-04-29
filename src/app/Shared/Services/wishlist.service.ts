import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environment } from '../../base/environment';
import { Observable } from 'rxjs';
import { Wishlist } from '../Interfaces/wishlist';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  constructor(private myClient:HttpClient) { }

  Url=`${Environment.baseUrl}Wishlist`;

  AddToWishlist(projectid:number):Observable<any>{
    return this.myClient.post(`${this.Url}/${projectid}`,null);
  }

  RemoveFromWishList(projectid:number):Observable<any>{
    return this.myClient.delete(`${this.Url}/${projectid}`);
  }

  GetWishList():Observable<Wishlist[]>{
    return this.myClient.get<Wishlist[]>(this.Url);
  }

}
