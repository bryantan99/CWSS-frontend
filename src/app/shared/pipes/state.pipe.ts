import { Pipe, PipeTransform } from '@angular/core';
import {StateConstant} from "../constants/state-constant";
import {DropdownConstant} from "../constants/dropdown-constant";

@Pipe({
  name: 'state'
})
export class StatePipe implements PipeTransform {

  readonly STATE_LIST = DropdownConstant.STATE_AND_FEDERAL_TERRITORY_DROPDOWN;

  transform(value: string): string {
    const stateObj = this.STATE_LIST.find(state => state.value === value);
    return stateObj ? stateObj.text : '-';
  }

}
