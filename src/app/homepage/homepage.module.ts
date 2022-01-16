import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from "../shared/shared.module";
import {AboutComponent} from './about/about.component';



@NgModule({
  declarations: [AboutComponent],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: []
})
export class HomepageModule { }
