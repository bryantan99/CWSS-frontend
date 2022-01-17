import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AdminPostService} from "../../services/admin-post.service";
import {CkEditorConstants} from "../../constants/ck-editor-constants";
import {NzUploadFile} from "ng-zorro-antd/upload";
import {HttpStatusConstant} from "../../constants/http-status-constant";
import {ImageService} from "../../services/image.service";
import {NotificationService} from "../../services/notification.service";
import {EventData} from "../../models/event-data";
import {EventBusService} from "../../services/event-bus.service";

@Component({
  selector: 'app-new-post-modal',
  templateUrl: './new-post-modal.component.html'
})
export class NewPostModalComponent implements OnInit, OnChanges {
  @Input() isVisible: boolean;
  @Input() postId: number | null;
  @Output() modalIsVisibleEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() addNewPostEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() nzEdit: boolean = false;
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
              private adminPostService: AdminPostService,
              private imageService: ImageService,
              private notificationService: NotificationService,
              private eventBusService: EventBusService) {
  }

  ngOnInit(): void {
    if (this.isVisible) {
      this.initForm();
      this.nzTitle = this.nzEdit ? "Edit Post" : "Create New Post";
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.isVisible) {
      this.initForm();
      this.nzTitle = this.nzEdit ? "Edit Post" : "Create New Post";
    }
  }

  editPost(postId: number) {
    if (!postId) {
      return;
    }

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
          this.isSubmitted = false;
          if (error.status === HttpStatusConstant.FORBIDDEN) {
            this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
            this.eventBusService.emit(new EventData('logout', null));
          } else {
            this.notificationService.createErrorNotification("There's an error when creating new post.");
          }
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
          this.isSubmitted = false;
          if (error.status === HttpStatusConstant.FORBIDDEN) {
            this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
            this.eventBusService.emit(new EventData('logout', null));
          } else {
            this.notificationService.createErrorNotification("There's an error when updating post.");
          }
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

  removeFile = (file: NzUploadFile): boolean => {
    const index = this.fileList.indexOf(file);
    if (index > -1) {
      const postIdsToBeDeleted: number[] = this.postForm.get('postMediaIdsToBeDeleted').value ? this.postForm.get('postMediaIdsToBeDeleted').value : [];
      postIdsToBeDeleted.push(parseInt(file.uid));
      this.postForm.patchValue({
        postIdsToBeDeleted: postIdsToBeDeleted
      })
      this.fileList.splice(index, 1);
    }
    return false;
  }

  private resetForm() {
    this.postForm.reset();
    this.fileList = [];
  }

  private emitAddNewPost() {
    this.addNewPostEmitter.emit(true);
  }

  private getPost(postId: number) {
    this.adminPostService.getPost(postId).subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK && resp.data) {
        this.patchForm(resp.data);
      }
    }, error => {
      if (error.status === HttpStatusConstant.FORBIDDEN) {
        this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
        this.eventBusService.emit(new EventData('logout', null));
      } else {
        this.notificationService.createErrorNotification("There\'s an error when retrieving post ID: " + postId.toString(10));
      }
    })
  }

  private patchForm(resp: any) {
    this.postForm.patchValue({
      postId: resp.postId,
      postDescription: resp.postDescription,
      postMediaIdsToBeDeleted: []
    });

    if (resp.postMediaBeanSet) {
      const mediaList: { mediaId: number, postId: number, mediaType: string, mediaDirectory: string }[] = resp.postMediaBeanSet;
      const list = [];
      for (const media of mediaList) {
        const obj: NzUploadFile = {
          uid: media.mediaId.toString(10),
          name: media.mediaDirectory,
          status: 'done',
          url: this.imageService.getPostImg(media.postId, media.mediaDirectory),
          thumbUrl: this.imageService.getPostImg(media.postId, media.mediaDirectory)
        }
        list.push(obj);
      }
      this.fileList = [...list];
    }
  }

  private initForm() {
    this.postForm = this.fb.group({
      postId: [null],
      postDescription: ['', Validators.required],
      postMediaIdsToBeDeleted: [[]]
    });
  }
}
