import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminAssistanceComponent } from './admin-assistance/admin-assistance.component';
import { UserAssistanceComponent } from './user-assistance/user-assistance.component';
import {SharedModule} from "../shared/shared.module";
import { AssistanceRecordComponent } from './assistance-record/assistance-record.component';
import {AppRoutingModule} from "../app-routing.module";
import { AssistanceDetailComponent } from './assistance-detail/assistance-detail.component';
import {ReactiveFormsModule} from "@angular/forms";



@NgModule({
  declarations: [AdminAssistanceComponent, UserAssistanceComponent, AssistanceRecordComponent, AssistanceDetailComponent],
    imports: [
        CommonModule,
        SharedModule,
        AppRoutingModule,
        ReactiveFormsModule
    ]
})
export class AssistanceModule { }
