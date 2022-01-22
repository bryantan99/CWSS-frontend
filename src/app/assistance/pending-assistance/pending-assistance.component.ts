import {Component, OnInit, ViewChild} from '@angular/core';
import {AssistanceService} from "../assistance.service";
import {NotificationService} from "../../shared/services/notification.service";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {finalize} from "rxjs/operators";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AssistanceFormComponent} from "../assistance-form/assistance-form.component";
import {EventBusService} from "../../shared/services/event-bus.service";
import {EventData} from "../../shared/models/event-data";

@Component({
  selector: 'app-pending-assistance',
  templateUrl: './pending-assistance.component.html'
})
export class PendingAssistanceComponent implements OnInit {

  @ViewChild(AssistanceFormComponent) assistanceFormComponent: AssistanceFormComponent;
  assistanceRequests: any[] = [];
  isLoading: boolean = false;
  filterForm: FormGroup;
  filterDrawerIsVisible: boolean = false;
  assistanceFormIsVisible: boolean = false;

  constructor(private fb: FormBuilder,
              private assistanceService: AssistanceService,
              private notificationService: NotificationService,
              private eventBusService: EventBusService) {
  }

  ngOnInit(): void {
    this.initFilterForm();
    this.getPendingAssistanceRecords();
  }

  getPendingAssistanceRecords() {
    this.isLoading = true;
    this.assistanceService.getPendingAssistanceRecords(this.filterForm.controls['assistanceId'].value)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.assistanceRequests = resp.data ? resp.data : [];
        }
      }, error => {
        this.isLoading = false;
        if (error.status === HttpStatusConstant.FORBIDDEN) {
          this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
          this.eventBusService.emit(new EventData('logout', null));
        } else {
          const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when retrieving all pending assistance requests(s).";
          this.notificationService.createErrorNotification(msg);
        }
      })
  }

  refreshTable(data: boolean) {
    if (data) {
      this.getPendingAssistanceRecords();
    }
  }

  private initFilterForm() {
    this.filterForm = this.fb.group({
      assistanceId: ['', [Validators.pattern(/^(?:[1-9]\d*|0)$/)]]
    });
  }

  closeFilterDrawer() {
    this.filterDrawerIsVisible = false;
  }

  openFilterDrawer() {
    this.filterDrawerIsVisible = true;
  }

  resetFilterSettings() {
    this.initFilterForm();
    this.searchByFilter();
  }

  searchByFilter() {
    this.closeFilterDrawer();
    this.getPendingAssistanceRecords();
  }

  openAddAssistanceModal() {
    this.assistanceFormIsVisible = true;
  }

  cancelNewAssistance() {
    this.assistanceFormIsVisible = false;
  }

  submitNewAssistance() {
    this.assistanceFormComponent.submit();
  }

  modalVisibleHasChange(data: any) {
    this.assistanceFormIsVisible = data.modalIsVisible;
  }

  listHasChange(data: any) {
    if (data.refreshList) {
      this.getPendingAssistanceRecords();
    }
  }
}
