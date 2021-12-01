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
//  Min reqs: Contains at least a digit, a lowercase letter, an uppercase letter and minimum length is 8 characters
export function passwordValidator(): ValidatorFn {
  return (control: FormControl): { [key: string]: boolean } | null => {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
    const password: string = control.value;

    if (password && password.search(regex) == -1) {
      return {invalidPassword: true};
    }
    return null;
  }
}

//  Checks if the contact no. is valid
//  Min reqs: 9 - 11 digits only
export function phoneNumberValidator(): ValidatorFn {
  return (control: FormControl): {[key: string]: boolean} | null => {
    const digitsOnlyRegex = /^[0-9]*$/;
    const phoneNo: string = control.value;
    if (phoneNo && (phoneNo.search(digitsOnlyRegex) == -1 || phoneNo.length < 9 || phoneNo.length > 11 || !phoneNo.startsWith("0"))) {
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

export function nricValidator(): ValidatorFn {
  return (control: FormControl): {[key: string]: boolean} | null => {
    const digitsOnlyRegex = /^[0-9]*$/;
    const nric: string = control.value;
    if (nric && (nric.search(digitsOnlyRegex) == -1 || nric.length !== 12 )) {
      return {invalidNric: true};
    }
    return null;
  }
}

