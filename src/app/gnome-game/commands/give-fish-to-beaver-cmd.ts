import {CMD_TYPE, CommandHandler} from '../../event-sourcing/event-sourcing-template';
import {CommandType} from './commands';
import {GameAggregateState} from '../gnome-game.reducer';
import {FishGivenToBeaverEvent} from '../events/fish-given-to-beaver';

export class GiveFishToBeaverCmd {
  [CMD_TYPE] = CommandType.GIVE_FISH_TO_BEAVER;
}

export const giveFishToBeaverHandler: CommandHandler<GameAggregateState, GiveFishToBeaverCmd> =
  () => [new FishGivenToBeaverEvent()]
