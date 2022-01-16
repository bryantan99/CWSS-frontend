export interface User {
  username: string,
  roleList: string[],
  expirationDate?: number,
  jwtToken?: string,
  refreshToken?: string,
  type?: string,
}
