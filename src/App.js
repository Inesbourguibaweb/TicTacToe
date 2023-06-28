import React, { useState } from "react";
import TicTacToe from "./components/TicTacToe";

function App() {
  const [countCell, setCountCell] = useState(3); /* it keeps track of cells number */
  const [gameStarted, setGameStarted] = useState(false); /* it keeps track if the game started or not */

  const startGame = () => {
    setGameStarted(true);
  };

  return (
    <div className="bg-gray-800 min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-gray-100 text-4xl mb-8 font-bold">TicTacToe - (XO)</h1>
      {/* /* to ensure that the user choose the number of cells before starting */}
      {!gameStarted ? (
        <div className="flex flex-col items-center">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const inputValue = e.target.elements.countCell.value;
              setCountCell(parseInt(inputValue));
              startGame(); 
            }}
            className="flex flex-col items-center"
          >
            <label htmlFor="countCell" className="text-gray-100 mb-4">
              Choose the number of cells for the TicTacToe game
            </label>
            <input
              type="number"
              name="countCell"
              id="countCell"
              className="bg-gray-200 rounded px-2 py-1 mb-4"
              min={3}
              required
            />
            <button
              type="submit"
              className="text-lg font-bold text-white bg-blue-500 rounded px-4 py-2 hover:bg-blue-700"
            >
              Play TicTacToe
            </button>
            <p className="text-red-500 mt-2">
              *The number should be greater than 2
            </p>
          </form>
        </div>
      ) : (
        <TicTacToe countCell={countCell} />
      )}
    </div>
  );
}

export default App;
