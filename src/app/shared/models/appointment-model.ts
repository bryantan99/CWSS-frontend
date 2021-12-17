export interface AppointmentModel {
  appointmentId: number,
  purpose: string,
  startDatetime: Date,
  endDatetime: Date,
  status: string,
  username: string,
  userFullName: string,
  adminUsername: string,
  adminFullName: string,
  lastUpdatedDate: Date
}
