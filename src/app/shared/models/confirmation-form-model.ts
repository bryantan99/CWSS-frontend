export interface ConfirmationFormModel {
  appointmentId: number,
  appointmentLastUpdatedDate: Date,
  assistanceId?: number,
  confirmedBy?: string,
  confirmedDate?: Date
}
