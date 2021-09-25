import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {HomepageComponent} from "./homepage/homepage/homepage.component";
import {LoginComponent} from "./user/login/login.component";
import {SignupComponent} from "./user/signup/signup.component";
import {AboutComponent} from "./homepage/about/about.component";
import {CommunityUserComponent} from "./user/community-user/community-user.component";
import {CommunityUserProfileComponent} from "./user/community-user-profile/community-user-profile.component";
import {AssistanceMngmtComponent} from "./assistance/assistance-mngmt/assistance-mngmt.component";
import {UpdateProfileComponent} from "./user/update-profile/update-profile.component";
import {AdminManagementComponent} from "./user/admin/admin-management/admin-management.component";
import {ResetPasswordComponent} from "./user/reset-password/reset-password.component";
import {AssistanceDetailComponent} from "./assistance/assistance-detail/assistance-detail.component";
import {AuthGuardService} from "./shared/services/auth-guard.service";
import {AppointmentMngmtComponent} from "./appointment/appointment-mngmt/appointment-mngmt.component";
import {RoleConstant} from "./shared/constants/role-constant";

const routes: Routes = [
  {
    path: '',
    component: HomepageComponent
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
    path: 'community-user/profile',
    component: CommunityUserProfileComponent,
    canActivate: [AuthGuardService]
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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {relativeLinkResolution: 'legacy'})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
