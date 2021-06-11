import { Component, OnInit } from '@angular/core';
import {AssistanceRecordModel} from "../../shared/models/assistance-record-model";

@Component({
  selector: 'app-admin-assistance',
  templateUrl: './admin-assistance.component.html'
})
export class AdminAssistanceComponent implements OnInit {

  listOfAssistanceRecord: AssistanceRecordModel[] = [];
  pageIndex: number = 1;
  pageSize: number = 10;

  constructor() { }

  ngOnInit(): void {
    this.getAssistanceRecords();
  }

  private getAssistanceRecords() {
    this.listOfAssistanceRecord = [
      {
        assistanceId: "ASST0000001",
        issueTitle: "Request donation for medical fees",
        applicantUsername: "test",
        applicantName: "Test",
        adminUsername: "admin",
        adminName: "Admin",
        status: "pending",
      },
      {
        assistanceId: "ASST0000002",
        issueTitle: "Request for a wheelchair",
        applicantUsername: "johndoe",
        applicantName: "John Doe",
        adminUsername: "admin",
        adminName: "Admin",
        status: "pending",
      },
      {
        assistanceId: "ASST0000003",
        issueTitle: "Request donation for medical fees",
        applicantUsername: "test",
        applicantName: "Test",
        adminUsername: "admin",
        adminName: "Admin",
        status: "pending",
      }
    ]
  }
}
