/** 
 * Code from the blog post below
 * https://www.samproell.io/posts/signal/peak-finding-python-js/
 */

// https://stackoverflow.com/a/65410414/10694594
let decor = (v, i) => [v, i]; // combine index and value as pair
let undecor = pair => pair[1];  // remove value from pair
const argsort = arr => arr.map(decor).sort().map(undecor);

/**
 * Get indices of all local maxima in a sequence.
 * @param {number[]} xs - sequence of numbers
 * @returns {number[]} indices of local maxima
 */
function find_local_maxima(xs) {
  let maxima = [];
  // iterate through all points and compare direct neighbors
  for (let i = 1; i < xs.length-1; ++i) {
      if (xs[i] > xs[i-1] && xs[i] > xs[i+1])
          maxima.push(i);
  }
  return maxima;
}

/**
 * Remove peaks below minimum height.
 * @param {number[]} indices - indices of peaks in xs
 * @param {number[]} xs - original signal
 * @param {number} height - minimum peak height
 * @returns {number[]} filtered peak index list
 */
function filter_by_height(indices, xs, height) {
  return indices.filter(i => xs[i] > height);
}

/**
 * Remove peaks that are too close to higher ones.
 * @param {number[]} indices - indices of peaks in xs
 * @param {number[]} xs - original signal
 * @param {number} dist - minimum distance between peaks
 * @returns {number[]} filtered peak index list
 */
function filter_by_distance(indices, xs, dist) {
  let to_remove = Array(indices.length).fill(false);
  let heights = indices.map(i => xs[i]);
  let sorted_index_positions = argsort(heights).reverse();

  // adapted from SciPy find_peaks
  for (let current of sorted_index_positions) {
      if (to_remove[current]) {
          continue;  // peak will already be removed, move on.
      }

      let neighbor = current-1;  // check on left side of peak
      while (neighbor >= 0 && (indices[current]-indices[neighbor]) < dist) {
          to_remove[neighbor] = true;
          --neighbor;
      }

      neighbor = current+1;  // check on right side of peak
      while (neighbor < indices.length
             && (indices[neighbor]-indices[current]) < dist) {
          to_remove[neighbor] = true;
          ++neighbor;
      }
  }
  return indices.filter((v, i) => !to_remove[i]);
}

/**
 * Filter peaks by required properties.
 * @param {number[]}} indices - indices of peaks in xs
 * @param {number[]} xs - original signal
 * @param {number} distance - minimum distance between peaks
 * @param {number} height - minimum height of peaks
 * @returns {number[]} filtered peak indices
 */
function filter_maxima(indices, xs, distance, height) {
  let new_indices = indices;
  if (height != undefined) {
      new_indices = filter_by_height(indices, xs, height);
  }
  if (distance != undefined) {
      new_indices = filter_by_distance(new_indices, xs, distance);
  }
  return new_indices;
}

/**
* Simplified version of SciPy's find_peaks function.
* @param {number[]} xs - input signal
* @param {number} distance - minimum distance between peaks
* @param {number} height - minimum height of peaks
* @returns {number[]} peak indices
*/
export const minimal_find_peaks = (xs, distance, height) => {
  let indices = find_local_maxima(xs)
  return filter_maxima(indices, xs, distance, height);
}

