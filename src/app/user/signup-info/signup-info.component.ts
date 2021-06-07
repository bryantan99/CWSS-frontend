import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-signup-info',
  templateUrl: './signup-info.component.html'
})
export class SignupInfoComponent implements OnInit {

  @Input('isVisible') isVisible: boolean

  constructor() { }

  ngOnInit(): void {
  }

}
