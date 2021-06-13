import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NewsfeedComponent} from './components/newsfeed/newsfeed.component';
import {PostFeedComponent} from "./components/post-feed/post-feed.component";
import {SHARED_ZORRO_MODULES} from "./shared-zorro.module";
import { NewPostModalComponent } from './components/new-post-modal/new-post-modal.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CKEditorModule} from "ckeditor4-angular";
import {GenderPipe} from "./pipes/gender.pipe";
import {StatePipe} from "./pipes/state.pipe";
import {EmploymentTypePipe} from "./pipes/employment-type.pipe";
import {EthnicPipe} from "./pipes/ethnic.pipe";


@NgModule({
  declarations: [NewsfeedComponent, PostFeedComponent, NewPostModalComponent,GenderPipe, StatePipe, EmploymentTypePipe, EthnicPipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CKEditorModule,
    ...SHARED_ZORRO_MODULES
  ],
  exports: [
    CommonModule,
    NewsfeedComponent,
    NewPostModalComponent,
    PostFeedComponent,
    ...SHARED_ZORRO_MODULES,
    GenderPipe,
    StatePipe,
    EmploymentTypePipe,
    EthnicPipe
  ]
})
export class SharedModule {
}
