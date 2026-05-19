import {EVENT_TYPE} from '../../event-sourcing/event-sourcing-template';
import {EventType} from './events';

export class QuestAddedEvent {
  [EVENT_TYPE] = EventType.QUEST_ADDED;

  constructor(public readonly quest: string) {}
}
