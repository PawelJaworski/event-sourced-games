import {GameTokenService, GameToken} from './game-token.service';
import {Locations} from '../gnome-game.state';

describe('GameTokenService', () => {
  let service: GameTokenService;
  let mockCtx: jasmine.SpyObj<CanvasRenderingContext2D>;

  beforeEach(() => {
    service = new GameTokenService();
    mockCtx = jasmine.createSpyObj('CanvasRenderingContext2D', [
      'save', 'restore', 'beginPath', 'arc', 'closePath', 'clip', 'drawImage',
      'stroke', 'fill', 'fillText', 'ellipse'
    ], {
      canvas: { width: 800, height: 600 },
      strokeStyle: '',
      lineWidth: 0,
      fillStyle: '',
      font: '',
      textAlign: '',
      textBaseline: ''
    });
  });

  describe('renderTokens with questMarkedLocations', () => {
    it('should call drawRoundToken with isMarked=true for beaver dam when BEAVER_DAM is in questMarkedLocations', () => {
      spyOn(service, 'drawRoundToken' as any);
      service.initializeTokens(mockCtx);

      const questMarkedLocations = new Set<Locations>([Locations.BEAVER_DAM]);
      service.renderTokens(Locations.GNOMES_HUT, mockCtx, Locations.NONE, false, questMarkedLocations);

      const beaverDamToken = (service as any).locationTokens.get(Locations.BEAVER_DAM);
      expect(service.drawRoundToken).toHaveBeenCalledWith(mockCtx, beaverDamToken, false, true);
    });

    it('should call drawRoundToken with isMarked=true for fishery grounds when FISHERY_GROUND is in questMarkedLocations', () => {
      spyOn(service, 'drawRoundToken' as any);
      service.initializeTokens(mockCtx);

      const questMarkedLocations = new Set<Locations>([Locations.FISHERY_GROUND]);
      service.renderTokens(Locations.GNOMES_HUT, mockCtx, Locations.NONE, false, questMarkedLocations);

      const fisheryToken = (service as any).locationTokens.get(Locations.FISHERY_GROUND);
      expect(service.drawRoundToken).toHaveBeenCalledWith(mockCtx, fisheryToken, false, true);
    });

    it('should call drawRoundToken with isMarked=false when no questMarkedLocations match', () => {
      spyOn(service, 'drawRoundToken' as any);
      service.initializeTokens(mockCtx);

      service.renderTokens(Locations.GNOMES_HUT, mockCtx, Locations.NONE, false);

      const gnomeToken = (service as any).locationTokens.get(Locations.GNOMES_HUT);
      expect(service.drawRoundToken).toHaveBeenCalledWith(mockCtx, gnomeToken, false, false);
    });
  });
});
