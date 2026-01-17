export declare const AGGREGATE_ID: string;
export declare const CMD_TYPE: string;
export declare const EVENT_TYPE: string;

export declare class CommandGateway {
  handlers: any[];
  eventStore: EventStore;

  constructor(handlers: Map<Function, CommandHandler<any>>, eventStore: EventStore);

  handle(cmd: any): Result<any[]>;
}

export type CommandHandler<T> = (events: any[], cmd: T) => any[];
export type Projector<T> = (state: T, events: any[]) => T;
export function composeProjectors<T>(projectors: Projector<T>[]): (state: T, events: any[]) => T;

export declare class Result<T> {
  success: T;
  error: any;

  constructor(success?: any, error?: any);

  static success<T>(obj?: any): Result<T>;
  static failure<T>(error: any): Result<T>;

  get value(): any;
  get isFailure(): any;
}

export declare class EventStore {
  events: any[];

  append(aggregateId: any, events: any[]): void;
  findAllEvents(): any[];
}
