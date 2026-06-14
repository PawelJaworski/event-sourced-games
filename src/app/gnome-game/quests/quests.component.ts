import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {AppState} from '../../state/app.state';
import {selectGameState} from '../gnome-game.reducer';
import {GnomeGameState, Quest} from '../gnome-game.state';

@Component({
  selector: 'app-quests',
  templateUrl: './quests.component.html',
  styleUrls: ['./quests.component.css'],
  standalone: false
})
export class QuestsComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();
  activeQuests: Quest[] = [];

  private readonly questLabels: Record<string, string> = {
    [Quest.FIND_OUT_WHY_MINE_IS_FLOODED]: 'Find out why the mine is flooded',
    [Quest.REMOVE_THE_WATER]: 'Remove the water from the mine',
    [Quest.GET_FISH_FOR_BEAVER]: 'Get fish for the beaver'
  };

  constructor(private readonly store: Store<AppState>) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.store.select(selectGameState).subscribe(state => {
        this.activeQuests = state.activeQuests;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getQuestLabel(quest: Quest): string {
    return this.questLabels[quest] ?? quest;
  }

  trackByQuest(index: number, quest: Quest): string {
    return quest;
  }
}
