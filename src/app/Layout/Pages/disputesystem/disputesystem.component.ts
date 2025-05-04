import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService, Disputes } from '../../../Shared/Services/Account/account.service';
import { Files } from '../../../base/environment';
import { RankEnum } from '../../../Shared/Interfaces/Account';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-disputesystem',
  standalone: true,
  imports: [CommonModule,FormsModule,CommonModule],
  templateUrl: './disputesystem.component.html',
  styleUrl: './disputesystem.component.css'
})
export class DisputesystemComponent implements OnInit {
  disputes: Disputes = [];
Files=Files.filesUrl
  constructor(private accountService: AccountService,private toastr:ToastrService) {}

  ngOnInit(): void {
    this.loadDisputes();
  }

  loadDisputes(): void {
    this.accountService.getDisputes().subscribe({
      next: (data) => {
        this.disputes = data;
      },
      error: (error) => {
        console.error('Error loading disputes:', error);
      }
    });
  }
  getRankIcon(rank: RankEnum): string {
    switch (rank) {
      case RankEnum.Veteran:
        return 'fas fa-medal';
      case RankEnum.RisingStar:
        return 'fas fa-star';
      case RankEnum.Established:
        return 'fas fa-certificate';
      case RankEnum.Pro:
        return 'fas fa-award';
      case RankEnum.Elite:
        return 'fas fa-crown';
      default:
        return 'fas fa-user';
    }
  }

  getFileType(files: string): string {
    if (!files) return 'other';
    
    const fileExtension = files.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension || '')) {
      return 'image';
    } else if (['mp4', 'webm', 'ogg'].includes(fileExtension || '')) {
      return 'video';
    }
    return 'other';
  }
  selectedImage: string | null = null;
  openImageModal(imageUrl: string) {
    this.selectedImage = imageUrl;
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
  
  closeImageModal() {
    this.selectedImage = null;
    document.body.style.overflow = 'auto'; // Restore scrolling
  }

  resolutionComment: string = '';

  resolveDispute(disputeId: number, decision: 'Client' | 'Freelancer', comment: string) {
    const disputeDTO: DisputeDTO = {
      disputeId: disputeId,
      decision: decision=='Client'?Decision.clientfavor : Decision.freelancerfavor,
      Comment: comment
    };

    // Call your service method here
    this.accountService.resolveDispute(disputeDTO).subscribe({
      next: (response) => {
        this.toastr.success('Dispute resolved successfully');
        this.resolutionComment = ''; // Reset comment
        this.disputes=this.disputes.filter(d=>d.id!==disputeDTO.disputeId); // Refresh disputes list
      },
      error: (error) => {
        this.toastr.error('Failed to resolve dispute');
      }
    });
  }
  
}
export interface DisputeDTO  {
  disputeId: number
  decision: Decision
  Comment: string
};
export enum Decision 
{
	freelancerfavor=0,
	clientfavor=1
}

export class RankService {
  getRankIcon(rank: RankEnum): string {
    switch (rank) {
      case RankEnum.Veteran:
        return 'fas fa-medal text-bronze';
      case RankEnum.RisingStar:
        return 'fas fa-star-shooting text-blue';
      case RankEnum.Established:
        return 'fas fa-certificate text-silver';
      case RankEnum.Pro:
        return 'fas fa-award text-gold';
      case RankEnum.Elite:
        return 'fas fa-crown text-purple';
      default:
        return 'fas fa-user';
    }
  }

  getRankColor(rank: RankEnum): string {
    switch (rank) {
      case RankEnum.Veteran:
        return '#CD7F32'; // Bronze
      case RankEnum.RisingStar:
        return '#3498db'; // Blue
      case RankEnum.Established:
        return '#C0C0C0'; // Silver
      case RankEnum.Pro:
        return '#FFD700'; // Gold
      case RankEnum.Elite:
        return '#9b59b6'; // Purple
      default:
        return '#95a5a6';
    }
  }
}