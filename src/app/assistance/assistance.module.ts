import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminAssistanceComponent } from './admin-assistance/admin-assistance.component';
import { CommunityUserAssistanceComponent } from './community-user-assistance/community-user-assistance.component';
import {SharedModule} from "../shared/shared.module";
import { AssistanceRecordComponent } from './assistance-record/assistance-record.component';
import {AppRoutingModule} from "../app-routing.module";



@NgModule({
  declarations: [AdminAssistanceComponent, CommunityUserAssistanceComponent, AssistanceRecordComponent],
  imports: [
    CommonModule,
    SharedModule,
    AppRoutingModule
  ]
})
export class AssistanceModule { }
