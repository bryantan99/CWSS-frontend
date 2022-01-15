import {AbstractControl, FormControl, ValidatorFn} from "@angular/forms";


//  Checks if the confirmPassword matches the password
export function confirmPasswordMatchValidator(passwordFormControl: AbstractControl): ValidatorFn {
  return (control: FormControl): { [key: string]: boolean } | null => {
    const password = passwordFormControl.value;
    const confirmPassword = control.value;
    if (confirmPassword && confirmPassword !== password) {
      return {passwordNotMatch: true};
    }
    return null;
  }
}

//  Checks if the password meets the minimum requirements
//  Reqs: Contains at least a digit, a lowercase letter, an uppercase letter and minimum length is 8 characters
//  Allowed characters: @$!%*?&.
export function passwordValidator(): ValidatorFn {
  return (control: FormControl): { [key: string]: boolean } | null => {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z@$!%*?&.]{8,}$/;
    const password: string = control.value;

    if (password && password.search(regex) == -1) {
      return {invalidPassword: true};
    }
    return null;
  }
}

//  Checks if the contact no. is valid by following Malaysia's standard
export function phoneNumberValidator(): ValidatorFn {
  return (control: FormControl): {[key: string]: boolean} | null => {
    const phoneNumberRegex = /^(\+?6?01)[02-46-9]-*[0-9]{7}$|^(\+?6?01)[1]-*[0-9]{8}$/;
    const phoneNo: string = control.value;
    if (phoneNo && (phoneNo.search(phoneNumberRegex) == -1)) {
      return {invalidContactNo: true};
    }
    return null;
  }
}

//  Checks if the postcode is valid ( 5 digits )
export function postCodeValidator(): ValidatorFn {
  return (control: FormControl): {[key: string]: boolean} | null => {
    const digitsOnlyRegex = /^[0-9]*$/;
    const postCode: string = control.value;
    if (postCode && (postCode.search(digitsOnlyRegex) == -1 || postCode.length !== 5 )) {
      return {invalidPostCode: true};
    }
    return null;
  }
}

// https://stackoverflow.com/questions/53663245/regex-needed-for-ic-number-validation
export function nricValidator(): ValidatorFn {
  return (control: FormControl): {[key: string]: boolean} | null => {
    const digitsOnlyRegex = /^\d{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])(0[1-9]|1[0-6]|2[1-9]|3[0-9]|4[0-9]|5[0-9]|6[0-8]|7[1-24-9]|8[2-9]|9[0-38-9])\d{4}$/;
    const nric: string = control.value;
    if (nric && nric.search(digitsOnlyRegex) == -1) {
      return {invalidNric: true};
    }
    return null;
  }
}

/*
  Username requirements:
  - 5-20 characters long
  - no _ or . at the beginning
  - no __ or _. or ._ or .. inside
  - allowed characters (a-zA-Z0-9._)
  - no _ or . at the end
  https://stackoverflow.com/questions/12018245/regular-expression-to-validate-username
 */
export function usernameValidator(): ValidatorFn {
  return (control: FormControl): { [key: string]: boolean } | null => {
    const usernameRegex = /^(?=.{5,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/;
    const username: string = control.value;
    if (username && (username.search(usernameRegex) == -1)) {
      return {invalidUsername: true};
    }
    return null;
  }
}
