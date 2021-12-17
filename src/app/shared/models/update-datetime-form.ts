export interface UpdateDatetimeForm {
  appointmentId: number,
  appointmentLastUpdatedDate: Date,
  datetime: Date,
  updatedBy?: string,
  updatedDate?: Date,
  assistanceId?: number
}
