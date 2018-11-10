const JSDOM = require('jsdom').JSDOM;
const dom = new JSDOM();
global.document = dom.window.document;
global.window = dom.window;

global.requestAnimationFrame = callback => setTimeout(callback, 0);
global.cancelAnimationFrame = callback => setTimeout(callback, 0);