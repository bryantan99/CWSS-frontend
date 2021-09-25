import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from "../shared/shared.module";
import {AppRoutingModule} from "../app-routing.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { AppointmentMngmtComponent } from './appointment-mngmt/appointment-mngmt.component';
import { AppointmentFormComponent } from './appointment-form/appointment-form.component';

@NgModule({
  declarations: [
    AppointmentMngmtComponent,
    AppointmentFormComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class AppointmentModule { }
