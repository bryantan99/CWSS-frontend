import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {SignupService} from "../signup.service";
import {SignupPersonalDetailFormComponent} from "../signup-personal-detail-form/signup-personal-detail-form.component";
import {SignupAddressFormComponent} from "../signup-address-form/signup-address-form.component";
import {Router} from "@angular/router";
import {NotificationService} from "../../shared/services/notification.service";
import {AuthService} from "../../auth/auth.service";
import {User} from "../../shared/models/user";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html'
})
export class SignupComponent implements OnInit {

  @ViewChild(SignupPersonalDetailFormComponent) personalDetailFormComponent: SignupPersonalDetailFormComponent;
  @ViewChild(SignupAddressFormComponent) addressFormComponent: SignupAddressFormComponent;

  form: FormGroup;
  user: User;

  constructor(private fb: FormBuilder,
              private signupService: SignupService,
              private notificationService: NotificationService,
              private router: Router,
              private authService: AuthService) {
    this.authService.user.subscribe(resp => {
      this.user = resp;
      if (this.user) {
        this.router.navigate(['/']);
      }
    })
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      personalDetail: new FormControl(""),
      address: new FormControl(""),
    });
  }

  submitForm() {
    this.form.controls['personalDetail'].updateValueAndValidity({emitEvent: false});
    this.form.controls['address'].updateValueAndValidity({emitEvent: false});

    if (!this.form.valid) {
      const invalidFormList = this.filterInvalidForm();
      this.displayInvalidFormNotification(invalidFormList);
      return;
    }

    this.signupService.registerAccount(this.form.value).subscribe(resp => {
      if (resp) {
        this.notificationService.createSuccessNotification("You've successfully registered an account!");
        this.router.navigate(['login']);
      }
    }, error => {
      const msg = error && error.error && error.error.message ? error.error.message : "There's an error when submitting form.";
      this.notificationService.createErrorNotification(msg);
    });
  }

  private filterInvalidForm(): string[] {
    let formName: string[] = [];
    Object.keys(this.form.controls).forEach(key => {
      if (!this.form.controls[key].valid) {
        key = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
        key = key.replace(/\w\S*/g,
          function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          })
        formName.push(key);
      }
    });
    return formName;
  }

  private displayInvalidFormNotification(invalidForms: string[]) {
    let errorMsg = "The following form(s) has invalid input fields. Please double check the form.<br/>";
    invalidForms.forEach(name => {
      errorMsg += "- " + name + "<br/>"
    })
    this.notificationService.createErrorNotification(errorMsg)
  }
}
