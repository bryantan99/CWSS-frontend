import {AbstractControl, AsyncValidatorFn} from "@angular/forms";
import {AuthService} from "../../auth/auth.service";
import {map} from "rxjs/operators";


export function uniqueUsernameValidator(authService: AuthService): AsyncValidatorFn {
  return (control: AbstractControl) => {
    return authService.isUniqueUsername(control.value).pipe(
      map(isUnique => {
        return isUnique ? null : {usernameTaken: true}
      })
    )
  }
}
