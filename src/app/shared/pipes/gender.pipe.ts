import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gender'
})
export class GenderPipe implements PipeTransform {

  transform(value: string): string {
    return "M".localeCompare(value) || "m".localeCompare(value) ? "Male" : "Female";
  }

}
