export class GenderUtil {
  genderMap: Map<string, string> = new Map<string, string>();

  constructor() {
    this.genderMap.set('M', 'Male');
    this.genderMap.set('F', 'Female');
  }

  getGenderFullName(genderId: string) {
    return genderId && this.genderMap.has(genderId) ? this.genderMap.get(genderId) : '-';
  }
}
