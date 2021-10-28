import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {

  form: FormGroup;
  readonly options = [
    {
      text: 'Account',
      value: 'account'
    }
  ]

  get optionIdFormControl(): FormControl {
    return this.form.controls['optionId'] as FormControl;
  }

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  ngOnInit(): void {
  }

  private initForm() {
    this.form = this.fb.group({
      optionId: this.fb.control(this.options[0].value)
    });
  }
}
