import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Ban } from '../../../Shared/Interfaces/Bans';
import { BansService } from '../../../Shared/Services/Bans/bans.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-update-ban',
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './update-ban.component.html',
  styleUrl: './update-ban.component.css'
})
export class UpdateBanComponent {

  constructor (private activatedroute:ActivatedRoute,
    private banservice:BansService,
    private router:Router,
    private toatst:ToastrService,
  ){
  }
  currentDate: Date = new Date();
  currentid:number = 0
    ban:Ban ={} as Ban
    ngOnInit() {
      this.activatedroute.paramMap.subscribe(
        (parammap)=>{
          this.currentid= Number(parammap.get('id'));
          this.banservice.getBanByid(this.currentid).subscribe(
            (ban: Ban) => this.ban = ban
          );
        }
      )
    }

    Updateban ( ban:Ban){
      if(ban.id != undefined){
      this.banservice.updateBan(ban.id,ban).subscribe({
        next: (response) => {
          console.log(response);
          this.router.navigate(['/banned']);
          this.toatst.success("Ban updated successfully")
          // alert("Ban updated successfully");
        },
        error: (error) => {
          console.error(error);
          alert("Error updating ban");
        }
      }
      );
    }
  }
}
