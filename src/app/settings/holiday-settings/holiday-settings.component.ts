import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {HolidayService} from "../../shared/services/holiday.service";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {NotificationService} from "../../shared/services/notification.service";
import {DropdownChoiceModel} from "../../shared/models/dropdown-choice-model";
import {NzUploadFile} from "ng-zorro-antd/upload";
import {saveAs} from 'file-saver';
import {finalize} from "rxjs/operators";
import {EventBusService} from "../../shared/services/event-bus.service";
import {EventData} from "../../shared/models/event-data";

@Component({
    selector: 'app-holiday-settings',
    templateUrl: './holiday-settings.component.html'
})
export class HolidaySettingsComponent implements OnInit {
    isLoading: boolean = false;
    holidayList: any = [];
    displayHolidayList: any = [];
    queryForm: FormGroup;
    YEAR_LIST: DropdownChoiceModel[] = [];
    holidayFormModalIsVisible: boolean = false;
    isEditHoliday: boolean = false;
    holidayForm: FormGroup;
    addUsingExcel: boolean = false;
    fileList: NzUploadFile[] = [];
    readonly ACCEPTABLE_FILE_FORMAT = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];

    beforeUpload = (file: NzUploadFile): boolean => {
        if (!this.fileList.some(e => e.name === file.name) && this.ACCEPTABLE_FILE_FORMAT.includes(file.type)) {
            this.fileList = this.fileList.concat(file);
        }
        return false;
    };

    removeFile = (file: NzUploadFile): boolean => {
        const index = this.fileList.indexOf(file);
        if (index > -1) {
            this.fileList.splice(index, 1);
        }
        return false;
    }

    constructor(private fb: FormBuilder,
                private holidayService: HolidayService,
                private notificationService: NotificationService,
                private eventBusService: EventBusService) {
    }

    ngOnInit(): void {
        this.initYearList();
        this.initQueryForm();
        this.getHolidays();
    }

    private initQueryForm() {
        const year = new Date().getFullYear().toString(10);
        this.queryForm = this.fb.group({
            year: [year, Validators.required],
        })
    }

    getHolidays() {
        this.isLoading = true;
        this.holidayService.getHolidayModelList(this.queryForm.controls['year'].value)
            .pipe(finalize(() => {
                this.isLoading = false;
            }))
            .subscribe(resp => {
                if (resp && resp.status === HttpStatusConstant.OK) {
                    this.holidayList = resp.data ? resp.data : [];
                    this.displayHolidayList = [...this.holidayList];
                }
            }, error => {
                if (error.status === HttpStatusConstant.FORBIDDEN) {
                    this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
                    this.eventBusService.emit(new EventData('logout', null));
                } else {
                    const msg = error && error.error && error.error.message ? error.error.message : "There's an error when retrieving holiday list.";
                    this.notificationService.createErrorNotification(msg);
                }
            })
    }

    private initYearList() {
        const startYear = 2021;
        const endYear = (new Date().getFullYear() + 1);
        for (let i = startYear; i < endYear; i++) {
            this.YEAR_LIST.push({
                text: i.toString(10),
                value: i.toString(10)
            });
        }
    }

    addHoliday(isExcelForm: boolean) {
        this.addUsingExcel = isExcelForm
        this.isEditHoliday = false;
        if (!this.addUsingExcel) {
            this.initHolidayForm();
        }
        this.holidayFormModalIsVisible = true;
    }

    editHoliday(holidayId: number) {
        this.isEditHoliday = true;
        this.holidayFormModalIsVisible = true;
        this.initHolidayForm();
        this.holidayService.getHolidayById(holidayId).subscribe(resp => {
            if (resp && resp.status === HttpStatusConstant.OK) {
                this.patchHolidayForm(resp.data);
            }
        }, error => {
            if (error.status === HttpStatusConstant.FORBIDDEN) {
                this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
                this.eventBusService.emit(new EventData('logout', null));
            } else {
                const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when retrieving holiday details.";
                this.notificationService.createErrorNotification(msg);
            }
        })
    }

    closeModal() {
        this.holidayFormModalIsVisible = false;
        this.isEditHoliday = false;
        this.addUsingExcel = false;
    }

    updateHoliday() {
        if (!this.holidayForm.valid) {
            this.notificationService.createErrorNotification("Form is invalid.");
            return;
        }

        const form: { holidayId: number, holidayName: string, holidayDate: Date } = {
            holidayId: this.holidayForm.controls['holidayId'].value,
            holidayName: this.holidayForm.controls['holidayName'].value,
            holidayDate: this.holidayForm.controls['holidayDate'].value,
        }
        this.holidayService.updateHoliday(form).subscribe(resp => {
            if (resp && resp.status === HttpStatusConstant.OK) {
                this.notificationService.createSuccessNotification("Successfully updated holiday.");
                this.closeModal();
                this.getHolidays();
            }
        }, error => {
            if (error.status === HttpStatusConstant.FORBIDDEN) {
                this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
                this.eventBusService.emit(new EventData('logout', null));
            } else {
                const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when updating holiday.";
                this.notificationService.createErrorNotification(msg);
            }
        })
    }

    private initHolidayForm() {
        this.holidayForm = this.fb.group({
            holidayId: [''],
            holidayName: ['', Validators.required],
            holidayDate: ['', Validators.required]
        });

        if (this.isEditHoliday) {
            this.holidayForm.controls['holidayId'].setValidators(Validators.required);
        } else {
            this.holidayForm.controls['holidayId'].setValidators(null);
        }
    }

    private patchHolidayForm(data: any) {
        if (data) {
            this.holidayForm.patchValue({
                holidayId: data.holidayId,
                holidayName: data.holidayName,
                holidayDate: data.holidayDate
            })
        }
    }

    deleteHoliday(holidayId: number) {
        this.holidayService.deleteHoliday(holidayId).subscribe(resp => {
            if (resp && resp.status == HttpStatusConstant.OK) {
                this.notificationService.createSuccessNotification("Successfully deleted holiday.");
                this.getHolidays();
            }
        }, error => {
            if (error.status === HttpStatusConstant.FORBIDDEN) {
                this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
                this.eventBusService.emit(new EventData('logout', null));
            } else {
                const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when deleting holiday.";
                this.notificationService.createErrorNotification(msg);
            }
        })
    }

    saveHoliday() {
        if (!this.holidayForm.valid) {
            this.notificationService.createErrorNotification("Form is invalid.");
            return;
        }

        const form: { holidayName: string, holidayDate: Date } = {
            holidayName: this.holidayForm.controls['holidayName'].value,
            holidayDate: this.holidayForm.controls['holidayDate'].value,
        }

        this.holidayService.addHoliday(form).subscribe(resp => {
            if (resp && resp.status === HttpStatusConstant.OK) {
                this.notificationService.createSuccessNotification("Successfully added holiday.");
                this.closeModal();
                this.getHolidays();
            }
        }, error => {
            if (error.status === HttpStatusConstant.FORBIDDEN) {
                this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
                this.eventBusService.emit(new EventData('logout', null));
            } else {
                const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when adding holiday.";
                this.notificationService.createErrorNotification(msg);
            }
        })
    }

    saveHolidayUsingExcel() {
        if (this.addUsingExcel && (this.fileList && this.fileList.length !== 1)) {
            this.notificationService.createErrorNotification("Form is invalid.");
            return;
        }

        this.holidayService.addHolidayUsingExcel(this.fileList).subscribe(resp => {
            if (resp && resp.status === HttpStatusConstant.OK) {
                this.notificationService.createSuccessNotification("Successfully added holidays.");
                this.fileList = [];
                this.closeModal();
                this.getHolidays();
            }
        }, error => {
            if (error.status === HttpStatusConstant.FORBIDDEN) {
                this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
                this.eventBusService.emit(new EventData('logout', null));
            } else {
                const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when adding holidays.";
                this.notificationService.createErrorNotification(msg);
            }
        })
    }

    downloadExcelTpl() {
        this.holidayService.downloadHolidayExcelTpl().subscribe(resp => {
            saveAs(resp, "holiday.xlsx");
        }, error => {
            if (error.status === HttpStatusConstant.FORBIDDEN) {
                this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
                this.eventBusService.emit(new EventData('logout', null));
            } else {
                const msg = error && error.error && error.error.message ? error.error.message : "There\' an error when downloading file.";
                this.notificationService.createErrorNotification(msg);
            }
        })
    }
}
