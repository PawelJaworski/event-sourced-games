import {AfterViewInit, Component, ElementRef, ViewChild, OnInit} from '@angular/core';

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
  private matchedPairs = 0;
  private moves = 0;
  private gameStarted = false;
  private canFlip = true;

  private readonly fruitTypes = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🍒', '🥝'];
  private readonly cardWidth = 80;
  private readonly cardHeight = 80;
  private readonly cardSpacing = 10;
  private readonly gridCols = 4;
  private readonly gridRows = 4;

  constructor() {}

  ngOnInit(): void {
    this.initializeGame();
  }

  ngAfterViewInit(): void {
    this.drawGame();
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
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

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

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.canvas!.nativeElement.width, this.canvas!.nativeElement.height);
    
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 Congratulations! 🎉', this.canvas!.nativeElement.width / 2, 100);
    
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Completed in ${this.moves} moves`, this.canvas!.nativeElement.width / 2, 140);
    
    ctx.font = '16px Arial';
    ctx.fillText('Click anywhere to play again', this.canvas!.nativeElement.width / 2, 180);
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

    if (card.isFlipped || card.isMatched) {
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        card.fruitType,
        card.x + card.width / 2,
        card.y + card.height / 2
      );
    } else {
      ctx.fillStyle = '#5D4037';
      ctx.font = '20px Arial';
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
    ctx.fillStyle = '#333';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Moves: ${this.moves}`, 10, 20);
    ctx.fillText(`Pairs: ${this.matchedPairs}/${this.fruitTypes.length}`, 10, 40);
  }

  resetGame(): void {
    this.initializeGame();
    this.drawGame();
  }
}