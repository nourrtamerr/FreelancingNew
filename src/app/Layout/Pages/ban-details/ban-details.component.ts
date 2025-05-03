import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { BansService } from '../../../Shared/Services/Bans/bans.service';
import { Ban } from '../../../Shared/Interfaces/Bans';
import { ToastrService } from 'ngx-toastr';

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
    private toaster:ToastrService,
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

  // Delete(){
  //   // confirm("Do You Want To Delete This Ban?");
  //   this.banservice.deleteBan(Number(this.currentid));
  // }
  Delete(){
    confirm("Do You Want To Delete This Ban?");
    this.ban.banEndDate = new Date(2003,1,1);
    if(this.ban.id !== undefined){
      this.banservice.updateBan(this.ban.id,this.ban).subscribe(
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
      this.location.back()
    }
    // this.banservice.deleteBan(Number(this.currentid)).subscribe(
    //   {
    //     next:(value)=>{
    //       // console.log(value);
    //       this.ban.banEndDate = new Date(2003,1,1);
    //       this.toaster.success("Ban terminated Successfully")
    //       this.location.back()
    //     }
    //     ,
    //     error:(err)=>{
    //       console.log(err);
    //     }
    // })
  }
}
