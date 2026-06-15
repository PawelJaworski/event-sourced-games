import {activeQuestsProjector, currentGameProjector, inventoryProjector} from './gnome-game.reducer';
import {gameStartState, InventoryItem, Locations, Quest} from './gnome-game.state';
import {EventType} from './events/events';

describe('Quest System', () => {
  describe('activeQuestsProjector', () => {
    it('given game just started, then player has FIND_OUT_WHY_MINE_IS_FLOODED quest', () => {
      const result = activeQuestsProjector(gameStartState.activeQuests, []);

      expect(result).toEqual([Quest.FIND_OUT_WHY_MINE_IS_FLOODED]);
    });

    it('given QUEST_ADDED event fires for GET_FISH_FOR_BEAVER, then GET_FISH_FOR_BEAVER is added to active quests', () => {
      const events = [
        {eventType: EventType.QUEST_ADDED, quest: Quest.GET_FISH_FOR_BEAVER}
      ];

      const result = activeQuestsProjector([Quest.FIND_OUT_WHY_MINE_IS_FLOODED], events);

      expect(result).toEqual([Quest.FIND_OUT_WHY_MINE_IS_FLOODED, Quest.GET_FISH_FOR_BEAVER]);
    });

    it('given player has FIND_OUT_WHY_MINE_IS_FLOODED quest, when player enters Gold Mine, then FIND_OUT_WHY_MINE_IS_FLOODED is done and REMOVE_THE_WATER is active', () => {
      const events = [
        {eventType: EventType.WENT_TO_LOCATION, location: Locations.GOLD_MINE}
      ];

      const result = activeQuestsProjector([Quest.FIND_OUT_WHY_MINE_IS_FLOODED], events);

      expect(result).not.toContain(Quest.FIND_OUT_WHY_MINE_IS_FLOODED);
      expect(result).toContain(Quest.REMOVE_THE_WATER);
    });

    it('given player has FIND_OUT_WHY_MINE_IS_FLOODED and GET_FISH_FOR_BEAVER quests, when player enters Gold Mine, then only FIND_OUT_WHY_MINE_IS_FLOODED is replaced by REMOVE_THE_WATER', () => {
      const events = [
        {eventType: EventType.WENT_TO_LOCATION, location: Locations.GOLD_MINE}
      ];

      const result = activeQuestsProjector(
        [Quest.FIND_OUT_WHY_MINE_IS_FLOODED, Quest.GET_FISH_FOR_BEAVER],
        events
      );

      expect(result).not.toContain(Quest.FIND_OUT_WHY_MINE_IS_FLOODED);
      expect(result).toContain(Quest.REMOVE_THE_WATER);
      expect(result).toContain(Quest.GET_FISH_FOR_BEAVER);
    });

    it('given player does not have FIND_OUT_WHY_MINE_IS_FLOODED quest, when player enters Gold Mine, then REMOVE_THE_WATER is not added', () => {
      const events = [
        {eventType: EventType.WENT_TO_LOCATION, location: Locations.GOLD_MINE}
      ];

      const result = activeQuestsProjector([Quest.GET_FISH_FOR_BEAVER], events);

      expect(result).not.toContain(Quest.REMOVE_THE_WATER);
      expect(result).toContain(Quest.GET_FISH_FOR_BEAVER);
    });
  });

  describe('currentGameProjector', () => {
    it('given game just started, when QUEST_ADDED event fires for GET_FISH_FOR_BEAVER, then player has both initial and GET_FISH_FOR_BEAVER quests', () => {
      const events = [
        {eventType: EventType.QUEST_ADDED, quest: Quest.GET_FISH_FOR_BEAVER}
      ];

      const result = currentGameProjector(gameStartState, events);

      expect(result.activeQuests).toEqual([Quest.FIND_OUT_WHY_MINE_IS_FLOODED, Quest.GET_FISH_FOR_BEAVER]);
    });

    it('given player catches a fish, then GET_FISH_FOR_BEAVER quest is added', () => {
      const events = [
        {eventType: EventType.FISH_CATCHED}
      ];

      const result = currentGameProjector(gameStartState, events);

      expect(result.activeQuests).toContain(Quest.GET_FISH_FOR_BEAVER);
    });

    it('given game just started, when player enters Gold Mine, then FIND_OUT_WHY_MINE_IS_FLOODED is done, REMOVE_THE_WATER is active, and player is at Gold Mine', () => {
      const events = [
        {eventType: EventType.WENT_TO_LOCATION, location: Locations.GOLD_MINE}
      ];

      const result = currentGameProjector(gameStartState, events);

      expect(result.activeQuests).not.toContain(Quest.FIND_OUT_WHY_MINE_IS_FLOODED);
      expect(result.activeQuests).toContain(Quest.REMOVE_THE_WATER);
      expect(result.currentLocation).toBe(Locations.GOLD_MINE);
    });

    it('given new events arrive, then unrelated state like location and isMineFlooded is preserved', () => {
      const events = [
        {eventType: EventType.QUEST_ADDED, quest: Quest.GET_FISH_FOR_BEAVER}
      ];

      const result = currentGameProjector(gameStartState, events);

      expect(result.currentLocation).toBe(gameStartState.currentLocation);
      expect(result.isMineFlooded).toBe(gameStartState.isMineFlooded);
    });
  });

  describe('inventoryProjector', () => {
    it('given game just started, then inventory is empty', () => {
      const result = inventoryProjector([], []);

      expect(result).toEqual([]);
    });

    it('given player catches a fish, then fish is in inventory', () => {
      const events = [
        {eventType: EventType.FISH_CATCHED}
      ];

      const result = inventoryProjector([], events);

      expect(result).toContain(InventoryItem.FISH);
    });

    it('given player takes fruits of the forest, then fruits are in inventory', () => {
      const events = [
        {eventType: EventType.FRUITS_OF_THE_FOREST_TAKEN}
      ];

      const result = inventoryProjector([], events);

      expect(result).toContain(InventoryItem.FRUITS_OF_THE_FOREST);
    });

    it('given player exchanges fruits for golden coin, then fruit is removed and golden coin is added', () => {
      const events = [
        {eventType: EventType.FRUITS_OF_THE_FOREST_TAKEN},
        {eventType: EventType.INVENTORY_EXCHANGED, from: InventoryItem.FRUITS_OF_THE_FOREST, to: InventoryItem.GOLDEN_COIN}
      ];

      const result = inventoryProjector([], events);

      expect(result).toContain(InventoryItem.GOLDEN_COIN);
      expect(result).not.toContain(InventoryItem.FRUITS_OF_THE_FOREST);
    });

    it('given player exchanges golden coin for fishing net, then coin is removed and net is added', () => {
      const events = [
        {eventType: EventType.FRUITS_OF_THE_FOREST_TAKEN},
        {eventType: EventType.INVENTORY_EXCHANGED, from: InventoryItem.FRUITS_OF_THE_FOREST, to: InventoryItem.GOLDEN_COIN},
        {eventType: EventType.INVENTORY_EXCHANGED, from: InventoryItem.GOLDEN_COIN, to: InventoryItem.FISHING_NET}
      ];

      const result = inventoryProjector([], events);

      expect(result).toContain(InventoryItem.FISHING_NET);
    });
  });
});
