export const AGGREGATE_ID = "aggregateId";
export const CMD_TYPE = "commandType";
export const EVENT_TYPE = "eventType";

export class CommandGateway {
  constructor(handlers, eventStore) {
    this.handlers = handlers;
    this.eventStore = eventStore;
  }

  handle(state, cmd) {
    try {
      const newEvents = this.handlers.get(cmd.constructor)(state, cmd);
      this.eventStore.append(newEvents);
      return Result.success(newEvents);
    } catch (e) {
      console.error('Error when handling cmd', e);
      return Result.failure(`${JSON.stringify(cmd)} error: ${e}`)
    }
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

export class EventStore {
  events = [];

  append(events) {
    this.events.push(...events);
  }

  findAllEvents() {
    return this.events;
  }
}


