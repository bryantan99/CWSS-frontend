import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginComponent} from './login/login.component';
import {SignupComponent} from './signup/signup.component';
import {SharedModule} from "../shared/shared.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AppRoutingModule} from "../app-routing.module";
import { LogoutComponent } from './logout/logout.component';
import { SignupPersonalDetailFormComponent } from './signup-personal-detail-form/signup-personal-detail-form.component';
import { SignupAddressFormComponent } from './signup-address-form/signup-address-form.component';
import { SignupOccupationFormComponent } from './signup-occupation-form/signup-occupation-form.component';
import { SignupHealthFormComponent } from './signup-health-form/signup-health-form.component';
import { CommunityUserComponent } from './community-user/community-user.component';
import { CommunityUserProfileComponent } from './community-user-profile/community-user-profile.component';



@NgModule({
  declarations: [LoginComponent, SignupComponent, LogoutComponent, SignupPersonalDetailFormComponent, SignupAddressFormComponent, SignupOccupationFormComponent, SignupHealthFormComponent, CommunityUserComponent, CommunityUserProfileComponent],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule
  ],
  exports: [
    LoginComponent,
    LogoutComponent,
    SignupComponent
  ]
})
export class UserModule { }
