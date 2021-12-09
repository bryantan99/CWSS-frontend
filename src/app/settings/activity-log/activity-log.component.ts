import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {AuditService} from "../../shared/services/audit.service";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {NotificationService} from "../../shared/services/notification.service";
import {GeneralConstant} from "../../shared/constants/general-constant";
import {DropdownChoiceService} from "../../shared/services/dropdown-choice.service";
import {DropdownChoiceModel} from "../../shared/models/dropdown-choice-model";
import {finalize} from "rxjs/operators";

@Component({
  selector: 'app-activity-log',
  templateUrl: './activity-log.component.html'
})
export class ActivityLogComponent implements OnInit {

  form: FormGroup;
  isLoading: boolean = false;
  logList: any[] = [];
  descriptionModelIsVisible: boolean = false;
  readonly NZ_DATE_FORMAT = GeneralConstant.NZ_DATE_FORMAT;
  selectedObj: any = null;
  MODULE_LIST: DropdownChoiceModel[] = [];

  constructor(private fb: FormBuilder,
              private auditService: AuditService,
              private dropdownService: DropdownChoiceService,
              private notificationService: NotificationService) {
  }

  get moduleNameControl(): FormControl {
    return this.form.controls['moduleName'] as FormControl;
  }

  ngOnInit(): void {
    this.initModuleDropdown();
    this.initForm();
    this.getLog();
  }

  initForm() {
    this.form = this.fb.group({
      moduleName: ['']
    });
  }

  getLog() {
    const moduleName = this.moduleNameControl.value;
    this.isLoading = true;
    this.auditService.getAuditLogs(moduleName)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(resp => {
        if (resp && resp.status === HttpStatusConstant.OK) {
          this.logList = resp.data ? resp.data : [];
        }
      }, error => {
        this.isLoading = false;
        const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when retrieving audit logs.";
        this.notificationService.createErrorNotification(msg);
      })
  }

  viewDesc(auditId: number) {
    const foundObj = this.logList.find(obj => obj.auditId === auditId);
    if (foundObj) {
      this.selectedObj = foundObj;
      this.descriptionModelIsVisible = true;
    } else {
      this.selectedObj = null;
      this.descriptionModelIsVisible = false;
    }
  }

  closeModal() {
    this.selectedObj = null;
    this.descriptionModelIsVisible = false;
  }

  private initModuleDropdown() {
    this.dropdownService.getModuleDropdownChoices().subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.MODULE_LIST = resp.data ? resp.data : [];
      }
    }, error => {
      const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when retriving module list.";
      this.notificationService.createErrorNotification(msg);
    })
  }
}
