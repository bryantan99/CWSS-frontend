import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginComponent} from './login/login.component';
import {SignupComponent} from './signup/signup.component';
import {SharedModule} from "../shared/shared.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AppRoutingModule} from "../app-routing.module";
import {SignupPersonalDetailFormComponent} from './signup-personal-detail-form/signup-personal-detail-form.component';
import {SignupAddressFormComponent} from './signup-address-form/signup-address-form.component';
import {SignupOccupationFormComponent} from './signup-occupation-form/signup-occupation-form.component';
import {SignupHealthFormComponent} from './signup-health-form/signup-health-form.component';
import {CommunityUserComponent} from './community-user/community-user.component';
import {SignupInfoComponent} from './signup-info/signup-info.component';
import {UpdateProfileComponent} from './update-profile/update-profile.component';
import {AdminManagementComponent} from "./admin/admin-management/admin-management.component";
import {AdminDetailComponent} from "./admin/admin-detail/admin-detail.component";
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ProfileComponent } from './profile/profile.component';

@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent,
    SignupPersonalDetailFormComponent,
    SignupAddressFormComponent,
    SignupOccupationFormComponent,
    SignupHealthFormComponent,
    CommunityUserComponent,
    SignupInfoComponent,
    UpdateProfileComponent,
    AdminManagementComponent,
    AdminDetailComponent,
    ResetPasswordComponent,
    ProfileComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule
  ],
  exports: [
    LoginComponent,
    SignupComponent
  ]
})
export class UserModule {
}
