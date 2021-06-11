import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomepageComponent} from "./homepage/homepage/homepage.component";
import {LoginComponent} from "./user/login/login.component";
import {SignupComponent} from "./user/signup/signup.component";
import {AboutComponent} from "./homepage/about/about.component";
import {LogoutComponent} from "./user/logout/logout.component";
import {CommunityUserComponent} from "./user/community-user/community-user.component";
import {CommunityUserProfileComponent} from "./user/community-user-profile/community-user-profile.component";
import {CommunityUserAssistanceComponent} from "./assistance/community-user-assistance/community-user-assistance.component";
import {AdminAssistanceComponent} from "./assistance/admin-assistance/admin-assistance.component";
import {AssistanceRecordComponent} from "./assistance/assistance-record/assistance-record.component";

const routes: Routes = [
  { path: '', component: HomepageComponent},
  { path: 'login', component: LoginComponent},
  { path: 'logout', component: LogoutComponent},
  { path: 'signup', component: SignupComponent},
  { path: 'about', component: AboutComponent},
  { path: 'community-user', component: CommunityUserComponent},
  { path: 'community-user-profile', component: CommunityUserProfileComponent},
  { path: 'community-user-assistance', component: CommunityUserAssistanceComponent},
  { path: 'admin-assistance', component: AdminAssistanceComponent},
  { path: 'assistance-record', component: AssistanceRecordComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
