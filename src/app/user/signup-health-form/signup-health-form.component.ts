import {Component, Input, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-signup-health-form',
  templateUrl: './signup-health-form.component.html'
})
export class SignupHealthFormComponent implements OnInit {
  healthForm: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.healthForm = this.fb.group({
      diseaseList: this.fb.array([])
    });
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
}
