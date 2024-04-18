import React, { useState, useEffect, useRef } from "react";

/* The definition of the Player object */
const Player = {
  X: 1,
  O: 0,
  Draw: -99,
};

/* This function calculates the center coordinates of a cell based on its index. 
It takes an index as a parameter, calculates the row and column coordinates, 
 and returns the center coordinates [cx, cy] of the cell. */

const getCellCenter = (index, countCell, MAX_WIDTH, MAX_HEIGHT) => {
  const x = Math.floor(index / countCell);
  const y = index % countCell;
  const cx = (MAX_WIDTH / countCell) * (y + 0.5);
  const cy = (MAX_HEIGHT / countCell) * (x + 0.5);
  return [cx, cy];
};

/* Draw line SVG */
const Line = ({
  from,
  to,
  color,
  countCell,
  maxWidth = 300,
  maxHeight = 300,
}) => {
  const cellSize = Math.min(maxWidth, maxHeight) / countCell;
  const strokeWidth = cellSize * 0.1;
  const [fromX, fromY] = from;
  const [toX, toY] = to;

  return (
    <line
      x1={fromX}
      y1={fromY}
      x2={toX}
      y2={toY}
      className={`${color || "text-gray-500"} stroke-current`}
      strokeWidth={strokeWidth}
    />
  );
};

/* Draw circle */
const Circle = ({ midpoint, countCell, maxWidth = 300, maxHeight = 300 }) => {
  const [x, y] = midpoint;
  const cellSize = Math.min(maxWidth, maxHeight) / countCell;
  const radius = cellSize * 0.3;
  const strokeWidth = cellSize * 0.1;

  return (
    <circle
      className="text-green-400 stroke-current fill-transparent"
      fill="transparent"
      cx={x}
      cy={y}
      r={radius}
      strokeWidth={strokeWidth.toString()}
    />
  );
};

/* Draw Cross */
function Cross({ midpoint, countCell, maxWidth = 300, maxHeight = 300 }) {
  const [x, y] = midpoint;
  const cellSize = Math.min(maxWidth, maxHeight) / countCell;
  const length = cellSize * 0.6;
  const sin45 = Math.sin(45);
  const offset = (length / 2) * sin45;

  return (
    <g>
      <Line
        color="text-blue-400"
        from={[x - offset, y - offset]}
        to={[x + offset, y + offset]}
        countCell={countCell}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
      />
      <Line
        color="text-blue-400"
        from={[x - offset, y + offset]}
        to={[x + offset, y - offset]}
        countCell={countCell}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
      />
    </g>
  );
}

