import {EVENT_TYPE} from '../../event-sourcing/event-sourcing-template';
import {EventType} from './events';
import {InventoryItem} from '../gnome-game.state';

export class InventoryExchangedEvent {
  [EVENT_TYPE] = EventType.INVENTORY_EXCHANGED;

  constructor(public readonly from: InventoryItem, public readonly to: InventoryItem) {}
}
