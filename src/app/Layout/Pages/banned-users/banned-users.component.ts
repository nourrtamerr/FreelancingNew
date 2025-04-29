import { Component, OnInit } from '@angular/core';
import { Ban } from '../../../Shared/Interfaces/Bans';
import { BansService } from '../../../Shared/Services/Bans/bans.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
    private router:Router
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
  this.router.navigateByUrl(`/home2/bandetails/${id}`)
}

Update(id:number){
  this.router.navigateByUrl(`/home2/updateban/${id}`)
}
getDateDiff(dateString: string): number {
  const banEndDate = new Date(dateString);
  const now = new Date();
  const diffMilliseconds = now.getTime() - banEndDate.getTime();
  const diffDays = Math.floor(diffMilliseconds / (1000 * 60 ));
  return diffDays;
}

}
