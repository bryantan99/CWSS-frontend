import { Pipe, PipeTransform } from '@angular/core';
import {DropdownConstant} from "../constants/dropdown-constant";

@Pipe({
  name: 'ethnic'
})
export class EthnicPipe implements PipeTransform {

  readonly ETHNIC_DROPDOWN = DropdownConstant.ETHNIC_DROPDOWN;

  transform(value: string): string {
    const obj = this.ETHNIC_DROPDOWN.find(obj => obj.value === value);
    return obj ? obj.text : '-';
  }

}
