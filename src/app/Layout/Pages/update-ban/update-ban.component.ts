import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Ban } from '../../../Shared/Interfaces/Bans';
import { BansService } from '../../../Shared/Services/Bans/bans.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-update-ban',
  imports: [CommonModule,FormsModule],
  templateUrl: './update-ban.component.html',
  styleUrl: './update-ban.component.css'
})
export class UpdateBanComponent {

  constructor (private activatedroute:ActivatedRoute,
    private banservice:BansService
  ){}
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
      this.banservice.updateBan(this.currentid,ban).subscribe({
        next: (response) => {
          console.log(response);
          alert("Ban updated successfully");
        },
        error: (error) => {
          console.error(error);
          alert("Error updating ban");
        }
      }
      );
    }
}
