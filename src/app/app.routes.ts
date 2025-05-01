import { Routes } from '@angular/router';

import { FixedProjectComponent } from './Layout/Pages/fixed-project/fixed-project.component';
import { FixedProjectDetailsComponent } from './Layout/Pages/fixed-project-details/fixed-project-details.component';
import { CreateProjectComponent } from './Layout/Pages/create-project/create-project.component';
import { SubscribtionPlanComponent } from './Layout/Pages/subscribtion-plan/subscribtion-plan.component';
import { BannedUsersComponent } from './Layout/Pages/banned-users/banned-users.component';
import { MilestonesComponent } from './Layout/Pages/Milestones/milestones/milestones.component';
import { MyProjectsComponent } from './Layout/Pages/myProjects/my-projects/my-projects.component';
import { ProposalDetailsComponent } from './Layout/Pages/Proposal-Details/proposal-details/proposal-details.component';
import { BanDetailsComponent } from './Layout/Pages/ban-details/ban-details.component';
import { AdminDashboardComponent } from './Layout/Pages/admin-dashboard/admin-dashboard.component';
import { UserDashboradComponent } from './Layout/Pages/user-dashborad/user-dashborad.component';
import { UpdateBanComponent } from './Layout/Pages/update-ban/update-ban.component';
// import { TestComponent } from './Components/test/test.component';
import { BiddingProjectNewComponent } from './Components/bidding-project-new/bidding-project-new.component';
import { BiddingProjectDetailsComponent } from './Components/bidding-project-details/bidding-project-details.component';
import { FreelancersComponent } from './Layout/Pages/freelancers/freelancers.component';
import { Proposal2Component } from './Components/proposal2/proposal2.component';
import { FreelancerProfileComponent } from './Layout/Pages/freelancer-profile/freelancer-profile.component';
import { IdentityVerificationDeicisionComponent } from './Layout/Pages/identity-verification-deicision/identity-verification-deicision.component';
// import { ProposalComponent } from './Components/proposal/proposal.component';
import { ProposalsComponent } from './Layout/Pages/Proposal/proposals/proposal.component';
import { HomeComponent } from './Components/home/home.component';
import { LoginComponent } from './Layout/Pages/login/login.component';
import { ChatComponent } from './Layout/Pages/chat/chat.component';
import { NotificationsComponent } from './Layout/Additions/notifications/notifications.component';
import { AddFundByClientComponent } from './Layout/Pages/add-fund-by-client/add-fund-by-client.component';
import { WishlistComponent } from './Components/wishlist/wishlist.component';

export const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent },
    {path: 'fixed', component: FixedProjectComponent},
    {path: 'createproject', component: CreateProjectComponent},
    {path: 'subscribtion', component: SubscribtionPlanComponent},
  {  path: 'fixed-project/:id',
    loadComponent: () => import('../app/Layout/Pages/fixed-project-details/fixed-project-details.component')
      .then(m => m.FixedProjectDetailsComponent)},

    // {path:'milestone',component:MilestonesComponent,title:'milestone'},
    {path:'myprojects',component:MyProjectsComponent,title:'MyProjects'},
    {path:'milestones/:projectId',component: MilestonesComponent},
    {path:'proposaldetails/:proposalId',component: ProposalDetailsComponent,title:'ProposalDetails'},
    {path:'VerificationRequests',component: IdentityVerificationDeicisionComponent},
    {path:'proposals/:projectId',component: ProposalsComponent,title:'proposals'},
    {
        path: 'profile',
        loadComponent: () =>
          import('./Layout/Pages/profile/profile.component').then(m => m.ProfileComponent)
      },
      {path:'banned',component: BannedUsersComponent},
      {path:'bandetails/:id',component: BanDetailsComponent},
      {path:'admin-dashboard',component: AdminDashboardComponent},
      {path:'updateban/:id',component: UpdateBanComponent},
      {path:'dashboard', component: UserDashboradComponent},
      {path:'addfund', component: AddFundByClientComponent},
      {path:'new',component: BiddingProjectNewComponent},
      {path:'details/:id',component: BiddingProjectDetailsComponent},
      {path:'allusers',loadComponent: () => import('./Layout/Pages/AllUsers/allusers.component').then(m => m.AllusersComponent)},
      {path:'addAdmin',loadComponent: () => import('./Layout/Pages/add-admin/add-admin.component').then(m => m.AddAdminComponent)},
      {path:'proposal2/:id',component: Proposal2Component},
      {path:'freelancers',component: FreelancersComponent},
      {path:'Freelancerprofile/:username',component: FreelancerProfileComponent},
      {path:'login',component: LoginComponent},
      {path:'chathub/:username',component: ChatComponent},
      {path:'notification',component: NotificationsComponent},
      {path:'register', loadComponent: () => import('./Layout/Pages/register/register.component').then(m => m.RegisterComponent)},
      {path:'wishlist', component: WishlistComponent},


];
