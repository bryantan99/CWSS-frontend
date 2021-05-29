import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NewsfeedComponent} from './components/newsfeed/newsfeed.component';
import {PostFeedComponent} from "./components/post-feed/post-feed.component";
import {SHARED_ZORRO_MODULES} from "./shared-zorro.module";
import { NewPostModalComponent } from './components/new-post-modal/new-post-modal.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CKEditorModule} from "ckeditor4-angular";


@NgModule({
  declarations: [NewsfeedComponent, PostFeedComponent, NewPostModalComponent],
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
    ...SHARED_ZORRO_MODULES
  ]
})
export class SharedModule {
}
