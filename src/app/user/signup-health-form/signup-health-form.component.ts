import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormArray,
  FormBuilder, FormControl,
  FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validators
} from "@angular/forms";
import {DropdownChoiceService} from "../../shared/services/dropdown-choice.service";
import {DropdownChoiceModel} from "../../shared/models/dropdown-choice-model";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {NotificationService} from "../../shared/services/notification.service";

@Component({
  selector: 'app-signup-health-form',
  templateUrl: './signup-health-form.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SignupHealthFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SignupHealthFormComponent),
      multi: true
    }
  ]
})
export class SignupHealthFormComponent implements OnInit, ControlValueAccessor {

  @Input('parentDiseaseListFormValues') parentDiseaseListFormValues: { diseaseId: any; description: string }[] = [];
  @Input('isVisible') isVisible: boolean;
  @Input('isSignUp') isSignUp: boolean;
  healthForm: FormGroup;
  diseaseDropdownList: DropdownChoiceModel[] = [];

  constructor(private fb: FormBuilder,
              private dropdownChoiceService: DropdownChoiceService,
              private notificationService: NotificationService) {
    this.initDiseaseDropdownList();
  }

  ngOnInit(): void {
    this.healthForm = this.fb.group({
      diseaseList: this.fb.array([])
    });

    if (this.parentDiseaseListFormValues) {
      for (let i = 0; i < this.parentDiseaseListFormValues.length; i++) {
        this.addDiseaseFormGroup();
      }
    }
  }

  get diseaseList(): FormArray {
    return this.healthForm.get('diseaseList') as FormArray;
  }

  addDiseaseFormGroup() {
    this.diseaseList.push(this.initDiseaseForm())
  }

  deleteDiseaseFormGroup(index: number) {
    this.diseaseList.removeAt(index);
  }

  private initDiseaseForm() {
    const fg = this.fb.group({
      issueId: [null],
      diseaseId: ['', Validators.required],
      description: ['']
    });

    if (this.isSignUp) {
      fg.get('description').setValidators([Validators.required]);
    }

    return fg;
  }

  onTouched: () => void = () => {
  };

  writeValue(val: any): void {
    val && this.healthForm.patchValue(val, {emitEvent: false});
  }

  registerOnChange(fn: any): void {
    this.healthForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.healthForm.disable() : this.healthForm.enable();
  }

  validate(c: AbstractControl): ValidationErrors | null {
    return this.healthForm.valid ? null : {
      invalidForm: {
        valid: false,
        message: "Health Form has invalid field(s)."
      }
    };
  }

  setDirty() {
    this.markAsDirty(this.healthForm);
  }

  markAsDirty(group: FormGroup | FormArray) {
    group.markAsTouched()
    for (let i in group.controls) {
      if (group.controls[i] instanceof FormControl) {
        const fc: FormControl = group.controls[i];
        fc.markAsDirty();
      } else {
        this.markAsDirty(group.controls[i]);
      }
    }
  }

  private initDiseaseDropdownList() {
    this.diseaseDropdownList = [];
    this.dropdownChoiceService.getDiseaseDropdownChoices().subscribe(resp => {
      if (resp && resp.status === HttpStatusConstant.OK) {
        this.diseaseDropdownList = resp.data ? resp.data : [];
      }
    }, () => {
      this.notificationService.createErrorNotification("There's an error when retrieving disease dropdown choice list.");
    })
  }

  getValidity(): boolean {
    return this.healthForm.valid;
  }
}
