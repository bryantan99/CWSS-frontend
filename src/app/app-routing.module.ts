import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LoginComponent} from "./user/login/login.component";
import {SignupComponent} from "./user/signup/signup.component";
import {AboutComponent} from "./homepage/about/about.component";
import {CommunityUserComponent} from "./user/community-user/community-user.component";
import {AssistanceMngmtComponent} from "./assistance/assistance-mngmt/assistance-mngmt.component";
import {UpdateProfileComponent} from "./user/update-profile/update-profile.component";
import {AdminManagementComponent} from "./user/admin/admin-management/admin-management.component";
import {ResetPasswordComponent} from "./user/reset-password/reset-password.component";
import {AssistanceDetailComponent} from "./assistance/assistance-detail/assistance-detail.component";
import {AuthGuardService} from "./shared/services/auth-guard.service";
import {AppointmentMngmtComponent} from "./appointment/appointment-mngmt/appointment-mngmt.component";
import {RoleConstant} from "./shared/constants/role-constant";
import {ProfileComponent} from "./user/profile/profile.component";
import {PostFeedComponent} from "./shared/components/post-feed/post-feed.component";

const routes: Routes = [
  {
    path: '',
    component: PostFeedComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'community-user',
    component: CommunityUserComponent,
    canActivate: [AuthGuardService],
    data: {roles: [RoleConstant.ROLE_SUPER_ADMIN, RoleConstant.ROLE_ADMIN]}
  },
  {
    path: 'admin-user',
    component: AdminManagementComponent,
    canActivate: [AuthGuardService],
    data: {roles: [RoleConstant.ROLE_SUPER_ADMIN]}
  },
  {
    path: 'assistance',
    component: AssistanceMngmtComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'assistance/detail',
    component: AssistanceDetailComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'community-user/profile/update',
    component: UpdateProfileComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'reset',
    component: ResetPasswordComponent
  },
  {
    path: 'appointment',
    component: AppointmentMngmtComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: '**',
    redirectTo: '/',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {relativeLinkResolution: 'legacy'})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
