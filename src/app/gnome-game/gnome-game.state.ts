export enum Locations {
  NONE = 'NONE',
  GNOMES_HUT = 'GNOMES-HUT',
  FISHERY_GROUND = 'FISHERY_GROUND',
  GOLD_MINE = 'GOLD_MINE',
  FRUITS_OF_THE_FOREST = 'FRUITS_OF_THE_FOREST'
}

export interface GnomeGameState {
  currentLocation: Locations;
}

export const gameStartState: GnomeGameState = {
  currentLocation: Locations.GNOMES_HUT
}


