import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from "../shared/shared.module";
import {AppRoutingModule} from "../app-routing.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { AppointmentMngmtComponent } from './appointment-mngmt/appointment-mngmt.component';
import { AppointmentScheduleComponent } from './appointment-schedule/appointment-schedule.component';
import { AppointmentTableComponent } from './appointment-table/appointment-table.component';
import { AppointmentRescheduleComponent } from './appointment-reschedule/appointment-reschedule.component';
import { MyAppointmentComponent } from './my-appointment/my-appointment.component';

@NgModule({
    declarations: [
        AppointmentMngmtComponent,
        AppointmentScheduleComponent,
        AppointmentTableComponent,
        AppointmentRescheduleComponent,
        MyAppointmentComponent
    ],
    exports: [
        AppointmentRescheduleComponent
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
