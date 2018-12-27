import { Component, OnInit } from '@angular/core';
import { EventService } from '../services/event.service';
import { HackEvent, EventResponse } from '../models/event.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public events: HackEvent[];
  public tableHeaders: string[] = [ "Event Name", "Description", "Start Time",
                                  "End Time", "Location" ];

  constructor(private eventService: EventService) { }

  ngOnInit() {
    this.eventService.getEvents()
      .subscribe((resp: EventResponse) => {
        this.events = resp.events;
        this.eventService.saveChecksum(resp['checksum']);
      },
      (error: any) => console.log(error),
      () => { this.eventService.saveState(this.events) });
  }

}
