import {activeQuestsProjector, currentGameProjector, inventoryProjector} from './gnome-game.reducer';
import {gameStartState, InventoryItem, Quest} from './gnome-game.state';
import {EventType} from './events/events';

describe('Quest System', () => {
  describe('activeQuestsProjector', () => {
    it('should start with initial quests', () => {
      const result = activeQuestsProjector(gameStartState.activeQuests, []);
      expect(result).toEqual([Quest.REMOVE_THE_WATER]);
    });

    it('should add GET_FISH_FOR_BEAVER quest when QUEST_ADDED event occurs', () => {
      const events = [
        {eventType: EventType.QUEST_ADDED, quest: Quest.GET_FISH_FOR_BEAVER}
      ];

      const result = activeQuestsProjector([Quest.REMOVE_THE_WATER], events);

      expect(result).toEqual([Quest.REMOVE_THE_WATER, Quest.GET_FISH_FOR_BEAVER]);
    });

    it('should preserve existing quests when new quest is added', () => {
      const events = [
        {eventType: EventType.QUEST_ADDED, quest: Quest.GET_FISH_FOR_BEAVER}
      ];

      const result = activeQuestsProjector(gameStartState.activeQuests, events);

      expect(result).toContain(Quest.REMOVE_THE_WATER);
      expect(result).toContain(Quest.GET_FISH_FOR_BEAVER);
    });
  });

  describe('currentGameProjector', () => {
    it('should project activeQuests from events', () => {
      const events = [
        {eventType: EventType.QUEST_ADDED, quest: Quest.GET_FISH_FOR_BEAVER}
      ];

      const result = currentGameProjector(gameStartState, events);

      expect(result.activeQuests).toEqual([Quest.REMOVE_THE_WATER, Quest.GET_FISH_FOR_BEAVER]);
    });

    it('should add GET_FISH_FOR_BEAVER quest when fish is catched', () => {
      const events = [
        {eventType: EventType.FISH_CATCHED}
      ];

      const result = currentGameProjector(gameStartState, events);

      expect(result.activeQuests).toContain(Quest.GET_FISH_FOR_BEAVER);
    });

    it('should preserve other state when projecting quests', () => {
      const events = [
        {eventType: EventType.QUEST_ADDED, quest: Quest.GET_FISH_FOR_BEAVER}
      ];

      const result = currentGameProjector(gameStartState, events);

      expect(result.currentLocation).toBe(gameStartState.currentLocation);
      expect(result.isMineFlooded).toBe(gameStartState.isMineFlooded);
    });
  });

  describe('inventoryProjector', () => {
    it('should start with empty inventory', () => {
      const result = inventoryProjector([], []);
      expect(result).toEqual([]);
    });

    it('should add fishing net when inventory is exchanged for net', () => {
      const events = [
        {eventType: EventType.FRUITS_OF_THE_FOREST_TAKEN},
        {eventType: EventType.INVENTORY_EXCHANGED, from: InventoryItem.FRUITS_OF_THE_FOREST, to: InventoryItem.GOLDEN_COIN},
        {eventType: EventType.INVENTORY_EXCHANGED, from: InventoryItem.GOLDEN_COIN, to: InventoryItem.FISHING_NET}
      ];

      const result = inventoryProjector([], events);

      expect(result).toContain(InventoryItem.FISHING_NET);
    });

    it('should remove spent item when inventory is exchanged', () => {
      const events = [
        {eventType: EventType.FRUITS_OF_THE_FOREST_TAKEN},
        {eventType: EventType.INVENTORY_EXCHANGED, from: InventoryItem.FRUITS_OF_THE_FOREST, to: InventoryItem.GOLDEN_COIN}
      ];

      const result = inventoryProjector([], events);

      expect(result).toContain(InventoryItem.GOLDEN_COIN);
      expect(result).not.toContain(InventoryItem.FRUITS_OF_THE_FOREST);
    });
  });
});
