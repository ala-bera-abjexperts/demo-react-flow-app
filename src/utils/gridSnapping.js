const GRID_SIZE = 20;

export function snapToGrid(position) {
  return {
    x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(position.y / GRID_SIZE) * GRID_SIZE,
  };
}

export function getGridSnapStyle(snapToGrid) {
  return {
    snapToGrid: snapToGrid,
    snapGrid: [GRID_SIZE, GRID_SIZE],
  };
}

export { GRID_SIZE };
