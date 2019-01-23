import { Component, OnInit } from '@angular/core';
import { EventService } from '../services/event.service';
import { EventResponse } from '../models/event.model';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ScheduleComponent implements OnInit {
  public tableColumns: string[] = [ 'eventName', 'startTime', 'endTime', 'location' ];
  public dataSource = [];

  constructor(private eventService: EventService) { }

  ngOnInit() {
    this.eventService.getEvents()
      .subscribe((resp: EventResponse) => {
        // table data source
        this.dataSource = resp.events;
        this.eventService.saveChecksum(resp['checksum']);
      },
      (error: any) => console.log(error),
      () => { this.eventService.saveState(this.dataSource); });
  }
}
