import {Component, EventEmitter, Input, OnInit} from '@angular/core';
import {AssistanceService} from "../assistance.service";
import {NotificationService} from "../../shared/services/notification.service";
import {finalize} from "rxjs/operators";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {GeneralConstant} from "../../shared/constants/general-constant";
import {EventBusService} from "../../shared/services/event-bus.service";
import {EventData} from "../../shared/models/event-data";
import {NzUploadFile} from "ng-zorro-antd/upload";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ImageService} from "../../shared/services/image.service";
import {User} from "../../shared/models/user";
import {AuthService} from "../../auth/auth.service";

@Component({
    selector: 'app-assistance-comment',
    templateUrl: './assistance-comment.component.html',
    styles: [
        `
            :host ::ng-deep .upload-list-inline .ant-upload-list-item {
                float: left;
                width: 200px;
                margin-right: 8px;
            }

            :host ::ng-deep .upload-list-inline [class*='-upload-list-rtl'] .ant-upload-list-item {
                float: right;
            }

            :host ::ng-deep .upload-list-inline .ant-upload-animate-enter {
                animation-name: uploadAnimateInlineIn;
            }

            :host ::ng-deep .upload-list-inline .ant-upload-animate-leave {
                animation-name: uploadAnimateInlineOut;
            }
        `
    ]
})
export class AssistanceCommentComponent implements OnInit {
    @Input() assistanceId: number;
    @Input() nzEdit: boolean = false;
    commentList: any = [];
    commentDisplayList: any = [];
    isSubmitting: boolean = false;
    isLoading: boolean = false;
    pageIndex: number = 1;
    pageSize: number = 5;
    readonly DATE_FORMAT = GeneralConstant.NZ_DATE_FORMAT;
    readonly ACCEPTABLE_FILE_FORMAT = ['image/jpeg', 'image/png'];
    fileList: NzUploadFile[] = [];
    commentForm: FormGroup;
    fileListValueChanges: EventEmitter<any> = new EventEmitter<any>();
    user: User;

    beforeUpload = (file: NzUploadFile): boolean => {
        if (!this.fileList.some(e => e.name === file.name) && this.ACCEPTABLE_FILE_FORMAT.includes(file.type)) {
            this.fileList = this.fileList.concat(file);
            this.fileListValueChanges.emit(this.fileList);
        }
        return false;
    };

    removeFile = (file: NzUploadFile): boolean => {
        const index = this.fileList.indexOf(file);
        if (index > -1) {
            this.fileList.splice(index, 1);
            this.fileListValueChanges.emit(this.fileList);
        }
        return false;
    }

    constructor(private assistanceService: AssistanceService,
                private notificationService: NotificationService,
                private eventBusService: EventBusService,
                private fb: FormBuilder,
                private imageService: ImageService,
                private authService: AuthService) {
        this.authService.user.subscribe(resp => {
            this.user = resp;
        });
    }

    ngOnInit(): void {
        this.initForm();
        this.findComments();
    }

    handleSubmit(): void {
        this.isSubmitting = true;
        this.assistanceService.addComment(this.commentForm.value, this.fileList)
            .pipe(finalize(() => {
                this.isSubmitting = false;
            }))
            .subscribe(resp => {
                if (resp && resp.status === HttpStatusConstant.OK) {
                    this.findComments();
                    this.initForm();
                }
            }, error => {
                this.isSubmitting = false;
                if (error.status === HttpStatusConstant.FORBIDDEN) {
                    this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
                    this.eventBusService.emit(new EventData('logout', null));
                } else {
                    this.notificationService.createErrorNotification("There\'s an error when adding new comment.");
                }
            });
    }

    findComments() {
        this.assistanceService.findComments(this.assistanceId)
            .pipe(finalize(() => {
                this.isLoading = false;
            }))
            .subscribe(resp => {
                if (resp && resp.status === HttpStatusConstant.OK) {
                    this.commentList = resp.data ? resp.data : [];
                    this.initCommentDisplayList();
                }
            }, error => {
                this.isLoading = false;
                this.commentList = [];
                if (error.status === HttpStatusConstant.FORBIDDEN) {
                    this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
                    this.eventBusService.emit(new EventData('logout', null));
                } else {
                    this.notificationService.createErrorNotification("There\'s an error when retrieving comment list.");
                }
            })
    }

    initCommentDisplayList() {
        const startPoint = (this.pageIndex - 1) * this.pageSize;
        const endPoint = startPoint + this.pageSize;
        this.commentDisplayList = this.commentList.slice(startPoint, endPoint);
    }

    private initForm() {
        this.commentForm = this.fb.group({
            commentDesc: [''],
            assistanceId: [this.assistanceId, [Validators.required]]
        })
        this.fileList = [];

        if (!this.nzEdit) {
            this.commentForm.controls['commentDesc'].disable();
        } else {
            this.commentForm.controls['commentDesc'].enable();
        }
    }

    getAssistanceCommentMediaImg(commentId: number, imgName: any) {
        return this.imageService.getAssistanceCommentImg(commentId, imgName);
    }
}
