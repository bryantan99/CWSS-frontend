import {AbstractControl, AsyncValidatorFn} from "@angular/forms";
import {AuthService} from "../../auth/auth.service";
import {map} from "rxjs/operators";
import {HttpStatusConstant} from "../constants/http-status-constant";


export function uniqueUsernameValidator(authService: AuthService): AsyncValidatorFn {
  return (control: AbstractControl) => {
    return authService.isUniqueUsername(control.value).pipe(
      map(resp => {
        return resp && resp.data ? null : {usernameTaken: true}
      })
    )
  }
}

export function uniqueEmailValidator(authService: AuthService, oriValue?: string): AsyncValidatorFn {
    return (control: AbstractControl) => {
        if (oriValue && oriValue == control.value) {
            return Promise.resolve(null);
        }
        return authService.isUniqueEmail(control.value).pipe(
            map(resp => {
                if (resp && resp.status === HttpStatusConstant.OK) {
                    return resp.data ? null : {emailTaken: true}
                }
            })
        )
    }
}
