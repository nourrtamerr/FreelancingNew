import { Component, OnInit } from '@angular/core';
import { Ban } from '../../../Shared/Interfaces/Bans';
import { BansService } from '../../../Shared/Services/Bans/bans.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-banned-users',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './banned-users.component.html',
  styleUrl: './banned-users.component.css'
})
export class BannedUsersComponent implements OnInit{
  bannedUsers: Ban[] = [];
  searchedbans: Ban[]=[];
  date: Date = new Date();
  constructor(private banned: BansService,
    private router:Router,
    private toaster:ToastrService
    ) {}


  ngOnInit() {
    this.banned.getAllBans().subscribe(
      {
        next:(value)=>{
          this.bannedUsers = value
          this.searchedbans = value
          ;
        }
      }
    )
  }


  

search(searched:string){
  this.searchedbans = this.bannedUsers.filter(m=>m.bannedUserName?.toLowerCase().includes(searched.toLowerCase()));
}

navigatetodetails(id:number) {
  this.router.navigateByUrl(`/bandetails/${id}`)
}

Update(id:number){
  this.router.navigateByUrl(`/updateban/${id}`)
}
getDateDiff(dateString: string): number {
  const banEndDate = new Date(dateString);
  const now = new Date();
  const diffMilliseconds = now.getTime() - banEndDate.getTime();
  const diffDays = Math.floor(diffMilliseconds / (1000 * 60 ));
  return diffDays;
}

// Delete(id:number){
//   // confirm("Do You Want To Delete This Ban?");
//   this.banned.deleteBan(id).subscribe(
//     {
//       next:(value)=>{
//         console.log(value);
//         this.banned.getAllBans().subscribe(
//           {
//             next:(value)=>{
//               this.bannedUsers = value
//               this.searchedbans = value
//             }
//           }
//         )
//       }
//       ,
//       error:(err)=>{
//         console.log(err);
//       }
//   })
// }



Delete(id:number,ban:any){
  confirm("Do You Want To Delete This Ban?");
  ban.banEndDate = new Date(2003,1,1);
  if(ban.id !== undefined){
    this.banned.updateBan(ban.id,ban).subscribe(
      {
        next:(value)=>{
          // console.log(value);
        }
        ,
        error:(err)=>{
          console.log(err);
          this.toaster.error("Error terminating ban")
        }
      }
    )
    this.toaster.success("Ban terminated Successfully")
    // this.location.back()
    this.bannedUsers.filter(b=> b.id!==id)
  }
}

}