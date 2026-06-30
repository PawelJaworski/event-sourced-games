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

export enum Quest {
  FIND_OUT_WHY_MINE_IS_FLOODED = 'FIND_OUT_WHY_MINE_IS_FLOOD',
  REMOVE_THE_WATER = 'REMOVE_THE_WATER',
  GET_FISH_FOR_BEAVER = 'GET_FISH_FOR_BEAVER',
  GET_FISHING_NET = 'GET_FISHING_NET'
}

export interface GnomeGameState {
  currentLocation: Locations;
  inventory: InventoryItem[];
  isFishingInProgress: boolean;
  isPickingForestFruitsInProgress: boolean;
  isMineFlooded: boolean;
  activeQuests: Quest[];
}

export const gameStartState: GnomeGameState = {
  currentLocation: Locations.GNOMES_HUT,
  inventory: [],
  isFishingInProgress: false,
  isPickingForestFruitsInProgress: false,
  isMineFlooded: true,
  activeQuests: [Quest.FIND_OUT_WHY_MINE_IS_FLOODED]
}


