import { Component } from '@angular/core';
import { Ban } from '../../../Shared/Interfaces/Bans';
import { BansService } from '../../../Shared/Services/Bans/bans.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule,Location } from '@angular/common';
import { AccountService } from '../../../Shared/Services/Account/account.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-ban',
  imports: [RouterModule,FormsModule,CommonModule],
  templateUrl: './add-ban.component.html',
  styleUrl: './add-ban.component.css'
})
export class AddBanComponent {
  ban:Ban ={} as Ban
  currentid:string = ''
  currentusername:string = ''
  constructor (
    private banservice:BansService,
    private activatedroute:ActivatedRoute,
    private loca: Location,
    private account:AccountService,
    private toastr:ToastrService,
  ){}

  ngOnInit() {
    this.activatedroute.paramMap.subscribe(
      (parammap)=>{
        this.currentusername= String(parammap.get('username'));
      }
    )
    this.account.getIdByUserName(this.currentusername).subscribe(
      (response)=>{

        this.currentid = response.id;
      },
      (error)=>{
        console.error(error);
        console.log('Error fetching user ID');
      }
    )
    this.ban = {
      bannedUserId: '',
      description: '',
      banDate: new Date(),
      banEndDate: new Date(),
      bannedUserName: this.currentusername
    };
    this.ban.bannedUserId = this.currentid;
    // this.ban.banDate = this.date;
  }
  addBan(ban: Ban) {
    this.ban.bannedUserId=this.currentid;
    this.banservice.addBan(ban).subscribe({
      next: (response) => {
        this.ban= response;
        // console.log(response);
        this.toastr.success('Ban added successfully');
        // this.router.navigate(['/banned']);
        this.loca.back();
      },
      error: (error) => {
        console.error(error);
        this.toastr.error('Error adding ban', 'Error');
        alert('Error adding ban');
      }
    });
  }
}
