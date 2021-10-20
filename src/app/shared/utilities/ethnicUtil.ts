export class EthnicUtil {
  ethnicMap: Map<string, string> = new Map<string, string>();

  constructor() {
    this.ethnicMap.set('B', 'Bumiputera');
    this.ethnicMap.set('I', 'Indian');
    this.ethnicMap.set('C', 'Chinese');
    this.ethnicMap.set('O', 'Other');
  }

  getEthnicFullName(ethnicId: string) {
    return ethnicId && this.ethnicMap.has(ethnicId) ? this.ethnicMap.get(ethnicId) : '-';
  }
}
