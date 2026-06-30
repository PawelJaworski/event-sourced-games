import {EVENT_TYPE} from '../../event-sourcing/event-sourcing-template';
import {EventType} from './events';

export class FishGivenToBeaverEvent {
  [EVENT_TYPE] = EventType.FISH_GIVEN_TO_BEAVER;
}
