import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CustomValidationService} from "../../shared/services/custom-validation.service";
import {AuthService} from "../../auth/auth.service";
import {finalize} from "rxjs/operators";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  submitted: boolean = false;
  invalidLogin: boolean = false;

  passwordIsVisible: boolean = false;

  constructor(private fb: FormBuilder,
              private customValidator: CustomValidationService,
              private authService: AuthService,
              private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  submitForm() {
    for (const i in this.loginForm.controls) {
      this.loginForm.controls[i].markAsDirty();
      this.loginForm.controls[i].updateValueAndValidity();
    }

    this.submitted = true;
    this.authService.login(this.loginForm.value)
      .pipe(finalize(() => {
        this.submitted = false;
        console.log(this.authService.isUserLoggedIn());
      }))
      .subscribe(resp => {
        this.router.navigate(['']);
    }, error => {
        this.invalidLogin = true;
        console.log("Encountered problem when logging in.", error);
    });
  }

}
