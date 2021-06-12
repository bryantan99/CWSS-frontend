import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gender'
})
export class GenderPipe implements PipeTransform {

  transform(value: string): string {
    const isMale = "m".localeCompare(value.toLocaleLowerCase());
    return isMale === 0 ? "Male" : "Female";
  }

}
