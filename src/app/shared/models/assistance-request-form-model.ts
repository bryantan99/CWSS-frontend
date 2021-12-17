export interface AssistanceRequestFormModel {
  assistanceId?: number,
  categoryId?: number,
  assistanceTitle: string,
  assistanceDescription: string,
  createdBy?: string,
  createdDate?: Date,
  username: string,
  adminUsername: string,
  appointmentStartDatetime: Date
}
