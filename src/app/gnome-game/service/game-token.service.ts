import {Injectable} from '@angular/core';
import {GnomeGameState, Locations} from '../gnome-game.state';

export interface GameToken {
  x: number;
  y: number;
  size: number;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameTokenService {
  private readonly locationTokens = new Map<Locations, GameToken>();
  private readonly originalTokenSize = 40;
  private readonly enlargedTokenSize = 80;

  constructor() {}

  drawRoundToken(ctx: CanvasRenderingContext2D, token: GameToken): void {
    // Draw shadow first (behind the token)
    this.drawShadow(ctx, token);

    const img = new Image();
    img.onload = () => {
      // Create circular clipping path
      ctx.save();
      ctx.beginPath();
      ctx.arc(token.x + token.size/2, token.y + token.size/2, token.size/2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Draw image within the circular clip
      ctx.drawImage(img, token.x, token.y, token.size, token.size);

      // Draw circular border
      ctx.restore();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(token.x + token.size/2, token.y + token.size/2, token.size/2, 0, Math.PI * 2);
      ctx.stroke();
    };
    img.src = token.imageUrl;
  }

  private drawShadow(ctx: CanvasRenderingContext2D, token: GameToken): void {
    ctx.save();

    // Create shadow for a thick token - very visible and dark
    const centerX = token.x + token.size/2 + (token.size / 16);
    const centerY = token.y + token.size/2 + (token.size / 16);
    const radiusX = token.size/2; // Same size as token
    const radiusY = token.size/2; // Flattened for thick object shadow

    // Draw main shadow
    ctx.strokeStyle = "#dddddd"
    ctx.lineWidth = 1;
    ctx.fillStyle = "#646464";
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke()

    ctx.restore();
  }

  createGnomeHouseToken(ctx: CanvasRenderingContext2D, size: number = 40): GameToken {
    const x = ctx!.canvas.width - size - 200;
    const y = ctx!.canvas.height - size - 40;
    return {
      x,
      y,
      size,
      imageUrl: '/assets/img/gnome-house.png'
    };
  }

  createFisheryGroundToken(ctx: CanvasRenderingContext2D, size: number = 40): GameToken {
    const x = 390;
    const y = 270;
    return {
      x,
      y,
      size,
      imageUrl: '/assets/img/fishery-grounds.png'
    };
  }

  createGoldMineToken(ctx: CanvasRenderingContext2D, size: number = 40): GameToken {
    const x = 500;
    const y = 170;
    return {
      x,
      y,
      size,
      imageUrl: '/assets/img/gold-mine.png'
    };
  }

  createFruitsOfTheForestToken(ctx: CanvasRenderingContext2D, size: number = 40): GameToken {
    const x = ctx!.canvas.width / 2 - size / 2;
    const y = ctx!.canvas.height - size - 20;
    return {
      x,
      y,
      size,
      imageUrl: '/assets/img/fruits-of-the-forest.png'
    };
  }

  initializeTokens(ctx: CanvasRenderingContext2D): void {
    const gnomeToken = this.createGnomeHouseToken(ctx, this.originalTokenSize);
    this.locationTokens.set(Locations.GNOMES_HUT, gnomeToken);

    const fisheryToken = this.createFisheryGroundToken(ctx, this.originalTokenSize);
    this.locationTokens.set(Locations.FISHERY_GROUND, fisheryToken);

    const goldMineToken = this.createGoldMineToken(ctx, this.originalTokenSize);
    this.locationTokens.set(Locations.GOLD_MINE, goldMineToken);

    const fruitsOfTheForestToken = this.createFruitsOfTheForestToken(ctx, this.originalTokenSize);
    this.locationTokens.set(Locations.FRUITS_OF_THE_FOREST, fruitsOfTheForestToken);
  }

  getClickedLocation(event: MouseEvent, canvas: HTMLCanvasElement): Locations {
    const { x, y } = this.getCanvasCoordinates(event, canvas);

    for (const [id, token] of this.locationTokens) {
      const tokenCenterX = token.x + token.size / 2;
      const tokenCenterY = token.y + token.size / 2;

      const distance = Math.sqrt(
        Math.pow(x - tokenCenterX, 2) + Math.pow(y - tokenCenterY, 2)
      );

      if (distance <= token.size / 2) {
        return id;
      }
    }
    return Locations.NONE;
  }

  private getCanvasCoordinates(event: MouseEvent, canvas: HTMLCanvasElement): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }
  private drawAllTokens(ctx: CanvasRenderingContext2D, tokenToRefresh?: GameToken): void {
    if (tokenToRefresh) {
      this.drawRoundToken(ctx, tokenToRefresh);
    } else {
      for (const token of this.locationTokens.values()) {
        this.drawRoundToken(ctx, token);
      }
    }
  }

  renderTokens(gameState: GnomeGameState, ctx: CanvasRenderingContext2D): void {
    const gnomeToken = this.locationTokens.get(Locations.GNOMES_HUT);
    const fisheryToken = this.locationTokens.get(Locations.FISHERY_GROUND);
    const goldMineToken = this.locationTokens.get(Locations.GOLD_MINE);
    const fruitsOfTheForestToken = this.locationTokens.get(Locations.FRUITS_OF_THE_FOREST);
    if (!gnomeToken || !fisheryToken || !goldMineToken || !fruitsOfTheForestToken) return;

    this.shrinkToken(gnomeToken);
    this.shrinkToken(fisheryToken);
    this.shrinkToken(goldMineToken);
    this.shrinkToken(fruitsOfTheForestToken);

    switch (gameState.currentLocation) {
      case Locations.GNOMES_HUT:
        this.enlargeToken(gnomeToken);
        break;
      case Locations.FISHERY_GROUND:
        this.enlargeToken(fisheryToken);
        break;
      case Locations.GOLD_MINE:
        this.enlargeToken(goldMineToken);
        break;
      case Locations.FRUITS_OF_THE_FOREST:
        this.enlargeToken(fruitsOfTheForestToken);
        break;
    }

    // Redraw all tokens
    this.drawAllTokens(ctx);
  }

  private enlargeToken(token: GameToken): void {
      const currentCenterX = token.x + token.size / 2;
      const currentCenterY = token.y + token.size / 2;

      token.size = this.enlargedTokenSize;
      token.x = currentCenterX - token.size / 2;
      token.y = currentCenterY - token.size / 2;
  }


  private shrinkToken(token: GameToken): void {
    const currentCenterX = token.x + token.size / 2;
    const currentCenterY = token.y + token.size / 2;

    token.size = this.originalTokenSize;
    token.x = currentCenterX - token.size / 2;
    token.y = currentCenterY - token.size / 2;
  }
}
