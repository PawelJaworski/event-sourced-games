import {ComponentFixture, TestBed} from '@angular/core/testing';

import GnomeGameComponent from './gnome-game.component';

describe('GnomeGameComponent', () => {
  let component: GnomeGameComponent;
  let fixture: ComponentFixture<GnomeGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GnomeGameComponent ]
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
