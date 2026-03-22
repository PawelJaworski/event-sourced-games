import {AfterViewInit, Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild} from '@angular/core';

interface HexTile {
  q: number;
  r: number;
  x: number;
  y: number;
  hasNet: boolean;
}

@Component({
  selector: 'app-fishery-game',
  templateUrl: './fishery-game.component.html',
  styleUrls: ['./fishery-game.component.css'],
  standalone: false
})
export class FisheryGameComponent implements OnInit, AfterViewInit {
  @Output()
  gameWon = new EventEmitter<void>();
  @ViewChild('gameCanvas', { static: true })
  canvas?: ElementRef<HTMLCanvasElement>;

  private hexTiles: HexTile[] = [];
  private fishPosition = { q: 0, r: 0 };
  private hexSize = 50;
  private centerX = 0;
  private centerY = 0;
  private isGameWon = false;
  private netsPlaced = 0;

  ngOnInit(): void {
    this.initializeGame();
  }

  ngAfterViewInit(): void {
    this.calculateCanvasSize();
    this.initializeGame();
    this.drawGame();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.calculateCanvasSize();
    this.initializeGame();
    this.drawGame();
  }

  private calculateCanvasSize(): void {
    if (!this.canvas) return;

    const container = this.canvas.nativeElement.parentElement;
    if (!container) return;

    const containerWidth = container.clientWidth - 40;
    const maxCanvasSize = Math.min(containerWidth, window.innerHeight * 0.6, 500);

    this.canvas.nativeElement.width = maxCanvasSize;
    this.canvas.nativeElement.height = maxCanvasSize + 60;
    this.centerX = this.canvas.nativeElement.width / 2;
    this.centerY = (this.canvas.nativeElement.height - 40) / 2;
    this.hexSize = Math.min(40, (maxCanvasSize / 2 - 20) / 4);
  }

  private initializeGame(): void {
    this.hexTiles = [];
    this.fishPosition = { q: 0, r: 0 };
    this.isGameWon = false;
    this.netsPlaced = 0;

    const mapRadius = 3;
    for (let q = -mapRadius; q <= mapRadius; q++) {
      const r1 = Math.max(-mapRadius, -q - mapRadius);
      const r2 = Math.min(mapRadius, -q + mapRadius);
      for (let r = r1; r <= r2; r++) {
        const hex = this.qrToHex(q, r);
        this.hexTiles.push({
          q,
          r,
          x: hex.x,
          y: hex.y,
          hasNet: false
        });
      }
    }
  }

   private qrToHex(q: number, r: number): { x: number; y: number } {
     const x = this.hexSize * 3/2 * q;
     const y = this.hexSize * Math.sqrt(3) * (r + q/2);
     return { x: this.centerX + x, y: this.centerY + y };
   }

  private hexToPixel(q: number, r: number): { x: number; y: number } {
    return this.qrToHex(q, r);
  }

  onCanvasClick(event: MouseEvent): void {
    if (!this.canvas || this.isGameWon) return;

    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const scaleX = this.canvas.nativeElement.width / rect.width;
    const scaleY = this.canvas.nativeElement.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    this.handleHexClick(x, y);
  }

  onTouchStart(event: TouchEvent): void {
    if (!this.canvas || this.isGameWon) return;
    event.preventDefault();

    const touch = event.touches[0];
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const scaleX = this.canvas.nativeElement.width / rect.width;
    const scaleY = this.canvas.nativeElement.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    this.handleHexClick(x, y);
  }

  private handleHexClick(x: number, y: number): void {
    const clickedHex = this.hexTiles.find(tile => this.isPointInHex(x, y, tile));

    if (clickedHex && !clickedHex.hasNet) {
      clickedHex.hasNet = true;
      this.netsPlaced++;

      if (this.fishPosition.q === clickedHex.q && this.fishPosition.r === clickedHex.r) {
        return;
      }

      this.moveFish();

      if (this.isFishTrapped()) {
        this.isGameWon = true;
        this.gameWon.emit();
      }

      this.drawGame();
    }
  }

  private isPointInHex(x: number, y: number, tile: HexTile): boolean {
    const dx = x - tile.x;
    const dy = y - tile.y;
    const size = this.hexSize - 2;

    return Math.abs(dx) <= size && Math.abs(dy) <= size * Math.sqrt(3) / 2 &&
           Math.abs(dx * 0.5 + dy * Math.sqrt(3) / 2) <= size * Math.sqrt(3) / 2 &&
           Math.abs(-dx * 0.5 + dy * Math.sqrt(3) / 2) <= size * Math.sqrt(3) / 2;
  }

