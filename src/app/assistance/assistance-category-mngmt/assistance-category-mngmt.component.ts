import {Component, OnInit} from '@angular/core';
import {DropdownChoiceService} from "../../shared/services/dropdown-choice.service";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {DropdownChoiceModel} from "../../shared/models/dropdown-choice-model";
import {finalize} from "rxjs/operators";
import {NotificationService} from "../../shared/services/notification.service";
import {AssistanceService} from "../assistance.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {EventBusService} from "../../shared/services/event-bus.service";
import {EventData} from "../../shared/models/event-data";

@Component({
  selector: 'app-assistance-category-mngmt',
  templateUrl: './assistance-category-mngmt.component.html'
})
export class AssistanceCategoryMngmtComponent implements OnInit {

  categories: DropdownChoiceModel[] = [];
  isLoading: boolean = false;
  modalIsVisible: boolean = false;
  form: FormGroup;
  isUpdate: boolean;
  selectedCategory: any;

  constructor(private fb: FormBuilder,
              private dropdownChoiceService: DropdownChoiceService,
              private assistanceService: AssistanceService,
              private notificationService: NotificationService,
              private eventBusService: EventBusService) {
  }

  ngOnInit(): void {
    this.getAssistanceCategories();
  }

  getAssistanceCategories() {
    this.isLoading = true;
    this.dropdownChoiceService.getAssistanceCategoryDropdown()
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(resp => {
      if (resp && resp.status == HttpStatusConstant.OK) {
        this.categories = resp.data ? resp.data : [];
      }
    }, error => {
        if (error.status === HttpStatusConstant.FORBIDDEN) {
          this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
          this.eventBusService.emit(new EventData('logout', null));
        } else {
          const msg = error && error.error && error.error.message ? error.error.message : "There\'s an issue when retrieving assistance categories.";
          this.notificationService.createErrorNotification(msg);
        }
      })
  }

  deleteCategory(categoryId: number) {
    this.assistanceService.deleteCategory(categoryId).subscribe(resp => {
      if (resp && resp.status == HttpStatusConstant.OK) {
        this.notificationService.createSuccessNotification("Successfully deleted category [ID: " + categoryId + "].");
        this.getAssistanceCategories();
      }
    }, error => {
      if (error.status === HttpStatusConstant.FORBIDDEN) {
        this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
        this.eventBusService.emit(new EventData('logout', null));
      } else {
        const msg = error && error.error && error.error.message ? error.error.message : "There\'s an error when deleting category [ID: " + categoryId + "].";
        this.notificationService.createErrorNotification(msg);
      }
    })
  }

  openModal(categoryId?: boolean) {
    if (categoryId) {
      this.isUpdate = true;
      this.selectedCategory = this.categories.find(o => o.value === categoryId);
    }
    this.initForm();
    this.modalIsVisible = true;
  }

  addCategory() {
    if (this.form.valid) {
      this.assistanceService.addCategory(this.form.value).subscribe(resp => {
        if (resp && resp.status == HttpStatusConstant.OK) {
          this.notificationService.createSuccessNotification("Successfully created new category.");
          this.getAssistanceCategories();
          this.closeModal();
        }
      }, error => {
        if (error.status === HttpStatusConstant.FORBIDDEN) {
          this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
          this.eventBusService.emit(new EventData('logout', null));
        } else {
          const msg = error && error.error && error.error.message ? error.error.message : "There\' an error when creating new category.";
          this.notificationService.createErrorNotification(msg);
        }
      })
    }
  }

  updateCategory() {
    if (this.form.valid) {
      this.assistanceService.updateCategory(this.form.value).subscribe(resp => {
        if (resp && resp.status == HttpStatusConstant.OK) {
          this.notificationService.createSuccessNotification("Successfully updated category.");
          this.getAssistanceCategories();
          this.closeModal();
        }
      }, error => {
        if (error.status === HttpStatusConstant.FORBIDDEN) {
          this.notificationService.createErrorNotification("Your session has expired. For security reason, you have been auto logged out.");
          this.eventBusService.emit(new EventData('logout', null));
        } else {
          const msg = error && error.error && error.error.message ? error.error.message : "There\' an error when updating category.";
          this.notificationService.createErrorNotification(msg);
        }
      })
    }
  }

  closeModal() {
    this.selectedCategory = null;
    this.isUpdate = false;
    this.modalIsVisible = false;
  }

  private initForm() {
    this.form = this.fb.group({
      categoryId: [''],
      categoryName: ['', Validators.required]
    });
    if (this.isUpdate && this.selectedCategory) {
      this.form.patchValue({
        categoryId: parseInt(this.selectedCategory.value),
        categoryName: this.selectedCategory.text
      });
      this.form.controls['categoryId'].setValidators(Validators.required);
    }
  }
}
