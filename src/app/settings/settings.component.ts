import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {AuthService} from "../auth/auth.service";
import {User} from "../shared/models/user";
import {RoleConstant} from "../shared/constants/role-constant";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {

  form: FormGroup;
  options = [];
  isSuperAdmin: boolean = false;
  user: User;

  get optionIdFormControl(): FormControl {
    return this.form.controls['optionId'] as FormControl;
  }

  constructor(private fb: FormBuilder,
              private authService: AuthService) {
    this.authService.user.subscribe(resp => {
      this.user = resp;
      this.isSuperAdmin = this.authService.hasRole(RoleConstant.ROLE_SUPER_ADMIN);
    })
  }

  ngOnInit(): void {
    this.initOptions();
    this.initForm();
  }

  private initForm() {
    this.form = this.fb.group({
      optionId: this.fb.control(this.options[0].value)
    });
  }

  private initOptions() {
    let options = [
      {
        text: 'Account',
        value: 'account',
      }
    ]

    if (this.isSuperAdmin) {
      options.push({
        text: 'Activity Log',
        value: 'activity-log'
      });
    }

    this.options = options;
  }
}
