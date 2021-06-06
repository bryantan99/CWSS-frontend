import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {SignupService} from "../signup.service";
import {SignupHealthFormComponent} from "../signup-health-form/signup-health-form.component";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html'
})
export class SignupComponent implements OnInit {

  @ViewChild(SignupHealthFormComponent) healthFormComponent: SignupHealthFormComponent;

  form: FormGroup;
  stepIndex: number = 0;

  constructor(private fb: FormBuilder,
              private signupService: SignupService) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      personalDetail: new FormControl(""),
      address: new FormControl(""),
      occupation: new FormControl(""),
      health: new FormControl("")
    });
  }

  submitForm() {
    console.log(this.form.value);
    if (this.form.valid) {
      this.signupService.registerAccount(this.form.value).subscribe(resp => {
        if (resp == "OK") {
          console.log("Account created successfully.");
        }
      });
    }
  }

  onIndexChange(index: number) {
    this.stepIndex = index;
  }

  movePage(newIndex: number) {
    this.stepIndex = newIndex;
  }

  addDiseaseFormGroup() {
    this.healthFormComponent.addDiseaseFormGroup();
  }
}
