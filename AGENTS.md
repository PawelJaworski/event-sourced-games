# AGENTS.md - Development Guidelines for front-angular

This document provides comprehensive guidelines for agentic coding assistants working on the front-angular project. Follow these conventions to maintain code quality and consistency.

## Build, Lint, and Test Commands

### Build Commands
- **Full build**: `npm run build` - Creates production build with optimizations
- **Development build**: `npm run build -- --configuration=development` - Development build with source maps
- **Watch mode**: `npm run watch` - Continuous development build with file watching

### Test Commands
- **Run all tests**: `npm test` - Runs all unit tests using Karma with Jasmine (headless Chrome)
- **Run single test file**: `npm test -- --include="**/map.service.spec.ts"` - Run specific test file
- **Run tests by pattern**: `npm test -- --grep="should create service"` - Run tests matching name pattern
- **Run tests in watch mode**: `npm test -- --watch` - Watch mode for continuous testing
- **Run tests with coverage**: `npm test -- --code-coverage` - Generate test coverage report

### Development Commands
- **Start development server**: `npm start` - Starts Angular dev server with hot reload
- **Lint code**: No dedicated lint command configured - rely on TypeScript strict mode and IDE tooling

## Code Style Guidelines

### TypeScript Configuration
- **Strict mode**: Enabled - all TypeScript strict checks are mandatory
- **Target**: ES2022 modules
- **Module resolution**: Node.js style
- **Decorators**: Experimental decorators enabled for Angular
- **Null checks**: Strict null checks enabled - use optional chaining (`?.`) and non-null assertion (`!`) appropriately

### Import Conventions
```typescript
// Group imports by Angular/core first, then third-party, then local
import {Component, OnInit, OnDestroy} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subject} from 'rxjs';

// Local imports with relative paths
import {MapService} from '../service/map.service';
import {AppState} from '../../state/app.state';

// Type-only imports when only types are needed
import type {MapRegion} from '../region/state/region.state';
```

### Naming Conventions
- **Classes**: PascalCase (e.g., `MapService`, `RegionModel`)
- **Interfaces**: PascalCase with 'I' suffix avoided (e.g., `AppState`, `AttributeChange`)
- **Enums**: PascalCase (e.g., `RegionAttributeType`)
- **Methods/Properties**: camelCase (e.g., `calculateBorder`, `getRegion`)
- **Constants**: UPPER_SNAKE_CASE for enum values, camelCase for readonly properties
- **Files**: kebab-case (e.g., `map.service.ts`, `region.model.ts`)
- **Test files**: Same name as source with `.spec.ts` suffix

### Component Structure
```typescript
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {
  // Public properties first
  regions: Array<MapRegion> = [];

  // ViewChild references
  @ViewChild('canvas', { static: true })
  canvas?: ElementRef<HTMLCanvasElement>;

  // Private properties
  private destroyed$ = new Subject();

  // Constructor with readonly dependency injection
  constructor(
    private readonly store: Store<AppState>,
    private readonly mapService: MapService
  ) {}

  ngOnInit(): void {
    // Initialization logic
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
```

### Service Structure
```typescript
@Injectable({
  providedIn: 'root'
})
export class MapService implements OnInit, OnDestroy {
  private destroyed$ = new Subject();
  private readonly scenario = scenario1;

  constructor(private readonly store: Store<AppState>) {}

  // Public methods
  loadMap(gameStarter: GameStarter): void {
    // Implementation
  }

  // Private methods
  private calculateBorder(regionDef: RegionDef): MapRegion {
    // Implementation
  }
}
```

### State Management (NgRx)
```typescript
// Actions
export const initRegions = createAction(
  '[Map] Init regions',
  props<{regions: Array<MapRegion>}>()
);

// Reducer
export const mapReducer = createReducer(
  mapInitialState,
  on(initRegions, (state, {regions}) => ({
    ...state,
    regions
  }))
);

// State interface
export interface MapState {
  regions: MapRegion[];
  neighbours: string[][];
  regionDetails?: MapRegion;
}
```

### Error Handling
- Use optional chaining (`?.`) for safe property access
- Use non-null assertion (`!`) when null checks are guaranteed by business logic
- Implement proper subscription cleanup with `destroyed$` pattern
- Handle async operations with appropriate error states in components

### Type Safety
- Prefer interfaces over classes for data transfer objects
- Use union types for related but distinct types
- Leverage enum types for constrained values
- Use generic types appropriately (e.g., `Array<T>`, `Map<K, V>`)

### Code Formatting
- **Indentation**: 2 spaces (configured in .editorconfig)
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Line length**: No strict limit, but prefer readable line breaks
- **Braces**: Same line for control structures

### Testing Patterns
```typescript
describe('MapService', () => {
  let service: MapService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot(reducers)
      ]
    });
    service = TestBed.inject(MapService);
  });

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapComponent ],
      imports: [
        StoreModule.forRoot(reducers)
      ]
    })
    .compileComponents();
  });
```

### File Organization
```
src/app/
├── component/          # UI components
├── service/           # Business logic services
├── model/            # Data models and interfaces
├── state/            # NgRx state management
│   ├── *.state.ts    # State interfaces
│   ├── *.reducer.ts  # State reducers
│   └── *.state.ts    # State selectors
├── plugin/           # Plugin extensions
└── [feature]/        # Feature modules
```

### Performance Considerations
- Use `OnPush` change detection for components when appropriate
- Implement proper unsubscribing from observables
- Use lazy loading for feature modules
- Optimize bundle size by tree-shaking unused imports
- Use `trackBy` function in `*ngFor` directives

### Security Best Practices
- Avoid storing sensitive data in local storage
- Use HTTPS for all external API calls
- Validate user inputs on both client and server side
- Avoid inline event handlers that could expose sensitive data
- Use Content Security Policy headers

### Commit Message Conventions
- Use imperative mood (e.g., "Add feature" not "Added feature")
- Start with component/area (e.g., "[Map] Add region selection")
- Keep messages concise but descriptive
- Reference issue numbers when applicable

## Development Workflow

1. **Before starting work**: Run `npm test` to ensure all tests pass
2. **During development**: Use `npm start` for live development
3. **Before committing**: Run `npm run build` to verify production build works
4. **Testing**: Write unit tests for new functionality, maintain test coverage
5. **Code review**: Ensure all TypeScript strict checks pass, follow established patterns

## Tooling Configuration

- **Change node version** `nvm use 22.12.0`
- **Package Manager**: Node from nvm
- **Testing Framework**: Karma with Jasmine (headless Chrome)
- **State Management**: NgRx Store
- **UI Library**: Angular Material (if used in components)
- **Build Tool**: Angular CLI with custom webpack configuration
- **Angular Version**: 21

## Known Issues After Angular 21 Upgrade

⚠️ **Build System**: Using Angular 20 with browser builder. Configuration updated for Angular 20 (buildTarget instead of browserTarget in serve and extract-i18n sections).

⚠️ **Test Configuration**: Using Angular's default Karma + Jasmine testing framework with headless Chrome. Components are explicitly marked as `standalone: false` to work with traditional NgModule-based testing.

⚠️ **Angular 21 Upgrade**: Attempted upgrade to Angular 21.0.6 resulted in module resolution errors (`@angular/core/primitives/di` not found). Angular 20.0.7 provides excellent stability and modern features.

✅ **Node.js Version**: Updated to v22.12.0 - fully compatible with Angular 20.

Remember: This codebase uses Angular's strict mode extensively. Always prefer type safety, immutability, and reactive patterns over imperative approaches.</content>
<parameter name="filePath">AGENTS.md
