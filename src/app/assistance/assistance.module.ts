import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminAssistanceComponent } from './admin-assistance/admin-assistance.component';
import { UserAssistanceComponent } from './user-assistance/user-assistance.component';
import {SharedModule} from "../shared/shared.module";
import { AssistanceRecordComponent } from './assistance-record/assistance-record.component';
import {AppRoutingModule} from "../app-routing.module";
import { AssistanceFormComponent } from './assistance-form/assistance-form.component';
import {ReactiveFormsModule} from "@angular/forms";
import { AssistanceDetailComponent } from './assistance-detail/assistance-detail.component';



@NgModule({
  declarations: [AdminAssistanceComponent, UserAssistanceComponent, AssistanceRecordComponent, AssistanceFormComponent, AssistanceDetailComponent],
    imports: [
        CommonModule,
        SharedModule,
        AppRoutingModule,
        ReactiveFormsModule
    ]
})
export class AssistanceModule { }
