// MDN (Microsoft Developer Network) Polyfill for startsWith
if( !String.prototype.startsWith ){
  String.prototype.startsWith = function(searchString, position){
    position = position || 0;
    return this.substr(position, searchString.length) === searchString;
  };
}

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(search, this_len) {
    if (this_len === undefined || this_len > this.length) {
      this_len = this.length;
    }
    return this.substring(this_len - search.length, this_len) === search;
  };
}

// Polyfill 
if( !String.prototype.trimStart ){
  String.prototype.trimStart = function(){
    return this.replace( /^\s+/, '');
  };
}

// Polyfill 
if( !String.prototype.trimEnd ){
  String.prototype.trimEnd = function(){
    return this.replace( /\s+^/, '');
  };
}

if( !String.prototype.replaceCharAt ){
  String.prototype.replaceCharAt = function(index,chr) {
      if(index > this.length-1) return this;
      return this.substring(0,index) + chr + this.substring(index+1);
  }
}

// Now some short generally useful functions...


/**
 * returns first defined value.
 */
function firstValid( a, b ){
  if( isDefined( a ) )
    return a;
  return b;
}


// Not a polyfill, but useful
function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function constrain( low, value, high ){
  return Math.max( low, Math.min( value, high));
}

// >>>>>>>>>>>>>>>>>>>> Colour utilities...
function rgbOfColourTuple( v ){
  return "rgba(" + v[0] + "," + v[1] + "," + v[2] + "," + v[3] + ")";
}

function rgbOfJsonString(string){
  var tuple = colourTupleOfJsonString(string);
  return rgbOfColourTuple( tuple );
}

function colourTupleOfJsonString(string){
  return JSON.parse(string);
}

function colourTupleOfRgb( rgb ){
  var t = rgb.split( "(" )[1]||"0,0,0";
  t = t.split(")")[0];
  t = t.split(",");
  t = t.map( Number );
  return t;
}

// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
// rgbToHex and hexToRgb.
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function colourBlend( a,b,t){
  var x = {};
  a = hexToRgb( a );
  b = hexToRgb( b );
  t = firstValid( t, 0.5);
  x.r = Math.floor( a.r + t*(b.r-a.r) );
  x.g = Math.floor( a.g + t*(b.g-a.g) );
  x.b = Math.floor( a.b + t*(b.b-a.b) );
  x = rgbToHex( x.r, x.g, x.b );
  return x;
}

/**
 * Choose a text colour with sufficient contrast to a colour tuple.
 * @param c
 * @returns {string}
 */
function textColourToContrastWithColourTuple( c ){
  return ((c[0]+c[1]+c[2])>380) ? 'black':'white';
}

function textColourToContrastWithRgb( rgb ){
  var c = colourTupleOfRgb( rgb );
  return textColourToContrastWithColourTuple( c );
}
//----------- end of colour utilities.


// format num to fit in n spaces.  We divide by d since some numbers are
// scaled in various ways.  d is usually 1 though.
function fmt( num, n, d ){
  d = d ||1;
  return ("                          "+Math.floor( num/d)).slice( - n );
}

// Save space with larger numbers by using K, M, G and T 'multipliers'
function fmt2( num, d ){
  d = d ||1;
  var mul = " ";
  num = num/d;
  if( num > 100000 ){
    num = num/1000;
    mul = 'K';
  }
  if( num > 100000 ){
    num = num/1000;
    mul = 'M';
  }
  if( num > 100000 ){
    num = num/1000;
    mul = 'G';
  }
  if( num > 100000 ){
    num = num/1000;
    mul = 'T';
  }
  var n=6;

  return ("                          "+Math.floor( num)).slice( - n )+mul;
}

function rand(n){
  return Math.floor(Math.random() * n);
}

// float to byte
function fToB(f){
  return Math.floor(f*255) & 0xFF;
}

function isDefined(x){
  var undef;
  return x !== undef;
}

/**
 * Rough and ready date to minutes function...
 * Intended for plotting.
 * NOT accurate (all months have same duration, and no leap years)
 * @param date in the format 07-Nov-2020
 * @returns {number} a time in minutes
 */
function minutesFromDate(date ){
  var d = date.split("-");
  var months = "Jan.Feb.Mar.Apr.May.Jun.Jul.Aug.Sep.Oct.Nov.Dec.";
  var day = Number(d[0]);
  var month = months.indexOf( d[1]+".")/4;
  var year = Number(d[2]);
  var result = day + (356/12) * month + 356 * year;
  result = result * 24 * 60 * 60;
  return result;
}

function stringOfCoord( coord, mul ){
  mul = mul || 1;
  return "("+Math.floor(coord.x*mul)+","+Math.floor(coord.y*mul)+")";
}




// These (below) got smuggled into utils and need to move out....



// These are constants for drawing stages.
const kStageArrowShaft=1;
const kStageDragging=2;
const kStageOutlineEarly=3;
const kStageFillAndTextEarly=4;
const kStageOutline=5;
const kStageFillAndText=6;
const kStageArrowHead=9;
const kStageHots=10;


