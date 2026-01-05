import {Injectable} from '@angular/core';

export interface GameToken {
  x: number;
  y: number;
  size: number;
  imageUrl: string;
  borderColor?: string;
  borderWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameTokenService {
  private readonly tokens = new Map<string, GameToken>();
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
      imageUrl: '/assets/img/gnome-house.png',
      shadowColor: 'rgba(0, 0, 0, 0.6)',
      shadowBlur: 12,
      shadowOffsetX: 4,
      shadowOffsetY: 4
    };
  }

  initializeTokens(ctx: CanvasRenderingContext2D): void {
    const gnomeToken = this.createGnomeHouseToken(ctx, this.originalTokenSize);
    this.tokens.set('gnome-token', gnomeToken);
  }

  getClickedTokenId(x: number, y: number): string | null {
    for (const [id, token] of this.tokens) {
      const tokenCenterX = token.x + token.size / 2;
      const tokenCenterY = token.y + token.size / 2;
      
      const distance = Math.sqrt(
        Math.pow(x - tokenCenterX, 2) + Math.pow(y - tokenCenterY, 2)
      );
      
      if (distance <= token.size / 2) {
        return id;
      }
    }
    return null;
  }

  toggleTokenSize(tokenId: string): void {
    const token = this.tokens.get(tokenId);
    if (!token) return;

    const currentCenterX = token.x + token.size / 2;
    const currentCenterY = token.y + token.size / 2;

    if (token.size === this.originalTokenSize) {
      token.size = this.enlargedTokenSize;
    } else {
      token.size = this.originalTokenSize;
    }

    token.x = currentCenterX - token.size / 2;
    token.y = currentCenterY - token.size / 2;
  }

  drawAllTokens(ctx: CanvasRenderingContext2D): void {
    for (const token of this.tokens.values()) {
      this.drawRoundToken(ctx, token);
    }
  }
}
