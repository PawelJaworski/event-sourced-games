import {CMD_TYPE, CommandHandler} from '../../event-sourcing/event-sourcing-template';
import {CommandType} from './commands';

export class AskBeaverToRebuildDamCmd {
  [CMD_TYPE] = CommandType.ASK_BEAVER_TO_REBUILD_DAM;

  constructor() {}
}

export const askBeaverToRebuildDamHandler: CommandHandler<AskBeaverToRebuildDamCmd> =
  () => []