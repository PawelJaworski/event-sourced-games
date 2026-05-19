import {CMD_TYPE, CommandHandler} from '../../event-sourcing/event-sourcing-template';
import {CommandType} from './commands';
import {GameAggregateState} from "../gnome-game.reducer";
import {QuestAddedEvent} from '../events/quest-added';
import {Quest} from '../gnome-game.state';

export class AskBeaverToRebuildDamCmd {
  [CMD_TYPE] = CommandType.ASK_BEAVER_TO_REBUILD_DAM;

  constructor() {}
}

export const askBeaverToRebuildDamHandler: CommandHandler<GameAggregateState, AskBeaverToRebuildDamCmd> =
  () => [new QuestAddedEvent(Quest.GET_FISH_FOR_BEAVER)]
