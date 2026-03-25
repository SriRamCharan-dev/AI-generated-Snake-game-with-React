import { useState, useEffect, useCallback, useRef } from 'react';

type Point = { x: number; y: number };

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION: Point = { x: 0, y: -1 };
const BASE_SPEED = 100;

export function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  const directionRef = useRef(direction);
  const lastMoveDirectionRef = useRef(direction);

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      isOccupied = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }
    return newFood!;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    lastMoveDirectionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setGameOver(false);
    setFood(generateFood(INITIAL_SNAKE));
    setHasStarted(true);
    setIsPaused(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && hasStarted && !gameOver) {
        setIsPaused(prev => !prev);
        return;
      }

      if (!hasStarted || isPaused || gameOver) return;

      const currentDir = lastMoveDirectionRef.current;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir.y !== 1) directionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir.y !== -1) directionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir.x !== 1) directionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir.x !== -1) directionRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted, isPaused, gameOver]);

  useEffect(() => {
    if (!hasStarted || isPaused || gameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const currentDirection = directionRef.current;
        lastMoveDirectionRef.current = currentDirection;
        
        const newHead = {
          x: head.x + currentDirection.x,
          y: head.y + currentDirection.y,
        };

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          // We handle score and food generation in a separate effect or after state update,
          // but to avoid complex dependency issues, we can use refs for score/food or 
          // just setTimeout to schedule the state updates outside the render phase.
          setTimeout(() => {
            setScore(s => {
              const newScore = s + 10;
              setHighScore(h => Math.max(h, newScore));
              return newScore;
            });
            setFood(generateFood(newSnake));
          }, 0);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    // Speed increases slightly as score goes up
    const currentSpeed = Math.max(50, BASE_SPEED - Math.floor(score / 50) * 10);
    const intervalId = setInterval(moveSnake, currentSpeed);

    return () => clearInterval(intervalId);
  }, [hasStarted, isPaused, gameOver, food, score, generateFood]);

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <div className="flex justify-between w-full mb-4 px-2 font-mono">
        <div className="flex flex-col">
          <span className="text-magenta text-[10px] uppercase tracking-widest font-pixel">DATA_SCORE</span>
          <span className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(255,0,255,0.8)]">{score}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-cyan text-[10px] uppercase tracking-widest font-pixel">PEAK_VALUE</span>
          <span className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(0,255,255,0.8)]">{highScore}</span>
        </div>
      </div>

      <div 
        className="relative bg-black border-2 border-magenta rounded-none overflow-hidden shadow-[0_0_30px_rgba(255,0,255,0.2)]"
        style={{ 
          width: '100%', 
          aspectRatio: '1/1',
          maxWidth: '400px'
        }}
      >
        {/* Grid Background */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #ff00ff 1px, transparent 1px), linear-gradient(to bottom, #ff00ff 1px, transparent 1px)`,
            backgroundSize: `${100 / GRID_SIZE}% ${100 / GRID_SIZE}%`
          }}
        />

        {/* Game Entities */}
        {hasStarted && !gameOver && (
          <>
            {/* Food */}
            <div
              className="absolute bg-magenta rounded-none shadow-[0_0_15px_rgba(255,0,255,1)] animate-pulse"
              style={{
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
                left: `${(food.x * 100) / GRID_SIZE}%`,
                top: `${(food.y * 100) / GRID_SIZE}%`,
                transform: 'scale(0.8)'
              }}
            />

            {/* Snake */}
            {snake.map((segment, index) => {
              const isHead = index === 0;
              const ratio = index / snake.length;
              const opacity = isHead ? 1 : Math.max(0.2, 1 - ratio * 0.8);
              const scale = isHead ? 1 : Math.max(0.6, 0.9 - ratio * 0.4);
              const glowSize = isHead ? 20 : Math.max(5, 15 * (1 - ratio));
              
              return (
                <div
                  key={`${segment.x}-${segment.y}-${index}`}
                  className={`absolute rounded-none ${isHead ? 'bg-white z-10' : 'bg-cyan'} transition-all duration-100 ease-linear`}
                  style={{
                    width: `${100 / GRID_SIZE}%`,
                    height: `${100 / GRID_SIZE}%`,
                    left: `${(segment.x * 100) / GRID_SIZE}%`,
                    top: `${(segment.y * 100) / GRID_SIZE}%`,
                    transform: `scale(${scale})`,
                    opacity: opacity,
                    boxShadow: `0 0 ${glowSize}px rgba(0, 255, 255, ${isHead ? 1 : 0.8 * (1 - ratio)})`,
                  }}
                />
              );
            })}
          </>
        )}

        {/* CRT Overlay */}
        <div className="absolute inset-0 pointer-events-none z-30 crt-lines opacity-20" />

        {/* Overlays */}
        {(!hasStarted || gameOver || isPaused) && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-40">
            {!hasStarted ? (
              <>
                <h2 
                  className="text-5xl font-black text-white mb-8 drop-shadow-[0_0_15px_rgba(255,0,255,0.5)] tracking-widest uppercase font-display glitch-text"
                  data-text="INIT_SNAKE"
                >
                  INIT_SNAKE
                </h2>
                <button
                  onClick={resetGame}
                  className="px-8 py-3 bg-transparent border-2 border-magenta text-magenta font-pixel font-bold uppercase tracking-widest hover:bg-magenta hover:text-black transition-all shadow-[0_0_15px_rgba(255,0,255,0.4)]"
                >
                  [ START_LINK ]
                </button>
                <p className="text-cyan mt-8 text-[10px] font-pixel uppercase tracking-tighter">INPUT_METHOD: WASD_ARROWS</p>
              </>
            ) : gameOver ? (
              <>
                <h2 
                  className="text-5xl font-black text-magenta mb-4 drop-shadow-[0_0_20px_rgba(255,0,255,0.8)] tracking-widest uppercase font-display glitch-text"
                  data-text="CORE_FAILURE"
                >
                  CORE_FAILURE
                </h2>
                <p className="text-cyan font-display font-black mb-8 text-2xl uppercase tracking-widest">RESULT: {score}</p>
                <button
                  onClick={resetGame}
                  className="px-8 py-3 bg-magenta text-white font-pixel font-bold uppercase tracking-widest hover:bg-white hover:text-magenta transition-all shadow-[0_0_20px_rgba(255,0,255,0.6)]"
                >
                  [ REBOOT_SYSTEM ]
                </button>
              </>
            ) : isPaused ? (
              <>
                <h2 
                  className="text-4xl font-black text-cyan mb-8 drop-shadow-[0_0_15px_rgba(0,255,255,0.8)] tracking-widest uppercase font-display glitch-text"
                  data-text="HALT_STATE"
                >
                  HALT_STATE
                </h2>
                <button
                  onClick={() => setIsPaused(false)}
                  className="px-8 py-3 bg-transparent border-2 border-cyan text-cyan font-pixel font-bold uppercase tracking-widest hover:bg-cyan hover:text-black transition-all shadow-[0_0_15px_rgba(0,255,255,0.4)]"
                >
                  [ RESUME_EXEC ]
                </button>
              </>
            ) : null}
          </div>
        )}
      </div>
      
      <div className="mt-6 flex gap-4 text-xs text-gray-500 font-mono uppercase tracking-wider">
        <span>[WASD/Arrows] Move</span>
        <span>[Space] Pause</span>
      </div>
    </div>
  );
}
