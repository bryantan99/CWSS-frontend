export interface ResponseModel<T> {
  message: string,
  status: number,
  data: T
}
