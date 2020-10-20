import React, {useState, useCallback, useRef} from 'react';
import produce from 'immer';

// Grid Dimensions 
const Rows = 25;
const Cols = 25;

// Game operations | neighbours of each center cell
const operations = [
  [-1, -1], // NW | north west
  [-1, 0], // W | west
  [-1, 1], // SW | south west

  [0, -1], // N | north
  // [0, 0] - C | center
  [0, 1], // S | south 
  
  [1, -1], // NE | north east
  [1, 0], // E | east
  [1, 1], // SE | south east

]

// Create Empty grd
const generateEmptyGrid = () => {
  const rows = [];
    for (let i = 0; i < Rows; i++){
      rows.push(Array.from(Array(Cols), () => 0))
    }
    return rows;
}

function App() {
  // Gride State - to build out the grid 
  const [grid, setGrid] = useState(() => {
    return generateEmptyGrid(); 
  })

  // Running State - to determin when the game of life is running or not running. 
  const [running, setRunning] = useState(false); 

  const runningRef = useRef(running); 
  runningRef.current = running; 

  // Simulation runner | does not get recreated every time the app renders due to the useCallback hook. This uses and empty array [] so that the function only gets created once. 
  const runSimulation = useCallback(() => {
      if (!runningRef.current) {return;}
      
      // Simulation 

      setGrid((gridValue) => {
        return produce(gridValue, gridCopy => {
          for(let r = 0; r < Rows; r++) {
            for (let c = 0; c < Cols; c++) {
              
              // Computing neighbours
              let neighbours = 0;
              operations.forEach(([x, y]) => {
                const newRow = r + x;
                const newCol = c + y;
                // Seting the peramiter 0 to Rows / Cols # to make sure we don't go out of bounds
                if (newRow >= 0 && newRow < Rows && newCol >= 0 && newCol < Cols) {
                  neighbours += gridValue[newRow][newCol]
                }
              })

              // Simulation Conditions 

              // 2. Any live cell with two or three live neighbours lives on to the next generation. --- no change for rule 2

              // 1. Any live cell with fewer than two live neighbours dies, as if by underpopulation.
              // 3. Any live cell with more than three live neighbours dies, as if by overpopulation.
              if (neighbours < 2 || neighbours > 3) {
                gridCopy[r][c] = 0; 
              } 
              // 4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
              else if (gridValue[r][c] === 0 && neighbours === 3) {
                gridCopy[r][c] = 1;
              }
            }
          }
        });
      });

      setTimeout(runSimulation, 100);
    }, [])

  return (
    <div>
      <button
        onClick={() => {
          setRunning(!running); 
          if (!running) {
            runningRef.current = true;
            runSimulation();
          } 
        }}
      >
        {running ? 'Stop' : 'Start'}
      </button>

      <button
        onClick={() => {
          setGrid(generateEmptyGrid()); 
        }}
      >
        Clear
      </button>

      <button
        onClick={() => {
          const rows = [];
          for (let i = 0; i < Rows; i++){
            rows.push(Array.from(Array(Cols), () => Math.random() > .7 ? 1 : 0));
          }
          setGrid(rows);
        }}
      >
        Random
      </button>
    
      <div className="App"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Cols}, 20px)`
        }}
      >
        {grid.map((rows, rowIndex) => 
          rows.map((col, colIndex) => 
          <div 
            key={`${rowIndex}-${colIndex}`}
            onClick={() => {
              // mutating state grid[rowIndex][colIndex] = 1
              const newGrid = produce(grid, gridCopy => {
                gridCopy[rowIndex][colIndex] = grid[rowIndex][colIndex] ? 0 : 1; 
              }); 
              setGrid(newGrid); 
            }}
            style={{
              width: 20, 
              height: 20,
              background: grid[rowIndex][colIndex] ? 'pink' : undefined,
              border: 'solid 1px black',
            }} 
          />)
        )}
      </div>
    </div>
  );
}

export default App;
