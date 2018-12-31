import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HackEvent, EventResponse } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private checksum: string;

  constructor(private httpClient: HttpClient) { }

  public getEvents(): Observable<EventResponse> {
    const events = new Observable<EventResponse>((observer) => {
      let localState = JSON.parse(localStorage.getItem("checksum_events"));
      if (localState) {
        const er: EventResponse = { checksum: localState.checksum,
          events: localState.events};
        observer.next(er);
        this.httpClient.get(environment.apiBase + "/checksum",
          this.getHttpOptions())
          .subscribe((resp) => {
            // complete the observable object if the checksums match
            if (resp['checksum'] == er.checksum) {
              observer.complete();
              return;
            } else {
              console.log("state is stale!");
              // only fetch the events if the local cache is stale
              this.fetchEvents()
                .subscribe((events: EventResponse) => observer.next(events),
                (error: any) => observer.error(error),
                () => observer.complete());
            }
          });
      } else {
        // only fetch the events if the local cache is stale
        this.fetchEvents()
          .subscribe((events: EventResponse) => observer.next(events),
          (error: any) => observer.error(error),
          () => observer.complete());
      }
    });
    return events;
  }

  private fetchEvents(): Observable<EventResponse> {
    return this.httpClient.get<EventResponse>(environment.apiBase + "/events",
      this.getHttpOptions())
  }

  public saveChecksum = (checksum) => {
    this.checksum = checksum;
  };

  public saveState = (events: HackEvent[]) => {
    const eventState = {
      checksum: this.checksum,
      events: events,
    };
    localStorage.setItem('checksum_events', JSON.stringify(eventState));
  };

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
  }
}
