import { Component, OnInit } from '@angular/core';
import { WishlistService } from '../../Shared/Services/wishlist.service';
import { Wishlist } from '../../Shared/Interfaces/wishlist';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-wishlist',
  imports: [DatePipe, FormsModule, CommonModule,RouterModule],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit{

  UserWishList: Wishlist[]=[];

  constructor(private wishlistService:WishlistService,private toaster:ToastrService) { }

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
        this.toaster.success("Wishlist loaded successfully")

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
        this.toaster.error("Removed from wishlist")

      },
      error: (err) => {
        console.log(err);
      }
    });
  }


}
