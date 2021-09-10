import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AssistanceService} from "../assistance.service";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {NotificationService} from "../../shared/services/notification.service";

@Component({
  selector: 'app-assistance-detail',
  templateUrl: './assistance-detail.component.html'
})
export class AssistanceDetailComponent implements OnInit {

  @Input() isEdit: boolean = false;
  @Output() refreshListEventEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() modalIsVisibleEventEmitter: EventEmitter<any> = new EventEmitter<any>();
  nzTitle: string;
  form: FormGroup;

  constructor(private fb: FormBuilder,
              private assistanceService: AssistanceService,
              private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      categoryId: ['', Validators.required],
      assistanceTitle: ['', Validators.required],
      assistanceDescription: ['', Validators.required],
    });
  }

  submit() {
    for (const key in this.form.controls) {
      this.form.controls[key].markAsTouched();
      this.form.controls[key].markAsDirty();
      this.form.controls[key].updateValueAndValidity();
    }

    if (this.form.valid) {
      this.assistanceService.addAssistance(this.form.value).subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.CREATED) {
          this.notificationService.createSuccessNotification("Created new assistance request.");
          this.refreshListEventEmitter.emit({refreshList: true});
          this.modalIsVisibleEventEmitter.emit({modalIsVisible: false});
        }
      }, error => {
        this.notificationService.createErrorNotification("There\'s an error when adding new assistance request.");
        console.log(error.error);
      });
    }
  }
}
