import {RegionDef} from "../map/region/state/region.state";

export interface Scenario {
  turn: number,
  playersAttributes: {
    'PLAYER_1': PlayerAttributes,
    'PLAYER_2': PlayerAttributes
  },
  neighbours: Array<Set<string>>
}

export enum PlayerId {
  PLAYER_1 = 'PLAYER_1',
  PLAYER_2 = 'PLAYER_2',
  NONE = 'NONE'
}
export interface PlayerAttributes {
  color: string
}
