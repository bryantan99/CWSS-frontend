import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ProfileComponent} from "./profile/profile.component";
import {SharedModule} from "../shared/shared.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { UserProfileComponent } from './user-profile/user-profile.component';
import {AppRoutingModule} from "../app-routing.module";
import { AdminProfileComponent } from './admin-profile/admin-profile.component';



@NgModule({
  declarations: [ProfileComponent, UserProfileComponent, AdminProfileComponent],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule
  ]
})
export class ProfileModule { }
