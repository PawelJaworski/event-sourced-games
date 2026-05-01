import {EVENT_TYPE} from '../../event-sourcing/event-sourcing-template';
import {EventType} from './events';

export class GoldenCoinEarnedEvent {
  [EVENT_TYPE] = EventType.GOLDEN_COIN_EARNED;

  constructor(public readonly from: string, public readonly to: string) {}
}