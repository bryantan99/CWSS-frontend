import {AppointmentModel} from "./appointment-model";

export interface AssistanceModel {
  assistanceId: number,
  categoryId: number,
  categoryName: string,
  title: string,
  description: string,
  createdDate: Date,
  createdBy: string,
  lastUpdatedDate: Date,
  lastUpdatedBy : string,
  status: string,
  username: string,
  userFullName: string,
  adminUsername: string,
  adminFullName: string,
  appointmentModel: AppointmentModel
}
