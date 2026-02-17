import {AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';

interface Card {
  id: number;
  fruitType: string;
  isFlipped: boolean;
  isMatched: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-memory-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  standalone: false
})
export class MemoryGameComponent implements OnInit, AfterViewInit {
  @ViewChild('gameCanvas', { static: true })
  canvas?: ElementRef<HTMLCanvasElement>;

  private cards: Card[] = [];
  private flippedCards: Card[] = [];
  matchedPairs = 0;
  moves = 0;
  private gameStarted = false;
  private canFlip = true;

  private readonly fruitTypes = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🍒', '🥝'];
  private cardWidth = 80;
  private cardHeight = 80;
  private cardSpacing = 10;
  private readonly gridCols = 4;
  private readonly gridRows = 4;

  @HostListener('window:resize')
  onResize(): void {
    this.calculateCanvasSize();
    this.initializeGame();
    this.drawGame();
  }

  ngOnInit(): void {
    this.initializeGame();
  }

  ngAfterViewInit(): void {
    this.calculateCanvasSize();
    this.initializeGame();
    this.drawGame();
  }

  private calculateCanvasSize(): void {
    if (!this.canvas) return;
    
    const container = this.canvas.nativeElement.parentElement;
    if (!container) return;
    
    const containerWidth = container.clientWidth - 40;
    const maxCanvasSize = Math.min(containerWidth, window.innerHeight * 0.5, 380);
    
    const minCardSize = 60;
    const maxCardSize = 80;
    const spacingRatio = 0.125;
    
    const totalSpacing = this.cardSpacing * 5;
    const availableForCards = maxCanvasSize - totalSpacing;
    const cardSize = Math.max(minCardSize, Math.min(maxCardSize, availableForCards / 4));
    
    this.cardWidth = cardSize;
    this.cardHeight = cardSize;
    this.cardSpacing = cardSize * spacingRatio;
    
    const canvasSize = (this.cardWidth * 4) + (this.cardSpacing * 5);
    this.canvas.nativeElement.width = canvasSize;
    this.canvas.nativeElement.height = canvasSize + 60;
  }

  private initializeGame(): void {
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.gameStarted = true;
    this.canFlip = true;

    const fruitPairs: string[] = [];
    this.fruitTypes.forEach(fruit => {
      fruitPairs.push(fruit, fruit);
    });

    const shuffledFruits = this.shuffleArray(fruitPairs);

    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        const index = row * this.gridCols + col;
        const card: Card = {
          id: index,
          fruitType: shuffledFruits[index],
          isFlipped: false,
          isMatched: false,
          x: col * (this.cardWidth + this.cardSpacing) + this.cardSpacing,
          y: row * (this.cardHeight + this.cardSpacing) + this.cardSpacing,
          width: this.cardWidth,
          height: this.cardHeight
        };
        this.cards.push(card);
      }
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  onCanvasClick(event: MouseEvent): void {
    if (!this.canvas || !this.canFlip) return;

    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const scaleX = this.canvas.nativeElement.width / rect.width;
    const scaleY = this.canvas.nativeElement.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    this.handleCardClick(x, y);
  }

  onTouchStart(event: TouchEvent): void {
    if (!this.canvas || !this.canFlip) return;
    event.preventDefault();

    const touch = event.touches[0];
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const scaleX = this.canvas.nativeElement.width / rect.width;
    const scaleY = this.canvas.nativeElement.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    this.handleCardClick(x, y);
  }

  private handleCardClick(x: number, y: number): void {
    const clickedCard = this.cards.find(card =>
      x >= card.x && x <= card.x + card.width &&
      y >= card.y && y <= card.y + card.height &&
      !card.isFlipped && !card.isMatched
    );

    if (clickedCard) {
      this.flipCard(clickedCard);
    }
  }

  private flipCard(card: Card): void {
    card.isFlipped = true;
    this.flippedCards.push(card);
    this.drawGame();

    if (this.flippedCards.length === 2) {
      this.canFlip = false;
      this.moves++;
      
      setTimeout(() => {
        this.checkForMatch();
      }, 1000);
    }
  }

  private checkForMatch(): void {
    const [card1, card2] = this.flippedCards;

    if (card1.fruitType === card2.fruitType) {
      card1.isMatched = true;
      card2.isMatched = true;
      this.matchedPairs++;
      
      if (this.matchedPairs === this.fruitTypes.length) {
        setTimeout(() => {
          this.showGameComplete();
        }, 500);
      }
    } else {
      card1.isFlipped = false;
      card2.isFlipped = false;
    }

    this.flippedCards = [];
    this.canFlip = true;
    this.drawGame();
  }

  private showGameComplete(): void {
    if (!this.canvas) return;

    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const canvasWidth = this.canvas.nativeElement.width;
    const canvasHeight = this.canvas.nativeElement.height;
    const titleSize = Math.max(18, Math.floor(canvasWidth * 0.08));
    const subtitleSize = Math.max(14, Math.floor(canvasWidth * 0.05));
    const hintSize = Math.max(12, Math.floor(canvasWidth * 0.04));

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = '#4CAF50';
    ctx.font = `bold ${titleSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('Congratulations!', canvasWidth / 2, canvasHeight * 0.35);

    ctx.fillStyle = 'white';
    ctx.font = `${subtitleSize}px Arial`;
    ctx.fillText(`Completed in ${this.moves} moves`, canvasWidth / 2, canvasHeight * 0.5);

    ctx.font = `${hintSize}px Arial`;
    ctx.fillText('Tap anywhere to play again', canvasWidth / 2, canvasHeight * 0.65);
  }

  private drawGame(): void {
    if (!this.canvas) return;

    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

    this.cards.forEach(card => {
      this.drawCard(ctx, card);
    });

    this.drawScore(ctx);
  }

  private drawCard(ctx: CanvasRenderingContext2D, card: Card): void {
    ctx.save();

    if (card.isMatched) {
      ctx.globalAlpha = 0.6;
    }

    ctx.fillStyle = card.isFlipped ? '#8BC34A' : '#795548';
    ctx.fillRect(card.x, card.y, card.width, card.height);
    
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 2;
    ctx.strokeRect(card.x, card.y, card.width, card.height);

    const emojiSize = Math.floor(card.width * 0.5);
    const questionSize = Math.floor(card.width * 0.25);

    if (card.isFlipped || card.isMatched) {
      ctx.font = `${emojiSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        card.fruitType,
        card.x + card.width / 2,
        card.y + card.height / 2
      );
    } else {
      ctx.fillStyle = '#5D4037';
      ctx.font = `${questionSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        '?',
        card.x + card.width / 2,
        card.y + card.height / 2
      );
    }

    ctx.restore();
  }

  private drawScore(ctx: CanvasRenderingContext2D): void {
    const canvasHeight = this.canvas!.nativeElement.height;
    const gridHeight = (this.cardHeight * 4) + (this.cardSpacing * 5);
    const scoreY = gridHeight + 30;
    const fontSize = Math.max(12, Math.floor(this.cardWidth * 0.2));

    ctx.fillStyle = '#333';
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'left';
    ctx.fillText(`Moves: ${this.moves}`, 10, scoreY);
    ctx.fillText(`Pairs: ${this.matchedPairs}/${this.fruitTypes.length}`, 10, scoreY + fontSize + 5);
  }

  resetGame(): void {
    this.initializeGame();
    this.drawGame();
  }
}