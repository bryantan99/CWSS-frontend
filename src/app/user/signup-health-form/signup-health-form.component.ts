import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormArray,
  FormBuilder,
  FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validators
} from "@angular/forms";

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

  @Input('parentDiseaseListFormValues') parentDiseaseListFormValues: {diseaseId: any; description: string}[] = [];
  healthForm: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.healthForm = this.fb.group({
      diseaseList: this.fb.array([])
    });

    if (this.parentDiseaseListFormValues) {
      for (let i = 0; i < this.parentDiseaseListFormValues.length ; i++) {
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
    return this.fb.group({
      diseaseId: ['', Validators.required],
      description: ['']
    })
  }

  onTouched: () => void = () => {
  };

  writeValue(val: any): void {
    val && this.healthForm.patchValue(val, {emitEvent: false});
  }

  registerOnChange(fn: any): void {
    console.log("on change");
    this.healthForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    console.log("on blur");
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.healthForm.disable() : this.healthForm.enable();
  }

  validate(c: AbstractControl): ValidationErrors | null {
    console.log("Health Form validation", c);
    return this.healthForm.valid ? null : {
      invalidForm: {
        valid: false,
        message: "Health Form has invalid field(s)."
      }
    };
  }
}
