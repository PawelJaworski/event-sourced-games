export enum Locations {
  GNOMES_HUT = 'GNOMES-HUT'
}

export interface GnomeGameState {
  currentLocation: Locations;
}

export const gameStartState: GnomeGameState = {
  currentLocation: Locations.GNOMES_HUT
}


