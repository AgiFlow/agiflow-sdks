// returns a function, using the parameter given to the sankey setting
export default function constant(x) {
  return function () {
    return x;
  };
}
// The main sankeyCircular functions
// Some constants for circular link calculations
export const verticalMargin = 25;
export const baseRadius = 10;
export const scale = 0.3; //Possibly let user control this, although anything over 0.5 starts to get too cramped
