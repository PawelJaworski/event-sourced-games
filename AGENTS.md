# AGENTS.md - Development Guidelines for event-sourced-games

This document provides comprehensive guidelines for agentic coding assistants working on the event-sourced-games project. Follow these conventions to maintain code quality and consistency.

## Build, Lint, and Test Commands

### Build Commands
- **Full build**: `npm run build` - Creates production build with optimizations
- **Development build**: `npm run build --configuration=development` - Development build with source maps
- **Watch mode**: `npm run watch` - Continuous development build with file watching

### Test Commands
- **Run all tests**: `npm test` - Runs all unit tests using Karma with Jasmine (headless Chrome)
- **Run specific test file**: Use `ng test --include="**/path/to/file.spec.ts"` - Run specific test file
- **Run tests by pattern**: `ng test --grep="test name pattern"` - Run tests matching name pattern
- **Default test settings**: Tests run in headless mode (no watch)

### Development Commands
- **Start development server**: `npm start` - Starts Angular dev server with hot reload
- **Lint code**: No dedicated lint command configured - rely on TypeScript strict mode and IDE tooling

## Code Style Guidelines

### TypeScript Configuration
- **Strict mode**: Enabled with all Angular strict template options
- **Target**: ES2022 with ES2020 modules
- **Module resolution**: bundler (Node.js style)
- **Decorators**: Experimental decorators enabled for Angular
- **Strict templates**: Enabled - all template type checking is enforced

### Import Conventions
```typescript
// Group imports by Angular/core first, then third-party, then local
import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subject} from 'rxjs';

// Local imports with relative paths
import {GameTokenService} from './service/game-token.service';
import {GameStartState} from '../state/app.state';

// Mixed imports for event sourcing
import {AGGREGATE_ID, CommandGateway} from '../event-sourcing/event-sourcing-template.js';
```

### Naming Conventions
- **Classes**: PascalCase (e.g., `GnomeGameComponent`, `GameTokenService`)
- **Interfaces**: PascalCase with 'I' suffix avoided (e.g., `AppState`, `GnomeGameState`)
- **Enums**: PascalCase (e.g., `CMD_TYPE`, `EVENT_TYPE`)
- **Methods/Properties**: camelCase (e.g., `loadMapImage`, `onCanvasClick`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `AGGREGATE_ID`, `Locations.GNOMES_HUT`)
- **Files**: kebab-case (e.g., `gnome-game.component.ts`, `game-token.service.ts`)
- **Test files**: Same name as source with `.spec.ts` suffix

### Component Structure
```typescript
@Component({
  selector: 'app-gnome-game',
  templateUrl: './gnome-game.component.html',
  styleUrls: ['./gnome-game.component.css'],
  standalone: false
})
export class GnomeGameComponent implements OnInit, AfterViewInit {
  // ViewChild references
  @ViewChild('canvas', { static: true })
  canvas?: ElementRef<HTMLCanvasElement>;

  // Private properties
  private readonly eventSourcingTemplate;
  private readonly stateProjector;
  private gameState = gameStartState;

  // Constructor with readonly dependency injection
  constructor(private readonly gameTokenService: GameTokenService) {}

  ngOnInit(): void {
    // Initialization logic
  }

  // Public methods
  onCanvasClick(event: MouseEvent): void {
    // Implementation
  }

  // Private methods
  private redrawCanvas(): void {
    // Implementation
  }
}
```

### Service Structure
```typescript
@Injectable({
  providedIn: 'root'
})
export class GameTokenService {
  constructor() {}

  // Public methods
  getClickedTokenId(x: number, y: number): string {
    // Implementation
  }

  // Private methods
  private initializeTokens(ctx: CanvasRenderingContext2D): void {
    // Implementation
  }
}
```

### Event Sourcing Patterns
```typescript
// Command handling
private readonly eventSourcingTemplate = new CommandGateway(
  new Map([
    ['select-token-cmd', (events: any[], cmd: any) => {
      return [{
        [AGGREGATE_ID]: cmd[AGGREGATE_ID],
        [EVENT_TYPE]: 'went-to-location',
        location: Locations.GNOMES_HUT
      }];
    }]
  ])
)

// Projectors
const locationProjector: Projector<GnomeGameState> = (state: GnomeGameState, events: any[]) => {
  return {
    ...state,
    currentLocation: events
      .filter(event => event[EVENT_TYPE] == 'went-to-location')
      .map(event => event.location)
      .reduce((f, s) => s)
  };
}
```

### Error Handling
- Use optional chaining (`?.`) for safe property access
- Check for null/undefined canvas context elements before usage
- Handle image loading with `onload` callbacks
- Use non-null assertion (`!`) when null checks are guaranteed

### Type Safety
- Use TypeScript strict mode with strict templates
- Leverage NgRx for state management type safety
- Use union types for event/command types
- Prefer interfaces for state definitions

### Code Formatting
- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Line length**: No strict limit, but prefer readability
- **Braces**: Same line for control structures

### Testing Patterns
```typescript
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
```

### File Organization
```
src/
├── app/
│   ├── gnome-game/           # Main game component
│   │   ├── service/          # Game-specific services
│   │   ├── gnome-game.state.ts # Game state definitions
│   │   └── *.component.*     # Component files
│   ├── event-sourcing/       # Event sourcing infrastructure
│   ├── rendering/            # Rendering utilities
│   ├── state/                # NgRx state management
│   └── app.*.ts              # Main app files
├── assets/                   # Static assets
│   └── img/                  # Game images
└── environments/             # Environment configurations
```

### Performance Considerations
- Load images once and reuse references
- Use Canvas for efficient game rendering
- Implement proper unsubscribing from observables
- Optimize bundle size for game assets

### Development Workflow

1. **Before starting work**: Run `npm test` to ensure all tests pass
2. **During development**: Use `npm start` for live development
3. **Before committing**: Run `npm run build` to verify production build works
4. **Testing**: Write unit tests for new functionality
5. **Code review**: Ensure all TypeScript strict checks pass

## Tooling Configuration

- **Angular Version**: 21.0.6
- **Node.js Version**: v22.12.0
- **Testing Framework**: Karma with Jasmine
- **State Management**: NgRx Store
- **Build Tool**: Angular CLI

## Project Structure Notes

This is an event-sourced game application featuring:
- Canvas-based game rendering with interactive token selection
- Event sourcing architecture using custom CommandGateway
- NgRx state management for application state
- Angular components with traditional NgModule structure (`standalone: false`)
- Game assets stored in `/assets/img/` directory

Remember: This codebase uses Angular's strict mode extensively with event sourcing patterns. Always prefer type safety and immutable state updates.</content>
<parameter name="filePath">AGENTS.md
