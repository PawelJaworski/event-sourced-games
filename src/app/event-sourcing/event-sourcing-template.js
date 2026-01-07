import {Projector} from "./event-sourcing-template";

export const AGGREGATE_ID = "aggregateId";
export const CMD_TYPE = "commandType";
export const EVENT_TYPE = "eventType";

export class CommandGateway {
  eventStore = new EventStore();

  constructor(handlers) {
    this.handlers = handlers;
  }

  handle(cmd) {
    try {
      const events = this.eventStore.findAllEvents();
      const newEvents = this.handlers.get(cmd[CMD_TYPE])(events, cmd);
      this.eventStore.append(newEvents);
      return Result.success(newEvents);
    } catch (e) {
      console.error('Error when handling cmd', e);
      return Result.failure(`${JSON.stringify(cmd)} error: ${e}`)
    }
  }

  composeProjectors(projectors) {
    return (state, events) => projectors.reduce((state, projector) => projector(state, events), state)
  }
}

export class Result {
  constructor(success = null, error = null) {
    this.success = success;
    this.error = error;
  }

  static success(obj = "OK") {
    return new Result(obj, null);
  }

  static failure(error) {
    return new Result(null, error);
  }

  get value() {
    return this.success;
  }

  get isFailure() {
    return this.error;
  }
}

class EventStore {
  events = [];

  append(events) {
    this.events.push(...events);
  }

  findAllEvents() {
    return this.events;
  }
}


