import { TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';

import { AppService } from './app.service';
import { reducers } from '../../state/app.reducer';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot(reducers)
      ]
    });
    service = TestBed.inject(AppService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
