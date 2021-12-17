export interface AssistanceUpdateFormModel {
  assistanceId?: number,
  categoryId?: number,
  title?: string,
  description?: string,
  status?: string,
  personInCharge?: string,
  updatedBy?: string,
  updatedDate?: Date,
  appointmentStartDatetime?: Date
}
