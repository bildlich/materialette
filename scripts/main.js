const CONTAINER_WIDTH = 460;
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
  "Primary": [
    ["ms-green", "#8EB927"],
    ["ms-red", "#E75D32"],
    ["ms-gold", "#F0AC00"],
    ["ms-midnight", "#343434"],
    ["ms-twilight", "#737373"],
    ["ms-noon", "#A3A3A3"],
    ["ms-dim", "#C4C2C2"],
    ["ms-daytime", "#E6E6E6"],
    ["ms-neutral", "#FAFAFA"]
  ],
  "Secondary": [
    ["ms-orange", "#FF8819"],
    ["ms-choco", "#774212"],
    ["ms-violet", "#834A84"],
    ["ms-petrol", "#479D95"],
    ["ms-pink", "#E43F9F"],
    ["ms-sky", "#8FCAE4"],
    ["ms-tree", "#72951F"],
    ["ms-disco", "#E4F50A"],
    ["ms-ice", "#00BCDE"]
  ],
  "Tertiary": [
    ["ms-blood", "#BC171B"],
    ["ms-water", "#0B8BD7"],
    ["ms-yellow", "#FFCC00"]
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
  })
  //Create the gutter cell from the 500 series
  row.insertBefore(createCell("test", "test2", true, name), row.childNodes[0]);
  container.appendChild(row);
}

function createCell(series, color, isGutter, name) {
  const cell = document.createElement('div');
  cell.className = 'cell';
  if (isGutter) {
    cell.innerHTML = `<span>${name}</span>`;
    cell.className += ' gutter';
  }
  else {
    cell.style.backgroundColor = color;
    cell.classList.add('color');
    cell.setAttribute('data-series', series);
    cell.style.color = luminance(color, '#fff', '#444');
  }
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
    hideTooltip();
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
  State.currentColorName = series;

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
      document.getElementById('color-copied').innerHTML = State.currentColorName + " / " + output;
      const curtain = document.getElementById('curtain');
      curtain.className = "";
      setTimeout(function() {
        curtain.className = "hidden";
      }, 1400);
    } catch (err) {
      console.log(err);
    }
  }
});

document.body.addEventListener('mouseleave', e => {
  hideTooltip();
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
function hideTooltip() {
  State.tooltipEle.className = "hidden";
}
function closeApp() {
  State.sharedObj.quit()
}
function hideApp() {
  State.sharedObj.hide();
}
function togglePinned() {
  State.sharedObj.pinned = State.pinnedEle.checked;
  // Give the container a class if checkbox is checked
  document.getElementById('pinned-container').classList.toggle('checked', State.pinnedEle.checked);
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
