export enum Locations {
  GNOMES_HUT = 'GNOMES-HUT',
  FISHERY_GROUND = 'FISHERY_GROUND'
}

export interface GnomeGameState {
  currentLocation: Locations;
}

export const gameStartState: GnomeGameState = {
  currentLocation: Locations.GNOMES_HUT
}


