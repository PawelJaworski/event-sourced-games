import {CMD_TYPE, CommandHandler} from '../../event-sourcing/event-sourcing-template';
import {CommandType} from './commands';
import {GoldenCoinEarnedEvent} from '../events/golden-coin-earned';
import {InventoryItem} from '../gnome-game.state';
import {GameAggregateState} from "../gnome-game.reducer";

export class ExchangeCmd {
  [CMD_TYPE] = CommandType.EXCHANGE;

  constructor(public readonly from: InventoryItem, public readonly to: InventoryItem) {}
}

export const exchangeCmdHandler: CommandHandler<GameAggregateState, ExchangeCmd> =
  (_, cmd: ExchangeCmd) => {
    if (cmd.from === InventoryItem.FRUITS_OF_THE_FOREST && cmd.to === InventoryItem.GOLDEN_COIN) {
      return [new GoldenCoinEarnedEvent(cmd.from, cmd.to)];
    }
    return [];
  }
