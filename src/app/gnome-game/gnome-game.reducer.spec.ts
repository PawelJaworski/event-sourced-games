import {activeQuestsProjector, currentGameProjector} from './gnome-game.reducer';
import {gameStartState, Quest} from './gnome-game.state';
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
});