export default function TicTacToe({ countCell }) {
  const MAX_WIDTH = 300;
  const MAX_HEIGHT = 300;
  /* These lines define and initialize state variables using the useState hook. */
  const [isXTurn, setIsXTurn] = useState(true); // isXTurn keeps track of whose turn it is (X or O) 
  const [winningInfo, setWinningInfo] = useState(null); // winningInfo stores information about the winning state 
  const [svgOffset, setSvgOffset] = useState([0, 0]); // svgOffset holds the offset of the SVG container 
  const [isDraw, setIsDraw] = useState(false);
  const svgRef =useRef(null); // svgRef is used to reference the SVG element.

  const [gameState, setGameState] = useState(Array(countCell * countCell).fill(Player.Draw)); // the state of the Tic-Tac-Toe board, with all cells initially set to the draw state. 

  useEffect(() => {
    if (svgRef.current) {
      const svgElement = svgRef.current;
      const { x, y } =
        svgElement.getBoundingClientRect(); //returns the position and size of an element relative to the viewport
      setSvgOffset([x, y]);
    }
  }, []);

  /*Function that resets the game state by setting the turn to X*/
  const resetBoard = () => {
    setIsXTurn(true);
    setWinningInfo(null);
    setGameState(Array(countCell * countCell).fill(Player.Draw));
    setIsDraw(false);
  };

  /* This function is to handle the event of clicking on the grid by the user */
  const handlePlayerAction = (event) => {
    if (winningInfo) {
      return;
    }

    const clickX = event.clientX - svgOffset[0];
    const clickY = event.clientY - svgOffset[1];

    const x = Math.floor((clickX / MAX_WIDTH) * countCell);
    const y = Math.floor((clickY / MAX_HEIGHT) * countCell);
    const cellIndex = y * countCell + x;

    if (gameState[cellIndex] === Player.Draw) {
      const newGameState = [...gameState];
      newGameState[cellIndex] = isXTurn ? Player.X : Player.O;
      setGameState(newGameState);
      setIsXTurn(!isXTurn);
    }
  };

  /* Draw the Grid */
  const renderBoard = () => {
    const cells = [];
    const cellSize = Math.min(MAX_WIDTH, MAX_HEIGHT) / countCell;
    const lineColor = "text-gray-500";

    for (let i = 0; i < countCell; i++) {
      for (let j = 0; j < countCell; j++) {
        const index = i * countCell + j;
        const [cx, cy] = getCellCenter(index, countCell, MAX_WIDTH, MAX_HEIGHT);
        const cellValue = gameState[index];

        cells.push(
          <g key={index} onClick={handlePlayerAction}>
            <rect
              x={j * cellSize}
              y={i * cellSize}
              width={cellSize}
              height={cellSize}
              fill="transparent"
            />
            {cellValue === Player.O && (
              <Circle
                midpoint={[cx, cy]}
                countCell={countCell}
                maxWidth={MAX_WIDTH}
                maxHeight={MAX_HEIGHT}
              />
            )}
            {cellValue === Player.X && (
              <Cross
                midpoint={[cx, cy]}
                countCell={countCell}
                maxWidth={MAX_WIDTH}
                maxHeight={MAX_HEIGHT}
              />
            )}
          </g>
        );
      }
    }
    // Draw horizontal lines
    for (let i = 1; i < countCell; i++) {
      const y = i * cellSize;
      const from = [0, y];
      const to = [MAX_WIDTH, y];
      cells.push(
        <Line
          key={`horizontal-line-${i}`}
          from={from}
          to={to}
          color={lineColor}
        />
      );
    }

    // Draw vertical lines
    for (let j = 1; j < countCell; j++) {
      const x = j * cellSize;
      const from = [x, 0];
      const to = [x, MAX_HEIGHT];
      cells.push(
        <Line
          key={`vertical-line-${j}`}
          from={from}
          to={to}
          color={lineColor}
        />
      );
    }

    return cells;
  };

  /* function to give wins coordinates possibilities */
  const generateWinPositions = () => {
    const winPositions = [];
    const diagonal1 = [];
    const diagonal2 = [];

    for (let i = 0; i < countCell; i++) {
      const row = [];
      const column = [];

      diagonal1.push(i * countCell + i);
      diagonal2.push((countCell - 1) * (i + 1));

      for (let j = 0; j < countCell; j++) {
        row.push(i * countCell + j);
        column.push(j * countCell + i);
      }

      winPositions.push(row, column);
    }

    winPositions.push(diagonal1, diagonal2);

    if (countCell > 3) {
      // Add horizontal combinations
      for (let i = 0; i < countCell; i++) {
        for (let j = 0; j <= countCell - 3; j++) {
          const position = [];

          for (let k = 0; k < 3; k++) {
            position.push(i * countCell + (j + k));
          }

          winPositions.push(position);
        }
      }

      // Add vertical combinations
      for (let i = 0; i <= countCell - 3; i++) {
        for (let j = 0; j < countCell; j++) {
          const position = [];

          for (let k = 0; k < 3; k++) {
            position.push((i + k) * countCell + j);
          }

          winPositions.push(position);
        }
      }

      // Add diagonal combinations
      for (let i = 0; i <= countCell - 3; i++) {
        for (let j = 0; j <= countCell - 3; j++) {
          const position1 = [];
          const position2 = [];

          for (let k = 0; k < 3; k++) {
            position1.push((i + k) * countCell + (j + k));
            position2.push((i + k) * countCell + (j + 2 - k));
          }

          winPositions.push(position1, position2);
        }
      }
    }
    return winPositions;
  };

  /* function to check the winner */
  const checkWinner = () => {
    const winPositions = generateWinPositions();

    for (const position of winPositions) {
      const [a, b, c] = position;
      const sum = gameState[a] + gameState[b] + gameState[c];
      if (sum === 3) {
        /* if sum equal to 3, it means player X wins */
        return Player.X;
      } else if (sum === 0) {
        /* if sum equal to 0, it means player O wins */
        return Player.O;
      } else {
        if (!(gameState.includes(null) || gameState.includes(-99) || (Player.X || Player.O)) ) { // checks if there is no winner already and all cells are full 
          setWinningInfo({ winner: Player.Draw });
          setIsDraw(true);
        }
      }
    }
    return null;
  };

  /* Draw the winning line */
  const drawWinningLine = () => {
    /* it ensures that no further changes are made to the game state or UI. */
    if (
      winningInfo &&
      winningInfo.line &&
      (winningInfo.line.from || winningInfo.line.to) &&
      winningInfo.winner !== null
    ) {
      return;
    }

    const winner = checkWinner();
    if (winner !== null) {
      const winPositions = generateWinPositions();

      for (const position of winPositions) {
        const [a, b, c] = position;
        const sum = gameState[a] + gameState[b] + gameState[c];

        if (sum === 3 || sum === 0) {
          const from = getCellCenter(a, countCell, MAX_WIDTH, MAX_HEIGHT);
          const to = getCellCenter(c, countCell, MAX_WIDTH, MAX_HEIGHT);

          setWinningInfo({
            winner: sum === 3 ? Player.X : Player.O,
            line: { from, to },
          });
          return;
        }
      }
    }
    setWinningInfo(null);
  };

  /* render the page whenever there is a gameState or winningInfo modification */
  useEffect(() => {
    drawWinningLine();
  }, [gameState, winningInfo, drawWinningLine]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-72 h-72 relative">
        <svg
          ref={svgRef}
          className="absolute top-0 left-0"
          width={MAX_WIDTH}
          height={MAX_HEIGHT}
          viewBox={`0 0 ${MAX_WIDTH} ${MAX_HEIGHT}`}
        >
          {renderBoard()}
          {winningInfo && winningInfo.line && (
            <Line
              from={winningInfo.line.from}
              to={winningInfo.line.to}
              color="text-red-500"
            />
          )}
        </svg>
        {/* returns the winner info */}
        {(winningInfo || isDraw) && (
          <div className="relative bottom-40">
            <div className="mt-8">
              {isDraw ? (
                <h2 className="text-3xl text-white font-bold">It's a draw!</h2>
              ) : (
                <h2 className="text-3xl text-white font-bold">
                  {winningInfo.winner === Player.X ? "X" : "O"} wins!
                </h2>
              )}
            </div>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={resetBoard}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
      {/* The user can reset the game even the game didn't end  */}
      {!winningInfo && (
        <div className="relative bottom-60">
          <button
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            onClick={resetBoard}
          >
            Reset Game
          </button>
        </div>
      )}
    </div>
  );
}
