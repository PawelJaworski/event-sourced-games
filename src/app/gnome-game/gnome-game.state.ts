export enum Locations {
  NONE = 'NONE',
  GNOMES_HUT = 'GNOMES-HUT',
  FISHERY_GROUND = 'FISHERY_GROUND',
  GOLD_MINE = 'GOLD_MINE',
  BEAVER_DAM = 'BEAVER_DAM',
  FRUITS_OF_THE_FOREST = 'FRUITS_OF_THE_FOREST',
  MARKETPLACE = 'MARKETPLACE'
}

export enum InventoryItem {
  GOLDEN_COIN = 'GOLDEN_COIN',
  FISH = 'FISH',
  FISHING_NET = 'FISHING_NET',
  FRUITS_OF_THE_FOREST = 'FRUITS_OF_THE_FOREST'
}

export interface GnomeGameState {
  currentLocation: Locations;
  inventory: InventoryItem[];
  isFishingInProgress: boolean;
  isPickingForestFruitsInProgress: boolean;
}

export const gameStartState: GnomeGameState = {
  currentLocation: Locations.GNOMES_HUT,
  inventory: [],
  isFishingInProgress: false,
  isPickingForestFruitsInProgress: false
}


