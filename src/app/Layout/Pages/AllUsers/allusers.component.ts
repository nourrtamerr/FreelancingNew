import { AuthService } from './../../../Shared/Services/Auth/auth.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from './../../../Shared/Services/Account/account.service';
import { AppUser, UserRole } from '../../../Shared/Interfaces/Account';
import { Files } from '../../../base/environment';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-allusers',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModalModule],
  templateUrl: './allusers.component.html',
  styleUrls: ['./allusers.component.css']
})
export class AllusersComponent implements OnInit {
  AllUsers: AppUser[] = [];
  searchedUser: AppUser[] = [];
  date: Date = new Date();
  MyPath: string = '';
  newAdmin: { name: string; message: string } = { name: '', message: '' };
  currentUserRole: string | null = null;

  constructor(
    private accountService: AccountService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private AuthService: AuthService
  ) {}

  ngOnInit() {
    this.MyPath = Files.filesUrl;
    this.currentUserRole = this.AuthService.getRole();
    this.loadUsers();
  }

  loadUsers() {
    this.accountService.getUsers().subscribe({
      next: (users) => {
        this.AllUsers = users;
        this.searchedUser = [...users];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching users:', err)
    });
  }

  openAddAdminModal(content: any) {
    this.modalService.open(content);
  }

  search(searched: string) {
    const lowerCaseSearch = searched.toLowerCase();
    this.searchedUser = this.AllUsers.filter((user) =>
      user.userName?.toLowerCase().includes(lowerCaseSearch)
    );
  }

  addAdmin(id: string) {
    this.accountService.MakeAdmin(id).subscribe({
      next: (res: any) => {
        this.toastr.success(res.message || res || 'Admin added');
        this.updateUserRole(id, 'Admin'); // Changed from 'Freelancer' to 'Admin'
      },
      error: (err) => {
        this.toastr.error(err.error?.error || 'Error adding admin');
      }
    });
  }
  
  removeAdmin(id: string) {
    this.accountService.RemoveAdmin(id).subscribe({
      next: (res: any) => {
        this.toastr.success(res.message || res || 'Admin removed');
        this.updateUserRole(id, 'Freelancer');
      },
      error: (err) => {
        const errorMessage = err.error?.error || 'An unexpected error occurred.';
        this.toastr.error(errorMessage);
        console.error(errorMessage);
      }
    });
  }
  private updateUserRole(userId: string, newRole: string) {
    // Update in AllUsers array
    this.AllUsers = this.AllUsers.map(user =>
      user.id === userId ? { ...user, role: newRole } : user
    );
    
    // Update in searchedUser array
    this.searchedUser = this.searchedUser.map(user =>
      user.id === userId ? { ...user, role: newRole } : user
    );
    
    this.cdr.detectChanges();
  }

  saveAdmin() {
    console.log('New Admin:', this.newAdmin);
    // You can implement save new admin here if needed
  }
}
