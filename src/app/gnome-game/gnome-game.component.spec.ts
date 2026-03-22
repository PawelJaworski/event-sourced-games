import {ComponentFixture, TestBed} from '@angular/core/testing';
import {GnomeGameComponent} from "./gnome-game.component";
import {Store} from '@ngrx/store';
import {AppState} from '../state/app.state';
import {StoreModule} from '@ngrx/store';
import {reducers} from '../state/app.reducer';

describe('GnomeGameComponent', () => {
  let component: GnomeGameComponent;
  let fixture: ComponentFixture<GnomeGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GnomeGameComponent],
      imports: [
        StoreModule.forRoot(reducers)
      ],
      providers: [
        Store
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GnomeGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});