import React, { useState, useCallback, useRef, useEffect } from 'react';
import './App.css';
import produce from 'immer';
import 'bootstrap/dist/css/bootstrap.min.css';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';


//neighbours
const operations = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [-1, -1],
  [-1, 1],
  [1, -1]
];




function App() {

  //initial grid size
  let initial_layout = 35;

  //create the initial empty grid
  const [grid, setGrid] = useState(() => {
    const rows = [];
    for (let i = 0; i < initial_layout; i++) {
      rows.push(Array.from(Array(initial_layout), () => 0));
    }
    return rows;
  });

  //if is running
  const [running, setRunning] = useState(false);
  //speed between each iteration
  const [interval, setInterval] = React.useState<number>(750);
  //grid size
  const [layout, setLayout] = React.useState<number>(initial_layout);

  //width for each square
  const [width, setWidth] = useState(0);

  //if clear
  const [clear, setClear] = React.useState<boolean>(false);


  //ref if running
  const runningRef = useRef(running);
  runningRef.current = running;

  //ref for the interval
  const intervalRef = useRef(interval);
  intervalRef.current = interval;

  //ref ror the layout
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  //the container
  const elementRef = React.useRef<HTMLDivElement>();



  //set interval on change
  const changeInterval = (event: any, newValue: number | number[]) => {
    setInterval(newValue as number);
  };

  //change layout
  const changeLayout = (event: any, newValue: any) => {
    console.log(newValue.props.value);
    setLayout(newValue.props.value);
  };

  //clear grid
  const changeClear = () => {
    setClear(!clear);
  }



  //get square size on layout update
  useEffect(() => {
    if (elementRef && elementRef.current) {
      setWidth((elementRef.current.getBoundingClientRect().width - 30) / layout);
    }
  }, [layout]);

  //reset grid if layout changes or clears
  useEffect(() => {
    setGrid(() => {
      const rows = [];
      for (let i = 0; i < layout; i++) {
        rows.push(Array.from(Array(layout), () => 0));
      }
      return rows;
    });
    setRunning(false);
    console.log(grid);
  }, [layout, clear]);


  //returns a random grid
  const randomGrid = () => {
    setGrid(() => {
      const rows = [];
      for (let i = 0; i < layout; i++) {
        rows.push(Array.from(Array(layout), () => Math.floor(Math.random() * 10) < 9 ? 0 : 1));
      }
      return rows;
    });
    console.log(grid);
    setRunning(false);
  }



  //main funcion
  const runSimulation = useCallback(() => {
    //if is is not running
    if (!runningRef.current)
      return;
    //simulate
    setGrid(g => {
      console.log(layoutRef.current);
      return produce(g, gridCopy => {
        for (let i = 0; i < layoutRef.current; i++) {
          for (let k = 0; k < layoutRef.current; k++) {
            let neighbours = 0;
            operations.forEach(([x, y]) => {
              const newI = i + x;
              const newK = k + y;
              if (newI >= 0 && newI < layoutRef.current && newK >= 0 && newK < layoutRef.current) {
                neighbours += g[newI][newK];
              }
            })
            if (neighbours < 2 || neighbours > 3) {
              gridCopy[i][k] = 0;

            } else if (g[i][k] === 0 && neighbours === 3) {
              gridCopy[i][k] = 1;

            }
          }
        }
      })
    });

    setTimeout(runSimulation, intervalRef.current);
  }, [])





  return (
    <div className="container" ref={elementRef}>
      <h1>Game Of Life</h1>
      <div className="row">
        <div className="col-8 buttons">
          <div className="row">
            <div className="col-3">
              <Button
                variant="contained"
                color={running ? 'primary' : 'secondary'}
                onClick={() => {
                  setRunning(!running);
                  runningRef.current = true;
                  runSimulation();
                }}>
                {running ? 'stop' : 'start'}
              </Button>
            </div>
            <div className="col-3">
              <Button variant="contained" onClick={changeClear}>Clear</Button>
            </div>
            <div className="col-3">
              <Button variant="contained" disabled={running} onClick={randomGrid}>Random</Button>
            </div>
            <div className="col-3">
              <Select
                labelId="demo-simple-select-outlined-label"
                id="demo-simple-select-outlined"
                value={layout}
                onChange={changeLayout}
                label="Layout"
                disabled={running}
              >
                <MenuItem value={10}>10x10</MenuItem>
                <MenuItem value={20}>20x20</MenuItem>
                <MenuItem value={35}>35x35</MenuItem>
                <MenuItem value={50}>50X50</MenuItem>
                <MenuItem value={100}>100X100</MenuItem>
              </Select>
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="row">
            <div className="col-12">
              <Typography id="discrete-slider" gutterBottom>
                Speed
              </Typography>
              <Slider value={interval} min={100} track="inverted" max={1500} onChange={changeInterval} aria-labelledby="continuous-slider" />
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${layout}, ${width}px)`
        }} className="big-grid">
        {grid.map((rows, i) =>
          rows.map((col, k) =>
            <div key={`${i}-${k}`}
              onClick={() => {
                const newGrid = produce(grid, gridCopy => {
                  gridCopy[i][k] = grid[i][k] ? 0 : 1;
                });
                setGrid(newGrid);
              }}
              style={{
                width: width,
                height: width,
                background: grid[i][k] ? '#3f51b5' : undefined,
                borderWidth: 1,
                borderColor: '#e0e0e0',
                borderStyle: 'solid',
                margin: 0,
                padding: 0
              }}>
            </div>))}
      </div>
    </div>
  );
}

export default App;
