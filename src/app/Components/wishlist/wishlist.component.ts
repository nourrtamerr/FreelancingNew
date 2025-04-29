import { Component, OnInit } from '@angular/core';
import { WishlistService } from '../../Shared/Services/wishlist.service';
import { Wishlist } from '../../Shared/Interfaces/wishlist';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-wishlist',
  imports: [DatePipe, FormsModule, CommonModule],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit{

  UserWishList: Wishlist[]=[];

  constructor(private wishlistService:WishlistService) { }

  ngOnInit(): void {
   

    this.wishlistService.GetWishList().subscribe({
      next:(data)=>{
        this.UserWishList=data;
      },
      error:(err)=>{
        console.log(err);
      } 
    })
  }



  loadWishlist() {
    this.wishlistService.GetWishList().subscribe({
      next: (data) => {
        this.UserWishList = data;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  removeFromWishlist(projectId: number) {
    this.wishlistService.RemoveFromWishList(projectId).subscribe({
      next: () => {
        this.UserWishList = this.UserWishList.filter(item => item.projectId !== projectId);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }


}
