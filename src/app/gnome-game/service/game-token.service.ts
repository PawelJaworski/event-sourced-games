import {Injectable} from '@angular/core';
import {GnomeGameState, Locations} from '../gnome-game.state';

export interface GameToken {
  x: number;
  y: number;
  size: number;
  imageUrl: string;
  caption?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameTokenService {
  private readonly locationTokens = new Map<Locations, GameToken>();
  private readonly originalTokenSize = 40;
  private readonly enlargedTokenSize = 80;

  constructor() {}

  drawRoundToken(ctx: CanvasRenderingContext2D, token: GameToken, showCaption: boolean = false): void {
    this.drawShadow(ctx, token);

    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(token.x + token.size/2, token.y + token.size/2, token.size/2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(img, token.x, token.y, token.size, token.size);

      ctx.restore();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(token.x + token.size/2, token.y + token.size/2, token.size/2, 0, Math.PI * 2);
      ctx.stroke();

      if (showCaption) {
        this.drawCaption(ctx, token);
      }
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
      imageUrl: './assets/img/gnome-house.png'
    };
  }

  createFisheryGroundToken(ctx: CanvasRenderingContext2D, size: number = 40): GameToken {
    const x = 390;
    const y = 270;
    return {
      x,
      y,
      size,
      imageUrl: './assets/img/fishery-grounds.png',
      caption: 'Go fishing'
    };
  }

  createGoldMineToken(ctx: CanvasRenderingContext2D, size: number = 40): GameToken {
    const x = 500;
    const y = 170;
    return {
      x,
      y,
      size,
      imageUrl: './assets/img/gold-mine.png'
    };
  }

  createFruitsOfTheForestToken(ctx: CanvasRenderingContext2D, size: number = 40): GameToken {
    const x = 300;
    const y = 320;
    return {
      x,
      y,
      size,
      imageUrl: './assets/img/fruits-of-the-forest.png',
      caption: 'Begin gathering wild fruits from the forest.'
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

  hasCaption(location: Locations): boolean {
    const token = this.locationTokens.get(location);
    return !!token?.caption;
  }

  isClickOnCaption(event: MouseEvent, canvas: HTMLCanvasElement, location: Locations): boolean {
    const token = this.locationTokens.get(location);
    if (!token?.caption) return false;

    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    const { x, y } = this.getCanvasCoordinates(event, canvas);
    const centerX = token.x + token.size / 2;
    const textY = token.y - 10;

    ctx.font = 'bold 14px Arial';
    const textWidth = ctx.measureText(token.caption).width;
    const padding = 8;
    const boxX = centerX - textWidth / 2 - padding;
    const boxY = textY - 18;
    const boxWidth = textWidth + padding * 2;
    const boxHeight = 24;

    return x >= boxX && x <= boxX + boxWidth && y >= boxY && y <= boxY + boxHeight;
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

  renderTokens(currentLocation: Locations, ctx: CanvasRenderingContext2D, previewLocation: Locations = Locations.NONE): void {
    const gnomeToken = this.locationTokens.get(Locations.GNOMES_HUT);
    const fisheryToken = this.locationTokens.get(Locations.FISHERY_GROUND);
    const goldMineToken = this.locationTokens.get(Locations.GOLD_MINE);
    const fruitsOfTheForestToken = this.locationTokens.get(Locations.FRUITS_OF_THE_FOREST);
    if (!gnomeToken || !fisheryToken || !goldMineToken || !fruitsOfTheForestToken) return;

    this.shrinkToken(gnomeToken);
    this.shrinkToken(fisheryToken);
    this.shrinkToken(goldMineToken);
    this.shrinkToken(fruitsOfTheForestToken);

    const activeLocation = previewLocation !== Locations.NONE ? previewLocation : currentLocation;
    switch (activeLocation) {
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

    // Redraw all tokens, excluding tokens with captions if they're previewed
    const excludeFruits = previewLocation === Locations.FRUITS_OF_THE_FOREST;
    const excludeFishery = previewLocation === Locations.FISHERY_GROUND;
    for (const token of this.locationTokens.values()) {
      if ((excludeFruits && token === fruitsOfTheForestToken) ||
          (excludeFishery && token === fisheryToken)) continue;
      this.drawRoundToken(ctx, token, false);
    }

    if (previewLocation === Locations.FRUITS_OF_THE_FOREST) {
      this.drawRoundToken(ctx, fruitsOfTheForestToken, true);
    }

    if (previewLocation === Locations.FISHERY_GROUND) {
      this.drawRoundToken(ctx, fisheryToken, true);
    }
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

  drawCaption(ctx: CanvasRenderingContext2D, token: GameToken): void {
    if (!token.caption) return;

    const centerX = token.x + token.size / 2;
    const textY = token.y - 10;

    ctx.save();
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    const textWidth = ctx.measureText(token.caption).width;
    const padding = 8;
    const boxX = centerX - textWidth / 2 - padding;
    const boxY = textY - 18;
    const boxWidth = textWidth + padding * 2;
    const boxHeight = 24;
    const radius = 6;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.beginPath();
    ctx.moveTo(boxX + radius, boxY);
    ctx.lineTo(boxX + boxWidth - radius, boxY);
    ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + radius);
    ctx.lineTo(boxX + boxWidth, boxY + boxHeight - radius);
    ctx.quadraticCurveTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - radius, boxY + boxHeight);
    ctx.lineTo(boxX + radius, boxY + boxHeight);
    ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - radius);
    ctx.lineTo(boxX, boxY + radius);
    ctx.quadraticCurveTo(boxX, boxY, boxX + radius, boxY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(token.caption, centerX, textY);

    ctx.restore();
  }
}
