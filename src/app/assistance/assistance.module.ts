import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AssistanceMngmtComponent} from './assistance-mngmt/assistance-mngmt.component';
import {SharedModule} from "../shared/shared.module";
import {AppRoutingModule} from "../app-routing.module";
import {AssistanceFormComponent} from './assistance-form/assistance-form.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AssistanceDetailComponent} from './assistance-detail/assistance-detail.component';
import {AssistanceCommentComponent} from './assistance-comment/assistance-comment.component';


@NgModule({
  declarations: [AssistanceMngmtComponent, AssistanceFormComponent, AssistanceDetailComponent, AssistanceCommentComponent],
  imports: [
    CommonModule,
    SharedModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class AssistanceModule {
}
