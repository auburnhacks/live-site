import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  breakpoint: number;
  constructor() { }
  
  ngOnInit() {
    this.breakpoint = (window.innerWidth <= 425) ? 1 : 4;
  }

  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 425) ? 1 : 4;
  }
}
