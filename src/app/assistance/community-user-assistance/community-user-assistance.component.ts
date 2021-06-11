import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-community-user-assistance',
  templateUrl: './community-user-assistance.component.html'
})
export class CommunityUserAssistanceComponent implements OnInit {
  listOfAssistanceRecord: any[] = [];
  pageSize: number = 10;
  pageIndex: number = 1;

  constructor() { }

  ngOnInit(): void {
  }

}