// Locs is deprecated. 
// It used to use set locations, when on server.

//---- Paths to various content, all relative to domain.
function Locs(){
  var prefix = window.location.protocol + "//" + window.location.hostname + "/";

  this.imagesPath = prefix + "images/";
  this.editPath = prefix + "edit.htm";
  this.diagramPath = prefix + "diagrams/";
  return this;
}

var Locs = new Locs();
var LocalPages = [];


function getXy( obj ){
  return { 
    "x"  : obj.x,
    "y"  : obj.y,
  }
}

function getBox( obj ){
  return { 
    "x"  : obj.pos.x,
    "y"  : obj.pos.y,
    "xw" : obj.rect.x,
    "yh" : obj.rect.y
  }
}

function makeLabelReplacerFn(obj){
  var object = obj;

  return function( i, str ){
    var j;
    for(j=0;j<object.titles.length;j++){
      var field = "%"+object.titles[j].toLowerCase();
      str = replaceAll( str, field, object.values[ i][j]);
    }
    return str;
  };
}


// fudge factors that later will become proper parameters...
var fudgeLineMargin = 5;// lines outside chart by 5 pixels.
var fudgeLineDrop = 13;  // drop lines/bars down to contact axis labels.
var fudgeBarDrop = 12.5;  // drop bars to fit exactly over lines.
var fudgeStarDrop = 6; // drop stars slightly.
var fudgeLabelDrop = 4; // line labels lower than lines
var fudgeLabelMargin = 2; // labels to left

function apportionHorizontalSpaceInT(T){
  var spaceAvailable = T.xw - 2 * T.margin;
  if( T.width ){
    // If width of each item is given, then space between is what's left over
    // Reduce by space for the drawn columns.
    spaceAvailable -= T.width * T.rows * T.drawnCols;
    T.spacer = spaceAvailable / (T.rows - 1);
  } else {
    // otherwise width of each item is determined by the spacing between.
    T.spacer = T.spacer || 4;
    // Reduce by the space used for the spacers.
    // n groups with n-1 spacers between the groups.
    spaceAvailable -= (T.rows - 1) * T.spacer;
    T.width = spaceAvailable / (T.rows * T.drawnCols);
  }
  T.xScaler = (T.width * T.drawnCols + T.spacer);
}

function apportionVerticalSpaceInT(A, T){
  // yScale when fully grown (also used for lines behind the graph)
  T.yScalerMax = T.yh / (T.maxY - T.minY);
  // yScale reduced, so that items grow.
  T.yScaler = (Math.min(20, A.Status.time) / 20) * T.yScalerMax;
  T.yh += T.margin - 10;
}

/**
 * The spacing is computed for barchart bars.
 *
 * @param A
 * @param T
 */
function apportionSpaceInT(A, T){

  T.rows = T.rows || T.values.length;

  if( T.obj.display )
    T.cols = T.cols || T.obj.display.length;
  T.cols = T.cols || T.values[0].length;
  T.drawnCols = (T.obj.display) ? T.obj.display.length - 1 : 1;

  T.margin = 30;

  apportionVerticalSpaceInT(A, T);
  apportionHorizontalSpaceInT(T);
}

function xyOfIndexSnakey(i, T){
  var row = Math.floor(i / T.n);
  var col = i - row * T.n;
  if( row % 2 ) col = T.n - col - 1;
  var x = T.x0 + col * T.xSpacing;
  var y = T.y0 + row * T.ySpacing;
  if( T.isPath ){
    T.theta = undefined;
    if( i === 0 )
      x -= T.xSpacing *0.75;
    else if( i % T.n === 0 ){
      T.theta = (3 * Math.PI / 2);
      y -= T.ySpacing / 2;
      T.thetaDirection = (row % 2) === 0;
    }
    // whether we extend or reduce depends on odd or even row.
    // but code disabled as we want a snake's head.
    //else if( i === T.maxv - 1 )
    //  x += (1-2*( row % 2 ))*T.xSpacing*0.75;

  }
  return { "x": x, "y": y, "row":row , "theta": (row%2===0)?0:Math.PI };
}

/**
 * Uses current item to (optionally) update the style number
 * @param item - typically an item on a snake
 * @param style - a number representing a style for an item
 * @param A
 * @returns {number} - possibly updated style
 */
function mayUpdateSpotStyle(item, style, A){
  if( isDefined(item.snakeStyle) ){
    style = item.snakeStyle;
    if( isDefined(A.BrightObjects) ){
      if( item.category !== A.BrightObjects ){
        style = 0;
      }
    }
  }
  return style;
}

/**
 * Uses current item to (optionally) update the shape number
 * @param item
 * @param shape
 * @returns {number} - possibly updated shape
 */
function mayUpdateSpotShape(item, shape){
  if( isDefined(item.snakeShape) ){
    shape = item.snakeShape;
  }
  return shape;
}

