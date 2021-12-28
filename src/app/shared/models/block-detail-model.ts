export interface BlockDetailModel {
  username: string,
  isBlocked: boolean,
  blockedBy?: string,
  blockedByFullName?: string,
  blockedDate?: Date,
  blockedMessage?: string
}
