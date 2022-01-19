import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../auth/auth.service";
import {finalize} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";
import {HttpStatusConstant} from "../../shared/constants/http-status-constant";
import {User} from "../../shared/models/user";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  submitted: boolean = false;
  errorMsg: string;

  passwordIsVisible: boolean = false;
  user: User;

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute) {
    this.authService.user.subscribe(resp => {
      this.user = resp;
      if (this.user) {
        this.router.navigate(['/']);
      }
    })
  }

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
      }))
      .subscribe({
        next: () => {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
        }, error: error => {
          this.submitted = false;
          if (error.status === HttpStatusConstant.NO_RESPONSE) {
            this.errorMsg = "Internal server error. Please contact the administrator.";
          } else if (error.status === HttpStatusConstant.UNAUTHORIZED) {
            this.errorMsg = error.error.message;
          } else {
            this.errorMsg = "There\'s an error when trying to log in.";
          }
        }
      });
  }
}
