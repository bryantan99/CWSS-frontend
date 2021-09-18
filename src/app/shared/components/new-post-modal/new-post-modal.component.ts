import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AdminPostService} from "../../services/admin-post.service";
import {CkEditorConstants} from "../../constants/ck-editor-constants";
import {NzUploadFile} from "ng-zorro-antd/upload";

@Component({
  selector: 'app-new-post-modal',
  templateUrl: './new-post-modal.component.html'
})
export class NewPostModalComponent implements OnInit {
  @Input() isVisible: boolean;
  @Input() postId: number | null;
  @Output() modalIsVisibleEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() addNewPostEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  nzEdit: boolean = false;
  nzTitle: string;
  postForm: FormGroup;
  fileList: NzUploadFile[] = [];
  isSubmitted: boolean = false;
  isUploading: boolean = false;
  EDITOR_CONFIG = CkEditorConstants.DEFAULT_CONFIG;
  EDITOR_URL: string = CkEditorConstants.EDITOR_URL;
  readonly MAX_FILE_LIMIT: number = 5;
  readonly ACCEPTABLE_FILE_FORMAT = ['image/jpeg', 'image/png'];

  constructor(private fb: FormBuilder,
              private adminPostService: AdminPostService) {
  }

  ngOnInit(): void {
    this.postForm = this.fb.group({
      postId: [null],
      postDescription: ['', Validators.required]
    });
    this.nzTitle = this.nzEdit ? "Edit Post" : "Create New Post";
  }

  editPost(postId: number) {
    if (!postId) {
      return;
    }

    this.nzEdit = true;
    this.nzTitle = "Edit Post";
    this.isVisible = true;
    this.getPost(postId);
  }

  handleOkCreate(): void {
    for (const key in this.postForm.controls) {
      this.postForm.controls[key].markAsDirty();
      this.postForm.controls[key].markAsTouched();
      this.postForm.controls[key].updateValueAndValidity();
    }

    if (this.postForm.valid) {
      this.isSubmitted = true;
      this.adminPostService.addAdminPost(this.postForm.value, this.fileList)
        .subscribe(resp => {
          if (resp) {
            this.isVisible = false;
            this.emitIsVisible();
            this.emitAddNewPost();
            this.resetForm();
            this.isSubmitted = false;
          }
        }, error => {
          console.log("There's an error when creating new post.", error);
          this.isSubmitted = false;
        });
    }
  }

  handleOkUpdate(): void {
    if (this.postForm.valid) {
      this.isSubmitted = true;
      this.adminPostService.updatePost(this.postForm.value, this.fileList)
        .subscribe(resp => {
          if (resp) {
            this.isVisible = false;
            this.emitIsVisible();
            this.emitAddNewPost();
            this.resetForm();
            this.isSubmitted = false;
          }
        }, error => {
          console.log("There's an error when updating post.", error);
          this.isSubmitted = false;
        });
    }
  }

  handleCancel() {
    this.isVisible = false;
    this.resetForm();
    this.emitIsVisible();
  }

  emitIsVisible() {
    this.modalIsVisibleEmitter.emit(this.isVisible);
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    if (!this.fileList.some(e => e.name === file.name) && this.fileList.length < this.MAX_FILE_LIMIT && this.ACCEPTABLE_FILE_FORMAT.includes(file.type)) {
      this.fileList = this.fileList.concat(file);
    }
    return false;
  };

  private resetForm() {
    this.postForm.reset();
    this.fileList = [];
  }

  private emitAddNewPost() {
    this.addNewPostEmitter.emit(true);
  }

  private getPost(postId: number) {
    this.adminPostService.getOneAdminPost(postId).subscribe(resp => {
      this.patchForm(resp);
    }, error => {
      console.log("There's an error when retrieving post with Id " + postId);
    })
  }

  private patchForm(resp: any) {
    this.postForm.patchValue({
      postId: resp.postId,
      postDescription: resp.postDescription
    });
  }
}
