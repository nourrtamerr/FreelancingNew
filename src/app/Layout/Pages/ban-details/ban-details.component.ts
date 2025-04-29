import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { BansService } from '../../../Shared/Services/Bans/bans.service';
import { Ban } from '../../../Shared/Interfaces/Bans';

@Component({
  selector: 'app-ban-details',
  imports: [CommonModule,RouterLink],
  templateUrl: './ban-details.component.html',
  styleUrl: './ban-details.component.css'
})
export class BanDetailsComponent implements OnInit{
  constructor (
    private activatedroute:ActivatedRoute,
    private location:Location,
    private banservice:BansService
  ) {}
  currentid:number|null = 0
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

  goback(){
    this.location.back()
  }

  Delete(){
    confirm("Do You Want To Delete This Ban?");
    this.banservice.deleteBan(Number(this.currentid));
  }


}
