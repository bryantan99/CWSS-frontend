import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomepageComponent} from './homepage/homepage.component';
import {SharedModule} from "../shared/shared.module";
import {AboutComponent} from './about/about.component';



@NgModule({
  declarations: [HomepageComponent, AboutComponent],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    HomepageComponent
  ]
})
export class HomepageModule { }
