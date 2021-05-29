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
  @Output() modalIsVisibleEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() addNewPostEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  nzTitle: string = "Create New Post";
  postForm: FormGroup;
  fileList: NzUploadFile[] = [];
  isSubmitted: boolean = false;
  isUploading: boolean = false;
  EDITOR_CONFIG = CkEditorConstants.DEFAULT_CONFIG;
  EDITOR_URL: string = CkEditorConstants.EDITOR_URL;

  constructor(private fb: FormBuilder,
              private adminPostService: AdminPostService) { }

  ngOnInit(): void {
    this.postForm = this.fb.group({
      postDescription: ['', Validators.required]
    });
  }

  handleOk(): void {
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

  handleCancel() {
    this.isVisible = false;
    this.resetForm();
    this.emitIsVisible();
  }

  emitIsVisible() {
    this.modalIsVisibleEmitter.emit(this.isVisible);
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    if (!this.fileList.some(e => e.name === file.name)) {
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
}
