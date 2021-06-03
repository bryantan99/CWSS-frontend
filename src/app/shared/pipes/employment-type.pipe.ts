import { Pipe, PipeTransform } from '@angular/core';
import {DropdownConstant} from "../constants/dropdown-constant";

@Pipe({
  name: 'employmentType'
})
export class EmploymentTypePipe implements PipeTransform {

  EMPLOYMENT_TYPE_LIST = DropdownConstant.EMPLOYMENT_TYPE_DROPDOWN;

  transform(value: string): string {
    let obj = this.EMPLOYMENT_TYPE_LIST.find(obj => obj.value === value);
    return obj ? obj.text : '-';
  }

}
