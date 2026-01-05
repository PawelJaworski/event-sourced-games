export declare const AGGREGATE_ID: string;
export declare const CMD_TYPE: string;

export declare class CommandGateway {
  handlers: any[];
  projectors: any[];

  constructor(handlers: Map<String, CommandHandler>, projectors: Projector[]);

  handle(cmd: any): Result;
  updateState<T>(state: T): T;
}

export type CommandHandler = (events: any[], cmd: any) => any[];
export type Projector = <T>(state: T, events: any[]) => T;

export declare class Result {
  success: any;
  error: any;

  constructor(success?: any, error?: any);

  static success(obj?: any): Result;
  static failure(error: any): Result;

  get value(): any;
  get isFailure(): any;
}

declare class EventStore {
  events: any[];

  append(aggregateId: any, events: any[]): void;
  findAllEvents(): any[];
}
