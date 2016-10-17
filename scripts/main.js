const CONTAINER_WIDTH = 370;
const TOOLTIP_WIDTH = 140;
const TOOLTIP_HEIGHT = 40;
const State = {
  output: ['HEX', 'RGB'],
  index: 0,
  tooltipEle: document.getElementById('tooltip'),
  currentColor: null,
  pinnedEle: document.getElementById('pinned'),
  sharedObj: (require('electron').remote).getGlobal('sharedObj')
};
const colors = {
  "primary": [
    ["ms-green", "#8EB927"],
    ["100", "#FFCDD2"],
    ["200", "#EF9A9A"],
    ["300", "#E57373"],
    ["400", "#EF5350"],
    ["500", "#F44336"],
    ["600", "#E53935"],
    ["700", "#D32F2F"],
    ["800", "#C62828"]
  ],
  "secondary": [
    ["50", "#FCE4EC"],
    ["100", "#F8BBD0"],
    ["200", "#F48FB1"],
    ["300", "#F06292"],
    ["400", "#EC407A"],
    ["500", "#E91E63"],
    ["600", "#D81B60"],
    ["700", "#C2185B"],
    ["800", "#AD1457"]
  ],
  "tertiary": [
    ["50", "#F3E5F5"],
    ["100", "#E1BEE7"],
    ["200", "#CE93D8"],
    ["300", "#BA68C8"],
    ["400", "#AB47BC"],
    ["500", "#9C27B0"],
    ["600", "#8E24AA"],
    ["700", "#7B1FA2"],
    ["800", "#6A1B9A"]
  ]
};

// Populate color cells
const container = document.getElementById('container');
for (let name in colors) {
  const row = document.createElement('section');
  row.className = 'row';
  colors[name].forEach((val, idx) => {
    //Append the color cell
    const cell = createCell(val[0], val[1]);
    row.appendChild(cell);
    //Create the gutter cell from the 500 series
    if (val[0] === '500') {
      row.insertBefore(createCell(val[0], val[1], true, name), row.childNodes[0]);
    }
  })
  container.appendChild(row);
}

function createCell(series, color, isGutter, name) {
  const cell = document.createElement('div');
  cell.className = 'cell';
  if (isGutter) {
    cell.innerHTML = `<span>${name}</span>`;
    cell.className += ' gutter';
    cell.style.backgroundColor = '#000';
  }
  else {
    cell.style.backgroundColor = color;
    cell.classList.add('color');
  }
  cell.setAttribute('data-series', series);
  cell.style.color = luminance(color, '#fff', '#444');
  return cell;
}

// Track tooltip movement and display a color + info
document.body.addEventListener('mousemove', e => {
  const tooltip = State.tooltipEle;
  let node;
  if (e.target.className.indexOf('color') > -1) {
    node = e.target;
  } else if (e.target.parentNode.className.indexOf('color') > -1) {
    node = e.target.parentNode;
  } else {
    tooltip.className = "hidden";
    State.currentColor = null;
    return;
  }

  const rgb = node.style.backgroundColor;
  const series = node.getAttribute('data-series');
  const match = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/.exec(rgb);
  let hex = rgbToHex(match[1], match[2], match[3]);

  let output;
  switch (State.output[State.index]) {
    case 'RGB':
      value = rgb;
      break;
    case 'HEX':
      value = hex;
      break;
  }
  tooltip.style.backgroundColor = value;
  tooltip.innerHTML = `<span>${value}</span>${series}`;

  tooltip.style.color = luminance(hex, '#fff', '#000');
  State.currentColor = value;

  // Adjust bounds of tooltip to avoid edge bleeding
  let offsetX = e.clientX - TOOLTIP_WIDTH / 2;
  let offsetY = e.clientY - TOOLTIP_HEIGHT - 10;
  if (offsetX < 0) {
    offsetX = e.clientX + 30;
  } else if (offsetX > CONTAINER_WIDTH - TOOLTIP_WIDTH) {
    offsetX -= 65;
  }
  if (offsetY < 0) {
    offsetY = e.clientY + 25;
  }
  tooltip.style.top = offsetY + 'px';
  tooltip.style.left = offsetX + 'px';
  tooltip.className = "";
});

// Copy the user's selected color to the clipboard
document.body.addEventListener('click', e => {
  if (State.currentColor !== null) {
    const clipboard = document.getElementById('clipboard');
    let output;
    clipboard.innerHTML = output = State.currentColor;
    clipboard.select();
    try {
      var successful = document.execCommand('copy');
      document.getElementById('color-copied').innerHTML = output;
      const curtain = document.getElementById('curtain');
      curtain.className = "";
      setTimeout(function() {
        curtain.className = "hidden";
      }, 1000);
    } catch (err) {
      console.log(err);
    }
  }
});

/**
 * Toggle between HEX or RGB for the tooltip + copy
 */
function changeOutput() {
  State.index++;
  if (State.index === State.output.length) {
    State.index = 0;
  }
  document.getElementById('current-output').innerHTML = State.output[State.index];
}

function closeApp() {
  State.sharedObj.quit()
}
function hideApp() {
  State.sharedObj.hide();
}
function togglePinned() {
  State.sharedObj.pinned = State.pinnedEle.checked;
}

/** Utilities **/
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b)).toString(16).slice(1);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function luminance(sHexColor, sLight, sDark) {
  const oRGB = hexToRgb(sHexColor);
  const yiq = ((oRGB.r * 299) + (oRGB.g * 587) + (oRGB.b * 114)) / 1000;
  return (yiq >= 128) ? sDark : sLight;
}
