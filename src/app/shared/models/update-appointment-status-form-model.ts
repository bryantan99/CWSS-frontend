export interface UpdateAppointmentStatusFormModel {
  appointmentId: number,
  appointmentStatus: string,
  assistanceId?: number,
  assistanceStatus?: string,
  reason?: string,
  submittedBy?: string,
  submittedDate?: Date
}