  private getAdjacentHexes(q: number, r: number): { q: number; r: number }[] {
    const directions = [
      { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
      { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
    ];
    return directions.map(d => ({ q: q + d.q, r: r + d.r }));
  }

  private moveFish(): void {
    const adjacent = this.getAdjacentHexes(this.fishPosition.q, this.fishPosition.r);
    const validMoves = adjacent.filter(hex => {
      const tile = this.hexTiles.find(t => t.q === hex.q && t.r === hex.r);
      return tile && !tile.hasNet;
    });

    if (validMoves.length > 0) {
      this.fishPosition = validMoves[Math.floor(Math.random() * validMoves.length)];
    }
  }

  private isFishTrapped(): boolean {
    const adjacent = this.getAdjacentHexes(this.fishPosition.q, this.fishPosition.r);
    const hasValidMoves = adjacent.some(hex => {
      const tile = this.hexTiles.find(t => t.q === hex.q && t.r === hex.r);
      return tile && !tile.hasNet;
    });
    return !hasValidMoves;
  }

  private drawGame(): void {
    if (!this.canvas) return;

    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

    this.hexTiles.forEach(tile => {
      this.drawHex(ctx, tile);
    });

    this.drawFish(ctx);

    this.drawStatus(ctx);
  }

   private drawHex(ctx: CanvasRenderingContext2D, tile: HexTile): void {
     const { x, y } = this.qrToHex(tile.q, tile.r);
     const size = this.hexSize - 3;

     ctx.beginPath();
     for (let i = 0; i < 6; i++) {
       const angle = 2 * Math.PI / 6 * i;
       const hx = x + size * Math.cos(angle);
       const hy = y + size * Math.sin(angle);
       if (i === 0) {
         ctx.moveTo(hx, hy);
       } else {
         ctx.lineTo(hx, hy);
       }
     }
     ctx.closePath();

     if (tile.hasNet) {
       ctx.fillStyle = '#795548';
       ctx.fill();
       ctx.strokeStyle = '#5D4037';
       ctx.lineWidth = 2;
       ctx.stroke();

       this.drawNetPattern(ctx, x, y, size);
     } else {
       ctx.fillStyle = '#81D4FA';
       ctx.fill();
       ctx.strokeStyle = '#0288D1';
       ctx.lineWidth = 2;
       ctx.stroke();
     }
   }

  private drawNetPattern(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    ctx.strokeStyle = '#4E342E';
    ctx.lineWidth = 1;

    const patternSpacing = size / 4;

    for (let i = -size; i <= size; i += patternSpacing) {
      ctx.beginPath();
      ctx.moveTo(x + i, y - size);
      ctx.lineTo(x + i, y + size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x - size, y + i);
      ctx.lineTo(x + size, y + i);
      ctx.stroke();
    }
  }

  private drawFish(ctx: CanvasRenderingContext2D): void {
    const { x, y } = this.hexToPixel(this.fishPosition.q, this.fishPosition.r);
    const fishSize = this.hexSize * 0.6;

    ctx.save();

    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.ellipse(x, y, fishSize, fishSize * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + fishSize, y);
    ctx.lineTo(x + fishSize * 1.4, y - fishSize * 0.3);
    ctx.lineTo(x + fishSize * 1.4, y + fishSize * 0.3);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x - fishSize * 0.3, y - fishSize * 0.2, fishSize * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(x - fishSize * 0.25, y - fishSize * 0.2, fishSize * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawStatus(ctx: CanvasRenderingContext2D): void {
    const canvasHeight = this.canvas!.nativeElement.height;
    const canvasWidth = this.canvas!.nativeElement.width;

    if (this.isGameWon) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      ctx.fillStyle = '#4CAF50';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('You Won!', canvasWidth / 2, canvasHeight / 2 - 20);

      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.fillText('The fish is trapped!', canvasWidth / 2, canvasHeight / 2 + 20);
      ctx.fillText('Tap to play again', canvasWidth / 2, canvasHeight / 2 + 50);
    } else {
      ctx.fillStyle = '#333';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Nets placed: ${this.netsPlaced}`, 10, canvasHeight - 15);
    }
  }

  resetGame(): void {
    this.initializeGame();
    this.calculateCanvasSize();
    this.drawGame();
  }
}
