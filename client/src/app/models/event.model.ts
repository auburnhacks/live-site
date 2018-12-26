export class HackEvent {
    eventName: string;
    startTime: Date;
    endTime: Date;
    location: string;
    description: string;
};

export interface EventResponse {
    checksum: string;
    events: HackEvent[];
}