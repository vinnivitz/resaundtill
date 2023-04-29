import { dijkstra } from './dijkstra';
import { round, ratio, scaleHeight, scaleWidth } from './utils';

/**
 * @param {any[]} row
 * @param {number} containerWidth
 * @param {number} padding
 */
function getRowHeight(row, containerWidth, padding) {
  const rowWidth = containerWidth - (row.length - 1) * (padding);
  const rowAspectRatio = row.reduce((/** @type {any} */ acc, { ratio }) => acc + ratio, 0);
  return scaleHeight(rowWidth, rowAspectRatio);
}

/**
 * @param {string | any[]} images
 * @param {any} start
 * @param {any} end
 * @param {any} containerWidth
 * @param {number} targetHeight
 * @param {number} padding
 */
function cost(images, start, end, containerWidth, targetHeight, padding) {
  const row = images.slice(start, end);
  // @ts-ignore
  const rowHeight = getRowHeight(row, containerWidth, padding);
  return Math.pow(Math.abs(rowHeight - targetHeight), 2);
}

/**
 * @param {number} containerWidth
 * @param {number} targetRowHeight
 */
function calcSeekLimit(containerWidth, targetRowHeight) {
  if (containerWidth < 420) {
    // limit to two nodes if the container is narrow
    return 2;
  }

  // find how many 3/4 portrait pictures will fit in an ideal row
  const count = ratio(containerWidth, targetRowHeight) / 0.75;
  return Math.round(count * 1.5);
}

export default function({
  // @ts-ignore
  images,
  // @ts-ignore
  containerWidth,
  // @ts-ignore
  targetHeight,
  padding = 2,
  seekLimit = calcSeekLimit,
  byRow = false
} = {}) {

  // clone the images, and set ratio and initial scaled width / height
  const _images = images.map((/** @type {{ width: number; height: number; }} */ image, /** @type {any} */ index) => {
    return {
      ...image,
      index,
      ratio: ratio(image.width, image.height)
    }
  });

  const nodeSeekLimit = seekLimit(containerWidth, targetHeight);

  const graph = (/** @type {number} */ start) => {
    const results = {};
    start = +start;
    // @ts-ignore
    results[start] = 0;
    for (let i = start + 1; i < _images.length + 1; ++i) {
      if (i - start > nodeSeekLimit) {
        break;
      }
      // @ts-ignore
      results['' + i] = cost(_images, start, i, containerWidth, targetHeight, padding);
    }
    return results;
  }

  const path = dijkstra.find_path(graph, '0', _images.length);

  const rows = [];
  /**
   * @type {any[]}
   */
  const scaledImages = [];
  for (let i = 0; i < path.length; i++) {
    if (path[i + 1]) {
      const row = _images.slice(+path[i], +path[i + 1]);
      const isLastRow = (i === path.length-2);

      // scale row
      const rowHeight = getRowHeight(row, containerWidth, padding);
      row.forEach((/** @type {{ scaledWidth: number; ratio: number; scaledHeight: number; scaledWidthPc: number; isLastInRow: boolean; isLastRow: boolean; }} */ image, /** @type {number} */ index) => {
        image.scaledWidth = scaleWidth(rowHeight, image.ratio); //.toFixed(1);
        image.scaledHeight = rowHeight;
        image.scaledWidthPc = round((image.scaledWidth / containerWidth) * 100);

        if (index === row.length-1) {
          image.isLastInRow = true;
        }
        image.isLastRow = isLastRow;

        scaledImages.push(image);
      });
      rows.push(row);
    }
  }

  if (byRow) {
    return rows;
  } else {
    return scaledImages;
  }
}
