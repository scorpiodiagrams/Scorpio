

Registrar.js.scorpiodiagrams_js = function( Registrar ){


var metaData = 
{ 
  version: "2023-02",
  docString: "Scorpio's Core and Iterator functions",
};

// Imports
// var Vector2d = Registrar.classes.Vecotr2d

var Annotator = Registrar.classes.Annotator;


function Exports(){
  // Namespaced  formats classes and verbs
  // These are all for export.
//  Registrar.registerTextFormat( Jatex_Fmt );
//  Registrar.registerClass( Box );
  // Global Exports
  // These pollute the main namespace
  RR.animateForOneDiagram = animateForOneDiagram;
  RR.loadDiagram = loadDiagram;
  RR.handleNewData = handleNewData;  

  window.registerMethod = registerMethod;
  window.registerReadWrite = registerReadWrite;
  window.layoutMargined = layoutMargined;

  window.handleNewData = handleNewData;
  window.sanitiseHtml = sanitiseHtml;
  window.formatClassNames = formatClassNames;
  window.setCellLayout = setCellLayout;
  window.sizeLayoutAndDrawDiagram = sizeLayoutAndDrawDiagram;
  window.createDraggable = createDraggable;
  window.addObjectToDictionary =  addObjectToDictionary;
  window.newPos = newPos;
  window.onLockInMove = onLockInMove;
  window.getCtx = getCtx;
  window.drawDiagramAgain = drawDiagramAgain;

  window.mayRequestDisplayableImage = mayRequestDisplayableImage;
  window.getImageSource = getImageSource;
  // for map demo...
  window.drawContainer = drawContainer;
  window.createRuler = createRuler;
  window.drawRuler = drawRuler;

  //window.mayUpdateObjectStyle = mayUpdateObjectStyle;
  //window.applyObjectSettingsToContext = applyObjectSettingsToContext;
//  window.drawFocusSpot = drawFocusSpot;
//  window.drawInfoButton = drawInfoButton;
//  window.drawFocusDragger = drawFocusDragger;

  window.Nozone = Nozone;
  window.Message2 = Message2;
  window.Message = Message;
  window.obeyCode = obeyCode;

//  window.transformXy = transformXy;
//  window.drawLineLabelAndText = drawLineLabelAndText;
}


// ------------- some ruler functions.....
function drawRuler(A, obj, d){
  //console.log( "draw - "+obj.type);
  var stage = d.stage;

  if(!isDefined( obj.atEnd ) ){
    obj.atStart = 0;
    obj.atEnd = 300;
  }

  var {x,y,xw,yh} = getBox( obj );

  if( stage===kStageDragging){
    updateDraggers( A, obj, d );

    if( A.dragObj !== obj )
      return;
    // Calculate new offset
    var dd = newPos( A, obj );
    if( obj.dragFn )
      obj.dragFn( A, obj, dd );
    // And always accept it.
    onLockInMove(A,obj,dd);

    return;
  }
  if( stage===kStageHots ){
    var ctx2 = A.HotspotsCanvas.ctx;

    ctx2.save();
    var c = A.nextAutoColour("");
    A.addDown(A,["clickObject",obj.id]);

    ctx2.beginPath();
    ctx2.rect(x, y, xw, yh);
    ctx2.fillStyle = c;
    ctx2.fill();

    drawDraggers(A, obj, d );
    ctx2.restore();
    return;
  }
  if( stage!==kStageFillAndText)
    return;


  mayUpdateObjectStyle(A, obj);

  var ctx = A.BackingCanvas.ctx;


  ctx.save();
  ctx.beginPath();

  applyObjectSettingsToContext(ctx, obj);
  if( obj.cornerRadius )
    drawRoundRect(A,obj,obj);
  else
    ctx.rect(x, y, xw, yh);

  ctx.strokeStyle = "rgb(0,0,0)";
  ctx.strokeWidth = 0.5;
  var i;

  // The lazy way is to draw every single item in the ruler
  // That is just crazy, because the density would be too high.

  // So instead we draw 'bars' which might be every 5th item,
  // every 10, every 20, every 50, every 100...

  // How many to a bar?  Well, we work out a pixel density.
  // A minimum of 3 pixels between bars seems about right.

  obj.itemsPerPixel = (obj.atEnd - obj.atStart)/xw;
  var pixelsPerBar = 100/obj.itemsPerPixel;
  var spec = 0;

  // Each time round this loop is a 10x zoom out
  while( pixelsPerBar > 6){
    spec++;
    pixelsPerBar /= 2;
    if( pixelsPerBar <= 15 )
      break;
    spec++;
    pixelsPerBar /= 5;
  }

  // The number of pixels per bar in turn lets us compute
  // how many items for each bar.
  obj.pixelsPerBar= pixelsPerBar;
  obj.itemsPerBar = obj.itemsPerPixel * pixelsPerBar;

  if( (spec%2) === 1 ){
    rulerSpec = rulerSpec2;
    otherSpec = rulerSpec1;
  } else {
    rulerSpec = rulerSpec1;
    otherSpec = rulerSpec2;
  }

  // Actually draw the 'bars'.
  var nBars = Math.floor( xw / pixelsPerBar)+1;
  for(i=0;i<nBars;i++){
    drawRulerMark( ctx, obj, i );
  }

  drawDraggers(A, obj, d );

  ctx.restore();
}


function createRuler(A, obj, d){
  obj.onClick = onRulerClicked;//["clickAction",obj.name ];
  obj.dragFn = draggingRuler;
}

function setCentreDraggerX(ruler, x){
  if( !ruler )
    return;
  var mid = ruler.content[1];

  if( ruler.flip === 6 )
    mid.yCenter = x;
  else
    mid.offset.x = x-mid.pos.x;
}

function setCentreDraggerY(ruler, y){
  if( !ruler )
    return;
  var mid = ruler.content[1];
  if( ruler.flip === 6 )
    mid.offset.x = y-mid.pos.x;
  else
    mid.yCentre = y;
}

function zoom( A, ruler, delta ){
  if( !ruler )
    return;
  var itemsPerPixel = (ruler.atEnd-ruler.atStart)/ruler.rect.x;
  var k = 1.07;
  if( delta > 0 )
    itemsPerPixel *= k;
  else
    itemsPerPixel /= k;
  computeMidDraggerIx(A, ruler);
  setItemsPerPixel( A, ruler, itemsPerPixel );
}

function rulerIxOfx( A, obj, x ){
  return obj.atStart + (x-obj.pos.x) * obj.itemsPerPixel;
}

function xOfRulerIx( A, obj, ix ){
  return (ix - obj.atStart) / obj.itemsPerPixel + obj.pos.x;
}

/**
 * Converts mid dragger x position to an Ix and remembers it.
 * @param A
 * @param obj
 */
function computeMidDraggerIx(A, obj){
  var mid = obj.content[1];
  var midx = mid.offset.x + mid.pos.x;
  //midx=0;
  obj.centerIx = rulerIxOfx(A, obj, midx);
}

/**
 * Converts mid dragger Ix back to an x position, ready for drawing.
 * In conjunction with computeMidDraggerIx this allows the mid dragger
 * to be repositioned for ruler changes.
 * @param A
 * @param obj
 */
function replaceMidDragger(A, obj){
  var mid = obj.content[1];
  var left = obj.content[0];
  var right = obj.content[2];
  var inset = mid.inset;


  obj.itemsPerPixel = (obj.atEnd - obj.atStart) / obj.rect.x;
  var newpos = xOfRulerIx(A, obj, obj.centerIx);
  //var bak = rulerIxOfx( A, obj, newpos );
  //console.log( "Midx: "+midx + " Ix: "+obj.centerIx + " newx "+newpos+ " atIx
  // "+ bak ); reposition mid-dragger.
  mid.offset.x = constrain( inset, newpos - mid.pos.x, obj.rect.x - inset);

  mid.offset.x = constrain( left.offset.x+40, mid.offset.x, right.offset.x-40 );
  computeMidDraggerIx(A, obj );
}

/**
 * Ensures the mid dragger ends up between the left and right dragger.
 * @param A
 * @param obj
 */
function repositionMidDragger(A, obj){
  var mid = obj.content[1];
  var left = obj.content[0];
  var right = obj.content[2];
  var inset = mid.inset;

/*
    obj.itemsPerPixel = (obj.atEnd - obj.atStart) / obj.layout.xw;
    var newpos = xOfRulerIx(A, obj, obj.centerIx);
    //var bak = rulerIxOfx( A, obj, newpos );
    //console.log( "Midx: "+midx + " Ix: "+obj.centerIx + " newx "+newpos+ " atIx
    // "+ bak ); reposition mid-dragger.
    mid.offset.x = constrain( inset, newpos - mid.layout.x0, obj.layout.xw - inset);
*/
  mid.offset.x = constrain( left.offset.x+33, mid.offset.x, right.offset.x-33 );
  computeMidDraggerIx(A, obj );
}

function onRulerClicked(A, obj){
  var {x,y,xw,yh} = getBox( obj );

  if( !A.Status.click )
    return;

  console.log( "Clicked on Object " + obj.id );
  A.dragObj = obj;
  //obj.draggerIx = rulerIxOfx( A, obj, obj.content[1].offset.x);
  if( obj.flip === 6 )
    obj.offset = {x:A.Status.click.y ,y:A.Status.click.x };
  else
    obj.offset = {x:A.Status.click.x ,y:A.Status.click.y };
  obj.dragIx = rulerIxOfx( A, obj, obj.offset.x);
  computeMidDraggerIx(A, obj);
  console.log( "Click Index: "+obj.dragIx );
  console.log( "Center Index: "+obj.centerIx );
}


function setItemsPerPixel( A, obj, itemsPerPixel ){
  if( obj.minScale )
    if( itemsPerPixel < obj.minScale )
      return;
  if( obj.maxScale )
    if( itemsPerPixel > obj.maxScale )
      return;

  var mid = obj.content[1];

  //console.log("New scale: "+scale);
  var startIx = obj.centerIx - mid.offset.x * itemsPerPixel;
  var endIx = obj.centerIx + (obj.rect.x - mid.offset.x ) * itemsPerPixel;

  obj.atStart = constrain( -70, startIx, 2000 );
  obj.atEnd = constrain( -70, endIx, 2000 );
  var shift = Math.max( startIx - obj.atStart, endIx - obj.atEnd );

  obj.atStart = startIx - shift;
  obj.atEnd = endIx - shift;

}


function draggingRuler( A, obj, dd ){
  dd.y = constrain( 20, dd.y, 20 );
  dd.x = constrain( 20+obj.pos.x, dd.x, obj.pos.x+obj.rect.x-20 );

  var mid = obj.content[1];
  var midx = mid.offset.x + mid.pos.x;


  //midx=0;
  //console.log("dd.x: "+dd.x);
  var dx = dd.x - midx;// - obj.pos.x;
  if( Math.abs( dx) < 0 )
    return;
  var itemsPerPixel = (obj.dragIx - obj.centerIx)/dx;
  if( itemsPerPixel <= 0 )
    return;

  // this size gives us numbers at 0.1, 0.2, and prevents
  // zooming in further than that.  For waveforms display.
  if( itemsPerPixel < 0.002)
    return;

  setItemsPerPixel( A, obj, itemsPerPixel );
  replaceMidDragger(A, obj );

  if( obj.zoomSets ){
    //var xStart = obj.atStart;
    //var xEnd = obj.atEnd;
    //var ddx = xEnd - xStart;
    //var xScale = ddx / obj.rect.x;

    ruler2 = getObjectByName(A, obj.zoomSets);
    computeMidDraggerIx(A, ruler2);
    setItemsPerPixel( A, ruler2, itemsPerPixel );

  }
}

/**
 * Dragger can be on its line or slightly below.
 * If below, it moves without dragging.
 * When dragging, gearing is 3x for ruler motion.
 * @param A
 * @param obj
 * @param dd
 */
function draggingMarker( A, obj, dd ){
  var parent = obj.parent;
  var inset = obj.inset;
  inset = 0;
  dd.y = constrain( 0, dd.y, obj.wobble );
  dd.x = constrain( inset, dd.x,
    parent.rect.x-inset );

  // code for disengaging the dragger.
  // if we're far enough off the line, disengage.
  if( dd.y >= Math.max(1,obj.wobble) )
    return;

  // offset is used in positioning for drawing.
  var dx = obj.offset.x - dd.x;
  dx *= parent.itemsPerPixel;
  dx *= obj.gearing;
  //dx *=3;
  dx = constrain( -70-parent.atStart, dx, 2000-parent.atEnd );
  parent.atStart += dx;
  parent.atEnd   += dx;
  console.log( "SE: "+ parent.atStart +" "+ parent.atEnd );

  // dragging the end draggers can position the mid dragger...
  if( obj.glyph === "Mid" )
    return;
  repositionMidDragger(A, obj.parent );
}

var dragNamer = 1234;

function onDraggableClicked2(A, obj){
  var {x,y,xw,yh} = getBox( obj );

  if( !A.Status.click )
    return;
  console.log( "Clicked on Ruler Object ", obj.id );
  A.dragObj = obj;
  computeMidDraggerIx(A, obj.parent);
}


function makeDraggerObject(obj, A, pos){
  var dragger = {};
  dragger.pos = {};
  dragger.rect = {}
  var inset = 30;
  var objectWidth = 15;
  dragger.pos.x = obj.pos.x;
  dragger.pos.y = obj.pos.y+obj.rect.y-objectWidth;
  dragger.rect.x = objectWidth*(1+(pos%2));
  dragger.rect.y = objectWidth;
  dragger.type = "Drag2";
  dragger.flip = obj.flip;
  var types = "L Mid R".split(" ");
  dragger.glyph = types[pos];
  dragger.onClick = onDraggableClicked2;
  dragger.offset = { x: pos * (obj.rect.x / 2 -inset ) +inset, y: 0};
  dragger.id = "Drag"+(dragNamer++);
  dragger.wobble = 0;
  dragger.gearing = 1;
  dragger.inset = inset;
  addObjectToDictionary(A, dragger);
  dragger.parent = obj;
  obj.content.push(dragger);
  return dragger;
}

/**
 * On finishing mid dragger dragging, it pops back onto its line.
 * (it could have been dragged down slightly)
 * @param A
 * @param obj
 */
function finishMid( A, obj ){
  obj.offset.y = 0;
  A.dragObj = undefined;
  finalDraw( A, obj );
}

/**
 * On finishing left dragger dragging, it goes back to the left end.
 * @param A
 * @param obj
 */
function finishLDragger( A, obj ){
  obj.offset.x = obj.inset;//45;// - obj.pos.x;
  A.dragObj = undefined;
  finalDraw( A, obj );
}

/**
 * On finishing right dragger dragging, it goes back to the right end.
 * @param A
 * @param obj
 */
function finishRDragger( A, obj ){
  obj.offset.x = obj.parent.rect.x  - obj.inset;
  A.dragObj = undefined;
  finalDraw( A, obj );
}

/**
 * Updates the position of the draggers AND
 * updates the parent object too, if required.
 * @param A
 * @param obj
 * @param d
 */

function updateDraggers(A, obj, d){
  //console.log( "draw - "+obj.type);
  //var stage = d.stage;
  //if( stage !== kStageFillAndText ) return;

  if( obj.content.length === 0 ){
    var dragger;
    dragger = makeDraggerObject(obj, A, 0);
    dragger.dragFn = draggingMarker;
    dragger.onMouseUp = finishLDragger;
    dragger = makeDraggerObject(obj, A, 1);
    dragger.dragFn = draggingMarker;
    // wobble is how far off the horizontal line the dragger can move
    // if it moves as far as possible off the line it 'disengages'.
    //dragger.wobble = 5;
    dragger.gearing= 1;
    dragger.inset += 20;
    dragger.onMouseUp = finishMid;
    dragger = makeDraggerObject(obj, A, 2);
    dragger.dragFn = draggingMarker;
    dragger.onMouseUp = finishRDragger;
  }
  // invokes drawDraggers, but this is actually just doing position updates.
  drawDraggers(A, obj, d );
}

function drawDraggers(A, obj, d){
  //console.log( "draw - "+obj.type);
  drawContainer(A, obj, d);
}


//--------- end of ruler functions.



/** 
 * This unassuming function does all the iterations to set
 * up and draw the scene graph.
 */
function sizeLayoutAndDrawDiagram(A, obj, d){
  sizeCells(A, obj, d);
  d.margins = 0;
  layoutCells(A, obj, d);
  drawDiagram(A, obj, d);
}

function setupAndDrawDiagramDiv(A){
  console.log(`[${A.index}] now setupAndDrawDiagram`);
  A.resizeDivs();
  var d = {};
  var obj = A.RootObject;
  setCellLayout( A,0, 0, A.Porthole.width, A.Porthole.height, obj);
  sizeLayoutAndDrawDiagram(A, obj, d);
  A.Status.isAppReady = true;
}

function updateImages(A){
  if( !A.BackingCanvas )
    return;
  setupAndDrawDiagramDiv(A);
}


function animateForOneDiagram(A){
  // When to animate depends on 
  // Whether we have focus (i.e. is cursor over diagram?)
  // Whether we are in the animate period.
  // Whether there are new events.
  var animate = !A.Status.isFocus && (A.Status.time < 30 );
  animate = animate || A.newEvents 
  if( !animate )
    return;
  A.newEvents = false;
  A.Status.time++;
  // animation stops on America.
  // and dark side of moon.
  //if( A.Status.time > 600 )
  //  continue;
  if( !A.Status.drawing )
    drawDiagram(A, A.RootObject, {});
}

/**
 * Where an object contains styling information, update the style from it.
 * Where it doesn't, get its style from the styling object (or from defaults)
 * @param A
 * @param obj
 */
function mayUpdateObjectStyle(A, obj){
  if( isDefined( obj.style) && isFinite( obj.style )){
    A.Styles.current = obj.style;
  }
  var styleRec = A.Styles.dict[ A.Styles.current ] || {};
  if( styleRec ){
    obj.colour       = firstValid(obj.colour, styleRec.colour);
    obj.borderColour = firstValid(obj.borderColour, styleRec.borderColour);
    obj.cornerRadius = firstValid(obj.cornerRadius, styleRec.cornerRadius);
  }
  styleRec.colour       = firstValid( obj.colour, "rgb(255,255,255)" );
  styleRec.borderColour = firstValid( obj.borderColour, "rgb(80,80,200)");
  styleRec.cornerRadius = firstValid( obj.cornerRadius, 0 );
  styleRec.head         = firstValid( obj.head, false );
  A.Styles.dict[ A.Styles.current ] = styleRec;
}

/**
 * Used in mapping calculation, this goes from a projected
 * coordinate x, to an angle coordinate.
 * @param x - projected coordinate in range -1 to +1
 * @returns {number} - latitude in range 0 to 1
 */
function fractionalLatitudeFromX(x){
  return Math.acos(-x) / Math.PI;
}

/**
 * Takes the objects colours, if any, and applies
 * them to the context.
 * @param ctx
 * @param obj
 */
function applyObjectSettingsToContext(ctx, obj){
  ctx.font = "16px Arial";
  ctx.globalCompositeOperation = 'source-over';

  ctx.lineWidth = firstValid( obj.lineWidth, 3 );
  ctx.fillStyle = firstValid( obj.colour, "rgba(255,255,255,1.0)" );
  ctx.strokeStyle = firstValid( obj.borderColour, "rgba( 55, 55,155,1.0)" );
}

/**
 * Computes length and angle of line between two points
 * and presents in two endpoint structures.
 * @param pt1
 * @param pt2
 * @returns {[]} - two endpoints, with x,y,l and theta.
 */
function getLineBetweenPoints(pt1, pt2){
  var vx = pt2.x - pt1.x;
  var vy = pt2.y - pt1.y;

  var l = Math.sqrt( vx * vx + vy*vy);
  var S = [];

  S[0] = { x: pt1.x, y: pt1.y, l:l};
  S[1] = { x: pt2.x, y: pt2.y, l:l};

  S[0].theta = Math.atan2(vy, vx)+ Math.PI;
  S[1].theta = S[0].theta - Math.PI;

  return S;
}

/**
 * Computes fraction by which to trim a line to account for
 * size of a rectangular or circular object.
 * @param obj - the object
 * @param vx - x displacement to trim
 * @param vy - y displacement to trim
 * @returns {number} - the amount to multiply displacement by in order to trim.
 */
function getTrimmedLineExtent(obj, vx, vy){
  var m = 0;
  var k = 1;

  if( obj.type === "Draggable" )
    return 1;

  if( obj.type === "Circle" ){
    var r = Math.min(obj.rect.y, obj.rect.x) / 2;
    m = k * r / Math.sqrt(vx * vx + vy * vy);
  } else {
    m = 1;//0.5;

    if( Math.abs(vx) * obj.rect.y > Math.abs(vy) * obj.rect.x ){
      m = obj.rect.x / (2 * Math.abs(vx));
    } else {
      m = obj.rect.y / (2 * Math.abs(vy));
    }
    m = m * k;
  }
  return m;
}

/**
 * Computes length and angle of line between two objects
 * and presents in two endpoint structures.  The line is
 * trimmed to land on boundary of circular or rectangular objects
 * @param obj1
 * @param obj2
 * @returns {[]} - two endpoints, with x,y,l and theta
 */
function getTrimmedLineBetweenObjects(obj1, obj2){
  var x1 = obj1.pos.x + obj1.rect.x / 2;
  var x2 = obj2.pos.x + obj2.rect.x / 2;
  var y1 = obj1.pos.y + obj1.rect.y / 2;
  var y2 = obj2.pos.y + obj2.rect.y / 2;
  if( isDefined( obj1.offset ) ){
    x1=obj1.offset.x+obj1.pos.x;
    y1=obj1.offset.y+obj1.pos.y;
  }
  if( isDefined( obj2.offset ) ){
    x2=obj2.offset.x+obj2.pos.x;
    y2=obj2.offset.y+obj2.pos.y;
  }
  var vx = x2 - x1;
  var vy = y2 - y1;

  var m = getTrimmedLineExtent(obj2, vx, vy);
  var n = getTrimmedLineExtent(obj1, vx, vy);

  var S = [];
  S[0] = {};
  S[1] = {};

  S[0].theta = Math.atan2(vy, vx) + Math.PI;
  S[1].theta = S[0].theta - Math.PI;

  S[0].x = x1 + n * vx;
  S[0].y = y1 + n * vy;
  S[1].x = x2 - m * vx;
  S[1].y = y2 - m * vy;

  vx = S[1].x - S[0].x;
  vy = S[1].y - S[0].y;

  var l = Math.sqrt( vx * vx + vy * vy);
  S[0].l = l;
  S[1].l = l;

  return S;
}

/**
 * Looks up an object by name.
 * @param A
 * @param id - the name.
 * @returns {*} - the found object
 */
function objectFromId(A, id){
  if( !isDefined(id) )
    return undefined;
  return A.RootObject.objectDict[id.substr(0, 10)];
}




// >>>>>>>>>>>>>>>>>>>>> Texty

/**
 * HTML anchor tag from a string like 'Pathway:WP2376'
 * @param str
 * @returns {string|*}
 */
function anchorTagFromWikipathwyaName(str){
  if( str.indexOf( "Pathway:" ) === 0 ){
    return "<a href='https://www.wikipathways.org/index.php/" +
      str+ "' target='_blank'>" + str.substr(8) + "</a>";
  }
  return str;
}

/**
 * HTML anchor tag from a string like 'PCMID: 19825'
 * @param str
 * @returns {string|*}
 */
function anchorTagFromPmcid(str){
  if( str.indexOf( "PMCID: " ) === 0 ){
    return "<a href='https://www.ncbi.nlm.nih.gov/pmc/articles/" +
      str.substr(7) + "/' target='_blank'>" + str.substr(7) + "</a>";
  }
  return str;
}

/**
 * Html anchor tag from a string like 'EffectDefinitionInterface'
 * The anchor link will be class_effect_definition_interface.
 * @param word
 * @returns {string}
 */
function anchorTagFromDoxygennedClassName(word){
  var url = word;
  url = url.replace(/([A-Z])/g, function( match, index){
    return ( "_"+match[0].toLowerCase());
  });
  url = "https://doxy.audacityteam.org/class" + url + ".html";
  return "<a href='"+url.toLowerCase() + "'>" + word +"</a>";
}




/**
 * Take a bare filename, and prefix whatever is needed to make a url
 * @param file
 * @returns {string}
 */
function urlOfFilename(file){
  file = Registrar.imageSrc + file;
  return file;
}

/**
 * Class names that get doxygenned get wrapped with their <a href> tags
 * @param A
 * @param text
 * @returns {void|*}
 */
function formatClassNames(A, text){
  if( !A.Styles.autolink )
    return text;
  var result = text.replace(
    /([a-zA-Z0-9_]+[A-Z]+[A-Za-z0-9_]*)/g,
    function(match ){
      return anchorTagFromDoxygennedClassName( match);});
  return result;
}

/**
 * Replace strings like '[https:something foo]' with
 *    <a href='https:something'>foo</a>
 * i.e. replace external links marked up as in mediawiki.
 * @param text
 * @returns {string}
 */
function formatWikiExternalLinks(text){
  text = text.split("[http");
  var result = text[0];
  text[0] = "";
  text.forEach(function(item){
    if( item ){
      item = item.replace(" ", "'>");
      item = item.replace("]", "</a>");
      result += "<a href='http" + item;
    }
  });
  return result;
}

/**
 * SECURITY
 * In a production system, this function should be called on all text being
 * added into tags, for example but not limitted to using innerHTML.
 * We potentially have untrusted html to place in the tag.
 * @todo This function needs to remove dangerous tags
 * Dangerous tags would include, but are not limited to, <script> and also
 * It is almost certainly safer to whitelist allowed tags than 
 * to blacklist dangerous ones.  Also beware of character
 * encoding exploits that defeat some character detection
 * approaches.
 * OnClick().
 * @param html - Unsanitised (unsafe) html
 * @returns {string} - Sanitised (safe) html
 */
function sanitiseHtml(html){
  html = formatWikiExternalLinks(html);
  // Whitelist all relevant tags.
  return html;
}


// >>>>>>>>>>>>>>>>>>>>> Draw Helpers


/**
 * Ghosted style is translucent black
 * and with no outline
 */
function setGhostedStyle(ctx,S,intensity){
  ctx.fillStyle = "rgba(0,0,0,"+(intensity || 0.4)+")";
  S.doStroke = false;
}

/*---------------------------------------------------------------

Functions with arguments (A,obj,d)

A is the Annotated display.  It holds the canvas, the hotspot colours and more.
obj is the thing being drawn.
d is a visitor.  It carries flags and customisations.



Functions with arguments (A,obj,S)

S holds shape information for a small centred shape, typically
x and y and r or h.  The obj parameter is essentially irrelevant.



Functions with arguments (A,obj,T)

T holds t



---------------------------------------------------------------*/

/**
 * Usually returns the context for the main (i.e. backing)
 * canvas.  However arguments may cause a different canvas
 * as for example when drawing to an overlay.
 */
function getCtx( A, obj, d ){
  if( d.ctx )
    return d.ctx;
  if( d.isHotspot === true )
    return A.HotspotsCanvas.ctx;
  return A.BackingCanvas.ctx;
}

function makeObjectTip(A, T){
  var card = T.obj.autoTip || "Value: %v1 at: %label";
  card = T.subber(T.i, card);
  return A.nextAutoColour(card);
}

function applyObjectColourAndTip(A, obj, T){
  var ctx = A.BackingCanvas.ctx;
  if( T.stage === kStageHots ){
    var colour = makeObjectTip(A, T);
    ctx = A.Hotspots.ctx;
    ctx.fillStyle = colour;// rgbOfJsonColourTuple(colour);
  } else {
    ctx.fillStyle = obj.colour;
  }
  return ctx;
}

/**
 * Given a screen x position determine the
 * ruler index
 * @param x - x position on screen
 * @param ruler
 * @returns {number} - the ruler index
 */
function rulerIndexFromX(x, ruler){
  var i = tBlend( ruler.atStart, ruler.atEnd, x/ruler.rect.x);
  return i;
}

/**
 * Converts item no into y height
 * @param i - item number
 * @param obj - object to use for scaling calcs.
 * @returns {number}
 */
function scaledYofItem(i, obj ){
  var {x,y,xw,yh} = getBox( obj );

  var y1 = y + (RR.graphFn( i, obj.perturb )*yh/2)+yh/2;
  return y1;
}

/**
 * Pads a short kwic string with space,
 * just before the start marker, usually ":< ".
 * Function ASSUMES only one start marker.
 * Will make multiple changes otherwise.
 * @param str - string to pad
 * @param beforeWhat - the string to pad before
 * @param nChars - Desired final length
 * @returns {string}
 */
function mayPadBefore(str, beforeWhat, nChars){
  var lenStr = str.length;
  if( lenStr < nChars ){
    var pad = Array(lenStr-nChars+1).join(' ');
    str = str.split(beforeWhat).join(pad+beforeWhat);
  }
  return str;
}


function setSpanFromT( span, T ){
  if( span.vStart === undefined ){
    span.vStart = T.values[T.i][T.ix] - T.minY;
    span.vEnd = T.values[T.i][T.ix + 1] - T.minY;
  } else {
    span.vEnd = T.values[T.i][T.ix ] - T.minY;
  }


  var yEnd = span.vEnd * T.yScaler;
  var yStart = span.vStart * T.yScaler;

  var x = T.margin + T.x0 + T.i * T.xScaler;
  var x0 =  x + (T.ix - 1) * T.width;
  var y0 = T.yh - (T.margin ) + T.y0+fudgeBarDrop;

  span.card = T.getTip();
  span.colour = T.colours[ T.ix % 2];

  span.pos={};
  span.rect={};

  span.pos.x = x0;
  span.pos.y = y0-yEnd;
  span.rect.x = T.width;
  span.rect.y = yEnd-yStart;
}

function getTip(){
  var T = this;
  var card = T.obj.autoTip || "Value: %v1 at: %label";
  card = T.subber( T.i, card );
  return card;
}

function configureObject( object, T ){
}


var spacedDrawFunctions = {
  "bar" : drawBar,
  "label" : drawGraphLabel,
  "pie" : drawDonut,
  "spot" : drawPlottedRect,
  "event" : drawEvent,
  "lines" : drawLines,
  "spans" : drawSpan
};


// >>>>>>>>>>>>>>>>>>>>> Draw

function drawDiagram(A, obj, d){
  if( !obj )
    return;
  var pos = obj.pos;
  if( !pos )
    return;
  var rect = obj.rect;

  A.Status.drawing = true;
  var ctx = A.BackingCanvas.ctx;
  var ctx2 = A.HotspotsCanvas.ctx;

  ctx.clearRect(pos.x,pos.y,rect.x,rect.y);
  ctx2.clearRect(pos.x,pos.y,rect.x,rect.y);

  // Some hotpspot colours are created as needed.

  d.transform = {};
  d.transform.size = 1;
  d.transform.rotate= 0;

  var i;
  for(i=0;i<=10;i++){
    A.Hotspots.autoColourIx = A.Hotspots.InitialAutocolours;
    d.stage = i;
    drawCells(A, obj, d);
  }

  // We're forcing diagrams to have an info hotspot
  // And we're placing it on top of any other hotspots.
  A.drawInfoButtonHotspot();
  A.Status.drawing = false;
}

function drawDiagramAgain(A){
  if( !A.Status.drawing )
    drawDiagram(A, A.RootObject, {});
}


// Functions for drawing small centred objects.
// Star, spot, rectangle etc...

function drawStar(A, obj, S){
  var n = 10;
  var r = S.r || 3.5;
  var ctx = getCtx( A, obj, S );

  ctx.beginPath();
  var i;
  for( i = 0; i <= n; i++ ){
    var theta = Math.PI * 2 * (i / n) + S.theta;
    var r0 = (i % 2 === 0) ? r : 2.5 * r;
    var xx = S.x + r0 * Math.cos(theta);
    var yy = S.y + r0 * Math.sin(theta);
    if( i === 0 ) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
  }
  ctx.fill();
  ctx.lineWidth = 0.5;
  if( !isDefined( S.doStroke ) || S.doStroke )
    ctx.stroke();
}

function drawSpot(A, obj, S){
  var ctx = getCtx( A, obj, S );
  ctx.beginPath();
  ctx.arc(S.x, S.y, S.r, 0, 2 * Math.PI, false);
  ctx.closePath();
  ctx.fill();
  if( !isDefined( S.doStroke ) || S.doStroke )
    ctx.stroke();
}

function drawCentredRect(A, obj, S){
  var ctx = getCtx( A, obj, S );

  ctx.beginPath();
  ctx.rect(S.x -S.w/2, S.y - S.h/2, S.w, S.h);
  ctx.closePath();
  ctx.fill();
  if( !isDefined( S.doStroke ) || S.doStroke )
    ctx.stroke();
}

function drawUpTriangle(A, obj, S){
  var ctx = getCtx( A, obj, S );
  var k = 3;
  ctx.beginPath();
  ctx.moveTo( S.x, S.y);
  ctx.lineTo(S.x - S.w/2, S.y + S.h);
  ctx.lineTo(S.x - S.w/2, S.y + S.h+k);
  ctx.lineTo(S.x + S.w/2, S.y + S.h+k);
  ctx.lineTo(S.x + S.w/2, S.y + S.h);
  ctx.closePath();
  ctx.fill();
  if( !isDefined( S.doStroke ) || S.doStroke )
    ctx.stroke();
}

function drawLeftL(A, obj, S){
  var ctx = getCtx( A, obj, S );
  var k = 5;
  ctx.beginPath();
  ctx.moveTo( S.x, S.y);
  ctx.lineTo(S.x , S.y + S.h+k);
  ctx.lineTo(S.x + S.w, S.y + S.h+k);
  ctx.lineTo(S.x + S.w, S.y + S.h);
  ctx.lineTo(S.x + S.w -k/2, S.y + S.h);
  ctx.lineTo(S.x + k, S.y + k/2);
  ctx.lineTo(S.x + k, S.y );
  ctx.closePath();
  ctx.fill();
  if( !isDefined( S.doStroke ) || S.doStroke )
    ctx.stroke();
}

function drawRightL(A, obj, S){
  var ctx = getCtx( A, obj, S );
  var k = 5;
  ctx.beginPath();
  ctx.moveTo( S.x, S.y);
  ctx.lineTo(S.x , S.y + S.h+k);
  ctx.lineTo(S.x - S.w, S.y + S.h+k);
  ctx.lineTo(S.x - S.w, S.y + S.h);
  ctx.lineTo(S.x - S.w +k/2, S.y + S.h);
  ctx.lineTo(S.x - k, S.y + k/2);
  ctx.lineTo(S.x - k, S.y );
  ctx.closePath();
  ctx.fill();
  if( !isDefined( S.doStroke ) || S.doStroke )
    ctx.stroke();
}

// Used for horizontal lines of the scale.
// drawn behind a graph.
function drawLines(A,obj, T){
  if( T.stage !== kStageFillAndText )
    return;
  if( T.i!== 0)
    return;

  var rect = T.obj.rect;
  var x = T.margin + T.x0 - fudgeLineMargin;
  var y = T.yh + T.y0 + fudgeLineDrop;
  var xw = rect.x - 2*T.margin+2*fudgeLineMargin;
  var yh = T.yh;

  var ctx = A.BackingCanvas.ctx;

  ctx.fillStyle = "rgba(105,205,105,1.0)";
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = "black";

  //var y0 = (T.margin ) + T.y0+fudgeBarDrop;
  var y0 = T.yh - T.margin  + T.y0+fudgeLineDrop;


  var i;
  for(i=0;i<=T.maxY;i+=T.linesAt){
    var yy = y0 - i* T.yScalerMax;

    // Get crisp lines by positioning at 0.5 of a pixel.
    yy = Math.floor( yy ) + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, yy);
    ctx.lineTo(x + xw, yy );
    ctx.stroke();

    // Draw the numerical label
    ctx.save();
    ctx.textAlign = "right";
    ctx.font = "10px Arial";
    ctx.fillStyle = "rgba(15,35,165,1.0)";
    ctx.fillText( i, x-fudgeLabelMargin, yy+fudgeLabelDrop);
    ctx.restore();
  }
}

// Can be used, for example, to draw bars in a chart.
function drawSpanObject(A, obj, T){

  var ctx = applyObjectColourAndTip(A, obj, T);

  ctx.beginPath();
  ctx.rect(obj.pos.x, obj.pos.y, obj.rect.x, obj.rect.y);
  ctx.fill();

  if( T.stage !== kStageFillAndText )
    return;

  ctx.lineWidth = 0.5;
  ctx.strokeStyle = "black";
  ctx.stroke();

  //x0 += T.width/2;

  //var S = getLineBetweenPoints({ x: x0, y: y0 + yEnd }, { x: x0, y: y0 +yStart });
  //var obj = {S:S};
  //drawEnds( ctx, obj, 8);

  //drawSpotification( A, S, 20 );
}


// Special 'L' shaped lines for the Chronogram.
function drawStem(A,obj, T){

  var i = T.i;
  var ix = T.ix;

  var x = T.margin + T.x0 + i * T.xScaler;

  var vEnd = T.values[i][ix] -T.minY;
  var vStart = vEnd - T.values[i][ T.stemCol ];


  var yEnd = vEnd * T.yScaler;
  var yStart = vStart * T.yScaler;
  var ctx = A.BackingCanvas.ctx;

  ctx.fillStyle = T.colours[ ix % 2];

  var x0 =  x + (ix - 1) * T.width;
  var y0 = T.yh - (T.margin ) + T.y0+fudgeBarDrop;

  ctx.beginPath();
  ctx.rect(x0+T.width/2-1, y0-yEnd, 2, -yStart+yEnd);
  var k = T.values[i][T.stemCol+1];
  if( k!==0 )
     ctx.rect(x0+T.width/2+1, y0-yStart, k*T.xScaler, 2);
  ctx.fill();
}

// Used for values that follow (are on) a curve as in rainfall graph.
function drawPlottedRect(A, obj, T){
  var i = T.i;
  var ix = T.ix;

  var vx = T.values[i][ix];
  var x = T.margin + T.x0 + i * T.xScaler;
  var y = vx * T.yScaler;
  var ctx = A.BackingCanvas.ctx;
  ctx.beginPath();
  ctx.rect(x + (ix - 1) * T.width,
    T.yh - (T.margin + y) + T.y0, T.width, T.width);
  ctx.fillStyle =
    (ix !== 1) ? "rgba(105,205,105,1.0)" : "rgba(105,105,205,1.0)";
  ctx.fill();
  ctx.stroke();
}

// Used for irregularly spaced items.
// For example, on a bar chart we may show 'events' as stars 
// overlaying the time axis.
function drawEvent(A,obj, T){
  var i = T.i;
  var ix = T.ix;

  if( ix !== 1)
    return;

  var vx;

  // This should all be calculated in advance and rolled into the scaling.
  {
    var date = T.obj.range[0];
    var low = minutesFromDate( date );
    //console.log( "Low for "+ date + " was " + low );
    var date2 = T.obj.range[1];
    var high = minutesFromDate( date2 );
    //console.log( "Low for "+ date2 + " was " + high );
    var date3 = T.values[i][0];
    var vv = minutesFromDate( date3 );
    vx =  (vv- low)/(high-low);
    vx = vx * (T.rows * T.xScaler - T.spacer) / T.xScaler;
  }


  var x = 7+T.margin + T.x0 + vx * T.xScaler;
  var y = T.yh + T.y0 - T.margin - 0.0 * 2000 * T.yScaler+fudgeStarDrop;

  var star = {};
  star.colour = "rgb(205,192,67)";
  var ctx = applyObjectColourAndTip(A, star, T);

  var S = { x:x,y:y,theta:Math.PI * 2 * (Math.min(20, A.Status.time) / 40)};

  ctx.strokeStyle = "rgb(120,97,46)";
  S.doStroke = T.stage === kStageFillAndText;
  S.isHotspot = !S.doStroke;
  drawStar(A, star, S);
}


/**
 * Draw one piece of arc in the donut plot.
 * @param A
 * @param arc
 * @param d
 */
function drawArcObject(A, arc, d){
  var ctx = A.BackingCanvas.ctx;
  if( d.stage === kStageHots ){
    ctx = A.HotspotsCanvas.ctx;
  }

  // local vars...
  var {x,y,r2,r,t0,t1} = arc;
  var s = new Shape();

  // In polar coordinates!
  s.addPoints( t0,r2, t1,r2, t1,r, t0,r);

  var style = { outline:undefined, fill: "#55AA77", width:1};
  style.fill = arc.colour;
  if( d.stage === kStageFillAndText )
    style.outline = "#000000";

  var wartList = new Shape();
  // clockwise, from top right.
  wartList.addEdges( "\\/\\", "straight", "\\/\\", "straight" );
  s = s.addWarts( wartList, 0.009 );

  s.drawPolar( ctx, style, Vector2d( x,y) );
}

function drawDonut(A,obj, T){
  if( T.stage !== kStageFillAndText && T.stage !== kStageHots )
    return;
  if( T.i!== 0 )
    return;

  var arc = {};

  var pos = T.obj.pos;
  var rect = T.obj.rect;
  var xw = rect.x;
  var yh = rect.y;

  arc.x =  pos.x + xw / 2;
  arc.y =  pos.y + yh / 2;
  arc.r = Math.min( xw, yh) / 2;
  arc.r2 = arc.r * 0.70;
  arc.t0 = 2.0 * Math.PI * 0.75;
  arc.t1 = 2.0 * Math.PI * 0.75;

  // get total
  T.total = 0;
  var j;
  for( j = 0; j < T.values.length; j++ )
    T.total += T.values[j][1];

  var frac = Math.min(20, A.Status.time) / 20;
  frac *= Math.PI * 2/T.total;

 // frac = 1.0;
  for( j = 0; j < T.values.length; j++ ){
    T.i = j;
    arc.t0 = arc.t1;
    arc.t1 = arc.t1 + frac * T.values[j][1];
    arc.colour = makeObjectTip(A, T);
    A.Hotspots.autoColourIx += 2;
    drawArcObject(A, arc, T);
  }
}

function drawLabelObject(A, label, u){

  var ctx = A.BackingCanvas.ctx;
  ctx.save();
  ctx.beginPath();
  ctx.translate(label.pos.x , label.pos.y );
  ctx.rotate(label.rotate || -Math.PI / 4);
  ctx.textAlign = label.textAlign || "right";
  ctx.font = "12px Arial";
  ctx.fillStyle = "rgba(15,35,165,1.0)";
  ctx.fillText(label.text, 0, 0);
  ctx.restore();
}

function drawLabelHotspot(A, label, u){


  var bLeftAlign= ( label.textAlign === "left" );

  var ctx2 = A.HotspotsCanvas.ctx;
  ctx2.save();
  ctx2.beginPath();
  ctx2.translate(label.pos.x, label.pos.y);
  ctx2.rotate(label.rotate || -Math.PI / 4);
  ctx2.textAlign = label.textAlign || "right";
  ctx2.font = "12px Arial";
  var size = ctx2.measureText(label.text);
  ctx2.fillStyle = label.hotspotColour;
  ctx2.rect(bLeftAlign ? 0:-size.width, -9, size.width, 9);
  ctx2.fill();
  ctx2.restore();
}

function drawGraphLabel(A,obj, T){
  var i = T.i;
  var ix = T.ix;

  // Only label the x axis items once.
  if( ix > 1 )
    return;
  // The +8 is 0.707 * font height of 11.
  var x = T.margin + T.x0 + i * T.xScaler+(T.width*T.cols)*0.5+8;
  var y = T.margin;


  var shiftTextY = -T.margin;
  var shiftTextX = 0;
  if( T.textAlign === "left" ){
    shiftTextY *= -0.35;
    shiftTextX = 12;
  }

  var label = {};
  label.pos = {};
  label.pos.x = x+ (ix - 1) * T.width + shiftTextX;
  label.pos.y = T.yh - y + T.y0 + shiftTextY;
  label.rotate = T.rotate;
  label.textAlign = T.textAlign;
  label.text = T.values[i][0];

  drawLabelObject(A, label, label);

  if( !isDefined( T.obj.cardsOnLabels ))
    return;

  if(T.stage !== kStageHots )
    return;

  // HACK: We may be attempting to draw hotspots with hot colours assigned
  // 'by forward reference'.
  // On first drawing the are not defined, so just bail on drawing.
  // So we are relying on the chart being drawn multiple times.
  if( !isDefined( T.startColourIx ))
    return;
  label.hotspotColour = autoColourFromIx(A, T.startColourIx + i);
  drawLabelHotspot(A, label, label);
}

function drawNowt(A,obj, T){
}

/**
 * Used for bars from value to value.
 * Both vStart and vEnd used.
 * @param A
 * @param T
 * @param obj
 */
function drawSpan(A,obj,T){
  if( T.stage !== kStageFillAndText && T.stage !== kStageHots )
    return;
  var span = {};
  span.vStart = undefined;

  setSpanFromT( span, T );
  drawSpanObject( A, span, T);
  if( T.stemCol && (T.ix ===1)){
    drawStem(A, obj, T);
  }
}

/**
 * Used for bars from base line to curve.
 * vStart is zero
 * @param A
 * @param T
 * @param obj
 */
function drawBar(A,obj, T){
  if( T.stage !== kStageFillAndText && T.stage !== kStageHots )
    return;
  var span = {};
  span.vStart = 0;

  setSpanFromT( span, T );
  drawSpanObject( A, span, T );
}

// >>>>>>>>>>>>>>>>>>> Draw iterators

function drawThingy( A, obj, T ){
  var fn = spacedDrawFunctions[ obj.type ];
  if( fn )
    fn( A, obj, T );
}

function drawSpacedItems(A,dummy, T){
  var j;
  var i;
  var obj = {};

  T.getTip = getTip;
  for( j = 0; j < T.cols; j++ ){
    T.j = j;
    T.ix = j;
    for( i = 0; i < T.rows; i++ ){
      T.i = i;
      obj.type = T.obj.subtype[j];
      drawThingy( A, obj, T );
    }
  }
}

function drawContainer(A, obj, d){
  //console.log( "draw container - "+obj.type);
  var n = obj.content.length;
  for( var i = 0; i < n; i++ ) drawCells(A,obj.content[i], d);
}

function drawChart(A, obj, d){
  if( d.stage !== kStageFillAndText && ( d.stage !== kStageHots ) )
    return;

  //console.log( "draw - "+obj.type);

  var T = {};

  T.stage = d.stage;
  T.obj = obj;// Heck, pass the whole object too...
  if( obj.valuesFrom ){
    var obj2 = getObjectByName(A,obj.valuesFrom );
    obj.values = obj2.values;
    obj.maxY = obj.maxY || obj2.maxY;
    obj.startColourIx = obj2.startColourIx;
  }
  else if( d.stage === kStageHots )
  {
    obj.startColourIx = A.Hotspots.autoColourIx ||0;
  }
  if( !obj.values )
    return;

  if( obj.stemCol ){   T.stemCol = obj.stemCol; }
  if( obj.rotate ){T.rotate = obj.rotate;}
  if( obj.textAlign ) {T.textAlign = obj.textAlign;}

  T.colours = [];
  T.colours[0] = "rgba(105,205,105,1.0)";
  T.colours[1] = "rgba(105,105,205,1.0)";
  T.linesAt = obj.linesAt || 200;

  T.minY = isDefined( obj.minY ) ? obj.minY : 0;
  T.maxY = isDefined( obj.maxY ) ? obj.maxY : 2600;

  if( obj.display && obj.display[1].startsWith("#") )
    T.colours[1] = obj.display[1];

  T.subber = makeLabelReplacerFn(obj);
  T.values = obj.values;
  T.startColourIx = obj.startColourIx;

  // We can either specify width of the bars, or the spacing between bar groups.
  if( obj.spacer ){
    T.spacer = obj.spacer;
  }
  else
    T.width = 8;

  T.x0 = obj.pos.x;
  T.y0 = obj.pos.y;
  T.xw = obj.rect.x;
  T.yh = obj.rect.y;


  var dummy;
  apportionSpaceInT(A,T);
  drawSpacedItems(A,dummy, T);
}

function drawNowt2( A, obj, d ){

}

function drawSnakeRect(A, obj, S){
  if( S.isHead ){
    drawSpot( A, obj, S);
    return;
  }

  var d = S.isHotspot ? 14:8;
  var dx = 4+ 9 * (S.row % 2);
  var v = (S.row % 2) * (6 - S.r * 2) - 3;

  var T = {};
  T.x = S.x + dx;
  T.y = S.y -v -S.r;
  T.w = d;
  T.h = 2*S.r;
  T.doStroke = S.doStroke;
  T.ctx = S.ctx;
  drawCentredRect(A, T, T);
}

function drawSnakeSpotShape(A, obj, T){
  var drawFns = [drawSpot, drawSnakeRect, drawStar];

  var lines = ["rgb(150,150,150)", "rgb(156,3,0)", "rgb(15,0,181)"];
  var blobs = ["rgb(150,150,150)", "rgb(196,123,120)", "rgb(125,120,191)"];
  var xblobs = ["rgb(120,120,120)", "rgb(105,205,105)", "rgb(105,205,105)"];
  var xheads = ["rgb(180,180,180)", "rgb(182,222,157)", "rgb(182,222,157)"];
  var heads = ["rgb(150,150,150)", "rgb(236,203,200)", "rgb(205,200,240)"];


  var r = T.r0 + 7;
  var S;
  var X = T.item;
  var ctx = A.BackingCanvas.ctx;
  var ctx2 = A.HotspotsCanvas.ctx;

  var cardText = formatClassNames(A, X.docString);

  var c = A.nextAutoColour(cardText);
  r = 1.6 * Math.log((X.docString.length) + 0.1) + T.r0;

  if( X.docString.indexOf("No Description") >= 0 ){
    r = 3;
  }

  if( T.i < T.maxv ){
    S = T.fn(T.i, T);

    ctx.fillStyle = blobs[T.style];
    ctx.strokeStyle = lines[T.style];

    if( X.isHead ){
      // lighter green for head.
      ctx.fillStyle = heads[T.style];
      ctx.lineWidth = 1;
      r += 3;
      r = 11;
    }
    ctx2.fillStyle = c;
    S.isHead = X.isHead;
    S.r = r;

    S.doStroke = S.isHead || false;
    S.isHotspot = false;
    S.ctx = ctx;
    drawFns[T.shape](A, obj, S);

    // no stroke for hotspot.
    S.doStroke = false;
    S.isHotspot = true;
    S.ctx = ctx2;
    drawFns[T.shape](A, obj, S);

    if( S.isHead ){
      S.r = r - 2;
      // Pointed Arrow head inside snake head.
      drawAnEnd(A, S, S);
    }

    /*
          var isTail = isDefined( X.snakeStyle );
          if( isTail ){
            S.theta = S.theta + Math.PI;
            drawAnEnd( ctx, S, "flat",4);
          }
    */
  }
}

/**
 *
 * @param A
 * @param obj
 * @param T
 */
function drawSnakeSegment(A, obj, T){
  var widths = [5, 6, 9];
  var lines = ["rgb(150,150,150)", "rgb(156,3,0)", "rgb(15,0,181)"];
  var ctx = A.BackingCanvas.ctx;
  ctx.beginPath();
  ctx.lineWidth = widths[T.style];
  ctx.strokeStyle = lines[T.style];

  ctx.moveTo(T.x, T.y);
  var S = T.fn(T.i, T);
  if( i === 0 ){
    ctx.moveTo(S.x, S.y);
  } else if( T.theta !== undefined ){
    ctx.arc(S.x, S.y, T.ySpacing / 2, T.theta, T.theta + Math.PI,
      T.thetaDirection);
    S.y += T.ySpacing / 2;
  } else {
    ctx.lineTo(S.x, S.y);
  }
  if( !isDefined(T.item.snakeStyle) ){
    ctx.stroke();
  }
  T.x = S.x;
  T.y = S.y;
}

/**
 *For drawing a snakey plot
 * @param A
 * @param obj
 * @param T
 */
function drawSnakeyPath(A, obj, T){
  var i ;
  var values = obj.values;

  // These are concerned with animation - a gradual reveal of the
  // 'stations'.
  // The log heuristic makes us spend a bit
  // longer on very long paths
  var animateTime = 11 * Math.log(values.length + 5);
  var frac = Math.min(animateTime, A.Status.time) / animateTime;
  var maxv = Math.floor(frac * T.rows);

  T.maxv = maxv;

  // draw snakey body
  T.isPath = true;
  T.style = 1;
  T.shape = 0;
  T.x = 0;
  T.y=0;

  for( i = 0; i < maxv; i++ ){
    T.item =   values[i];
    T.i = i;
    T.style = mayUpdateSpotStyle(T.item, T.style, A);
    T.shape = mayUpdateSpotShape(T.item, T.shape);

    drawSnakeSegment(A, obj, T);
  }

  // draw blobs.
  T.isPath = false;
  T.style = 1;
  T.shape = 0;

  for( i = 0; i < T.rows; i++ ){
    T.item =   values[i];
    T.i = i;
    T.style = mayUpdateSpotStyle(T.item, T.style, A);
    T.shape = mayUpdateSpotShape(T.item, T.shape);

    drawSnakeSpotShape(A, obj, T);
  }
}

/**
 * draws a path inside a box.
 * @param A
 * @param obj
 * @param d
 */
function drawPath(A, obj, d ){
  if( d.stage !== kStageFillAndText )
    return;

  //console.log( "draw - "+obj.type);
  var {x,y,xw,yh} = getBox( obj );

  if( isDefined( obj.autolink ) )
    A.Styles.autolink = obj.autolink;

  var T = {};
  //T.width = 100;
  //T.spacer = 30;
  T.cols = 1;
  T.rows = obj.values.length;

  T.width = 15;

  T.margin = 9;
  T.factor = 1.1;// increase density along snake.
  xw -= 2*T.margin+T.width;
  yh -= 2*T.margin+T.width;
  // The sqrt is so that we get the same density in x and y.
  T.n = Math.ceil(Math.sqrt(T.rows * T.factor * xw / yh))+1;
  T.m = Math.ceil(T.rows / T.n);

  var unused = T.n * T.m - T.rows;
  // Make more square, if there is room.
  if( T.n < T.m )
    T.m -= Math.floor(unused / T.n);
  else
    T.n -= Math.floor(unused / T.m);

  //T.spacer = (xw-2* T.margin)/ (T.n-1);
  T.r0 = obj.baseSize || 0;
  T.x0 = x + T.margin + T.width / 2;
  T.y0 = y + T.margin + T.width / 2;
  T.xSpacing = xw / ((T.n-1)||1);
  T.ySpacing = yh / ((T.m-1)||1);

  T.fn = xyOfIndexSnakey;
  T.style = obj.style || 0;
  drawSnakeyPath(A,obj, T);
}

function drawTree(A, obj, d){
  //console.log( "draw - "+obj.type);
  drawPath(A, obj, d );
}


//{"Bugle":"R1",
//  "widths":[5,30],
//  "alignments":[0.5,0.7]

/**
 * Draw 'bugle' shape as used on spindle diagrams.
 * widths are in pixels
 * alignments are fractions.
 * @param A
 * @param obj
 * @param d
 */
function drawBugle(A, obj, d){
  if( d.stage !== kStageFillAndText )
    return;

  //console.log( "draw - "+obj.type);
  var {x,y,xw,yh} = getBox( obj );

  var ctx = A.BackingCanvas.ctx;
  obj.colour = "#e3a14e";  // wood light.
  //var ctx2 = A.HotspotsCanvas.ctx;
  drawRectangle(A,obj,d);

  var dy0 = (yh-obj.widths[0]) * obj.alignments[0];
  var dy1 = (yh-obj.widths[1]) * obj.alignments[1];
  ctx.beginPath();
  ctx.moveTo( x,y+dy0 );

  var k=60;
  var i;
  var t;
  var s;
  var b;
  var a;

  var ala = obj.alignments;

  for(i=0;i<=k;i++){
    t = i/k;
    s = t*t*(3-2*t);
    //s=t;
    b = RR.bulge(obj.bulge,obj.bulgeX,t);
    a = RR.tBlend(ala[0],ala[1],t);
    ctx.lineTo(x + xw*t, y + dy0 + (dy1-dy0)*s-b*a);
  }
  for(i=k;i>=0;i--){
    t = i/k;
    s = t*t*(3-2*t);
    //s=t;
    b = RR.bulge(obj.bulge,obj.bulgeX,t);
    a = RR.tBlend(ala[0],ala[1],t);
    ctx.lineTo(x + xw*t, y + dy0 + obj.widths[0] + (dy1-dy0+ obj.widths[1]-obj.widths[0])*s+b*(1-a));
  }
  ctx.closePath();
  ctx.fillStyle = "#ae7041";//wood dark
  ctx.fill();
  var bevelling = true;

  if( bevelling ){
    ctx.beginPath();
    // gradient for bevelled light-top and dark-bottom
    var grd = ctx.createLinearGradient(x, y, x, y+yh);
    // This is our 'wood' 2-tone bevel, with shades of 
    // brown and yellow. yellow tinge at top
    grd.addColorStop(0,      "#e3e38060");
    grd.addColorStop(0.1,    "#e3e31008");
    grd.addColorStop(0.5,    "#e3e31000");
    grd.addColorStop(0.5001, "#00000020");
    grd.addColorStop(0.95,   "#00000038");
    grd.addColorStop(1,      "#00008050");
    // blue tinge at bottom.

    ctx.fillStyle = grd;
    ctx.fillRect(x,y,xw,yh);
  }

}


function drawSphere(A,obj,S){

  var imageSource = getImageSource(A,obj,S);
  if( !imageSource )
    return;


  var xx = obj.pos.x;
  var yy = obj.pos.y;
  var xw = obj.rect.x;
  var yh = obj.rect.y;
  xw = Math.floor(xw);
  yh = Math.floor(yh);

  var img = imageSource.img;
  var srcData = imageSource.srcData;

  var ctx = getCtx( A, obj, S );



  var x0 = xw / 2;
  var rotate = img.width - ((A.Status.time * 3) % img.width);

  var offsets = imageSource.offsets || [];
  if( offsets.length !== img.width ){
    offsets = [];
    for( i = 0; i < img.width; i++ ){
      d =
        Math.floor(Math.asin(i / img.width) * (img.width) / (2 * Math.PI)) * 4;
      offsets.push(d);
    }
    imageSource.offsets = offsets;
  }

  var w = Math.floor(xw / 2);
  var h1 = Math.floor(yh / 2);
  var h = Math.min(h1, w);


  var adjustedOffsets = [];
  var spinStart = 0;//120;
  var frac = Math.max(0, Math.min(40, A.Status.time - spinStart)) / 40;

  if( frac === 1 ) 
    adjustedOffsets = offsets; 
  else for( var i = 0;i < img.width; i++ ){
    // 2*Math.PI would match the centre of the sphere exactly.
    // slightly less to match away from equator.
    // That way Africa bulges as the distortion happens.
    var p = i / (1.4 * Math.PI);
    adjustedOffsets.push(4 * Math.floor(p + frac * (offsets[i] / 4 - p)));
  }




  var dstData = ctx.getImageData(xx + (w - h), yy + (h1 - h), h * 2, h * 2);


  //var isSafari = window.safari !== undefined;

  for( var y = -h; y < h; y++ ){
    var dx = Math.floor(Math.sqrt(h * h - y * y));
    var srcLine = Math.floor(fractionalLatitudeFromX(y / h) * img.height);
    var srcBase = (srcLine * img.width + rotate) * 4;
    dx = h + frac * (dx - h);

    // for Safari it is important to use the actual width of dstData,
    // since getImageData may have given you more than what you asked for,
    var index = Math.floor((y + h) * dstData.width + h - dx) * 4;
    var rescaler = (img.width -1) / dx;
    var srcIndex;
    var offset;
    var src = srcData.data;
    var dst = dstData.data;

    for( var x = -dx; x < dx; x++ ){
      // This inner loop has had a little TLC for speed.
      // Taking 25% of CPU to 15% by taking calculations
      // outside the loop.
      offset = adjustedOffsets[Math.floor(Math.abs(x) * rescaler)];
      if( x < 0 )
        srcIndex = srcBase - offset;
      else
        srcIndex = srcBase + offset;
      if( src[srcIndex + 3] < 128 ){
        dst[index++] = 10;
        dst[index++] = 10;
        dst[index++] = 110;
        dst[index++] = 180;
      } else {
        dst[index++] = src[srcIndex++];
        dst[index++] = src[srcIndex++];
        dst[index++] = src[srcIndex++];
        dst[index++] = src[srcIndex++];
      }
    }
  }

  //ctx.clearRect(xx,yy,xw,yh);
  ctx.putImageData(dstData, xx + (w - h), yy + (h1 - h));
}

function getImageSource(A,obj,S){

  var imageSource = ( S.isHotspot ) ? obj.hot : obj;
  if( !imageSource )
    return imageSource;

  //console.log( "Draw at "+xx+","+yy+" ["+xw+" by "+yh+"]");

  // Prepare ctx2, the source ctx.
  var ctx2 = imageSource.ctx;
  var img = imageSource.img;

  //console.log( "From image "+img.width+" by "+img.height);
  if( !ctx2 || (obj.canvas.width !== img.width) || (obj.canvas.height !== img.height)){
    imageSource.canvas = document.createElement("canvas");
    imageSource.canvas.width = img.width;
    imageSource.canvas.height = img.height;
    imageSource.ctx = imageSource.canvas.getContext('2d', {willReadFrequently: true});
    ctx2 = imageSource.ctx;
  }
  if( !imageSource.srcData)
  {
    ctx2.clearRect( 0, 0, img.width, img.height);
    ctx2.drawImage(img, 0, 0, img.width, img.height);
    imageSource.srcData = ctx2.getImageData(0, 0, img.width, img.height);
  }
  //var dstData = ctx.createImageData( h*2,h*2) ;

  return imageSource;
}

function drawRoundRect(A, obj, d){
  var {x,y,xw,yh} = getBox( obj );
  // synonyms:
  var [w,h]=[xw,yh];

  var r = obj.cornerRadius || 1;

  var ctx = A.BackingCanvas.ctx;

  if( w < 0 ) return;
  if( h < 0 ) return;
  if( w < 2 * r ) r = w / 2;
  if( h < 2 * r ) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawAnEnd(A, obj, S){
  var ctx = A.BackingCanvas.ctx;

  var d=S.d||4;
  var style = S.style || "pointed";
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = "rgba(0,0,0,1.0)";
  ctx.lineWidth = 1;
  ctx.translate(S.x, S.y);
  ctx.rotate(S.theta);
  ctx.translate( d, 0 );
  if( style === "flat" ){
    drawFlatArrowHead(A,obj, S);
  } else {
    drawPointedArrowHead(A,obj,S);
  }
  ctx.restore();
}

function drawArrowHeadAndTail(A, obj, S){

  // The head at obj2
  var T= {};
  T.x = S[1].x;
  T.y = S[1].y;
  T.style = A.Styles.head;
  T.theta = S[1].theta;

  drawAnEnd(A, T, T );
  // The tail at obj1
  //drawAnEnd(ctx, S[0], "flat");//,A.Styles.head);
}

function drawArrowBody(A, obj, S){

  var ctx = A.BackingCanvas.ctx;
  ctx.beginPath();
  ctx.strokeStyle = "rgba(0,0,0,1.0)";
  ctx.lineWidth = 3;
  ctx.moveTo(S[0].x, S[0].y);
  ctx.lineTo(S[1].x, S[1].y);
  ctx.stroke();

  //drawSpotification( A, S, 20 );
}

function drawPointedArrowHead(A, obj, S){
  var ctx = A.BackingCanvas.ctx;

  ctx.moveTo(-11, -5);
  ctx.lineTo(0, 0);
  ctx.lineTo(-11, 5);
  ctx.lineTo(-7, 0);
  ctx.closePath();
  ctx.fill();
}

function drawFlatArrowHead(A, obj, S){
  var ctx = A.BackingCanvas.ctx;

  var k =7;
  var p = 3;
  var u = 1.5;
  var z = 15;
  ctx.moveTo(-z, u);
  ctx.lineTo(-p, u);
  ctx.lineTo(-p, k);
  ctx.lineTo( 0, k);
  ctx.lineTo( 0, -k);
  ctx.lineTo(-p, -k);
  ctx.lineTo(-p, -u);
  ctx.lineTo(-z, -u);
  ctx.closePath();
  ctx.fill();
}

function drawArrows(A,obj,d){
  var arrows = obj.content;
  if( !isDefined(arrows) ) return;
  if( !Array.isArray( arrows) ) return;
  if( (d.stage !== kStageArrowShaft ) && (d.stage !== kStageArrowHead ) )
    return;

  A.Styles.head         = obj.head;

  for( i = 0; i < arrows.length; i += 2 ){
    var obj1 = objectFromId(A, arrows[i]);
    var obj2 = objectFromId(A, arrows[i + 1]);
    if( !isDefined(obj1) || !isDefined(obj2) ) continue;
    if( !isDefined(obj1.pos) || !isDefined(obj2.pos) ) continue;
    var S = getTrimmedLineBetweenObjects(obj1, obj2);
    if( d.stage === kStageArrowShaft )
      drawArrowBody(A,S,S);
    if( d.stage === kStageArrowHead )
      drawArrowHeadAndTail(A,S,S);
  }
}

function drawLipid( A, obj, d ){
  var ctx = A.BackingCanvas.ctx;
  var P = d.getCoordinate( A, obj, d);
  var scale = obj.scale;

  var k=scale*12;
  var d=scale*2.1;


  ctx.save();
  ctx.translate(P.x, P.y);
  ctx.rotate(obj.theta);
  //ctx.translate( d, 0 );

  ctx.beginPath();
  ctx.lineWidth = 4*Math.abs(scale);
  ctx.strokeStyle = "rgb(38,74,140)";
  ctx.moveTo(0,0);
  ctx.lineTo(d,k);
  ctx.lineTo(-d,k+d);
  ctx.lineTo(0,k+k+d);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, 6*Math.abs(scale), 0, Math.PI * 2.0, true);
  var rgb = "rgba(150,40,40,1.0)";
  ctx.fillStyle = rgb;
  ctx.fill();
  ctx.restore();
}

function drawSplineSegment( A, obj, d ){
  var P0 = d.getCoordinate( A, obj, d );
  var P1 = d.getCoordinate( A, obj, d );
  var P2 = d.getCoordinate( A, obj, d );
  var P3 = d.getCoordinate( A, obj, d );
  if( !(P0 && P1 && P2 && P3) )
    return;

  var t0 = 0;
  var t1 = RR.catmulLength( P0, P1 );
  var d  = RR.catmulLength( P1, P2 );
  var t2 = t1+d;
  var t3 = t2+RR.catmulLength( P2, P3 );

  var i;
  var lipid = {};
  var d2 = {}
  d2.getCoordinate = RR.getPCoord;
  lipid.scale = obj.scale;
  var k = Math.ceil((d*d)/(18*Math.abs(lipid.scale))); // every 18 px.
  for( i=0;i<k;i++){
    var t = t1 + d * ( 2*i+1)/(2*k);
    lipid.P = RR.catEval( t, t0,t1,t2,t3,P0,P1,P2,P3 );
    var Pd = RR.catEval( t+0.0001, t0,t1,t2,t3,P0,P1,P2,P3 );

    lipid.theta = Math.atan2( Pd.y-lipid.P.y, Pd.x-lipid.P.x);
    drawLipid( A, lipid, d2 );
  }
}

function drawSpline(A,obj,d){
  var arrows = obj.content;
  if( !isDefined(arrows) ) return;
  if( !Array.isArray( arrows) ) return;
  if( (d.stage !== kStageFillAndText) )
    return;

  A.Styles.head         = obj.head;

  d.sequence = arrows;
  d.getCoordinate = RR.getNextSequenceCoord;

  var segment = {};
  segment.scale = obj.scale ||1;

  var i;
  for( i = 0; i < arrows.length-3; i ++ ){
    d.index = i;
    drawSplineSegment( A, segment, d);
  }
}

// Position is encoded in S, not in Obj.
function drawGlyph( A, obj, S){
  if( obj.glyph==="L" )
    return drawLeftL(A, obj, S);
  if( obj.glyph==="Mid" )
    return drawUpTriangle(A, obj, S);
  if( obj.glyph==="R" )
    return drawRightL(A, obj, S);
  if( obj.glyph==="Spot" )
    return drawSpot(A, obj, S);
  return drawStar(A, obj, S);
}

function drawDraggable(A, obj, d ){
  if(( d.stage !== kStageFillAndText ) && ( d.stage !== kStageHots ))
    return;

  var {x,y,xw,yh} = getBox( obj );
  var stage = d.stage;

  if( !isDefined( obj.offset )){
    obj.offset = {x:xw/2, y:yh/2 };
  };

  // Calculate new offset
  var dd = newPos( A, obj,d );
  // And always accept it.
  onLockInMove(A,obj,dd,d);

  x += obj.offset.x;
  y += obj.offset.y;

  var S = {};
  S.x = x ;
  S.y = y ;
  S.r = obj.r+4 || 12;//Math.min( xw*0.02, yh*0.02 );
  S.w = 12;
  S.h = 12;
  S.theta = 0.3;//Math.PI * 2 * (Math.min(20, A.Status.time) / 40);

  var ctx = A.BackingCanvas.ctx;
  var ctx2 = A.HotspotsCanvas.ctx;

  if( d.stage === kStageFillAndText ){
    ctx.fillStyle = obj.colour || "rgb(205,192,67)";
    ctx.strokeStyle = obj.borderColour || "rgb(120,97,46)";
    S.doStroke = true;
    S.ctx = ctx;
    drawGlyph(A, obj, S);
  }
  if( d.stage === kStageHots ){
    var c = A.nextAutoColour("");
    // an anonymous object (without an id) will now also work too
    A.addDown(["clickObject",obj.id || obj]);
    ctx2.fillStyle = c;
    S.doStroke = false;
    S.ctx = ctx2;
    drawGlyph(A, obj, S);
  }
}

function drawDraggable2(A, obj, d ){

  if(( d.stage !== kStageFillAndText ) && ( d.stage !== kStageHots ))
    return;

//  if( d.stage === kStageDragging ){
//    // Calculate new offset
//    if( A.dragObj !== obj )
//      return;
//    var dd = newPos( A, obj );
//    if( obj.dragFn )
//      obj.dragFn( A, obj, dd );
//    // And always accept it.
//    onLockInMove(A,obj,dd);
//    return;
//  }

  //if( d.stage !== kStageFillAndText )
  //  return;

//  var xw = obj.rect.x;
//  var yh = obj.rect.y;

  // Calculate new offset
  var dd = newPos( A, obj, d );
  // And always accept it.
  //if( !d.transform || (d.transform.size == 1) )
  onLockInMove(A,obj,dd, d);

  var {x,y} = getXy( obj );
  
  centre = new Vector2d( x, y);
  transformXy( centre, d );

  var S = {};
  S.x = centre.x ;
  S.y = centre.y ;
  S.r = obj.r+8 || 12;//Math.min( xw*0.02, yh*0.02 );
  S.w = 12;
  S.h = 12;
  S.theta = 0.3;//Math.PI * 2 * (Math.min(20, A.Status.time) / 40);

  var ctx = A.BackingCanvas.ctx;
  var ctx2 = A.HotspotsCanvas.ctx;

  if( d.stage === kStageFillAndText ){
//    setGhostedStyle(ctx,S,0.1);
//    S.ctx = ctx;
//    drawGlyph(A, obj, S);
  }
  if( d.stage === kStageHots ){
    //addHover( A, ["highlight", obj.id || obj] );    
    ctx2.fillStyle = obj.hotspotColour;
    S.doStroke = false;
    S.ctx = ctx2;
    drawGlyph(A, obj, S);
  }
}

function drawImage(A, obj, d){
  //console.log( "draw - "+obj.type);
  var {x,y,xw,yh} = getBox( obj );

  var ctx = A.BackingCanvas.ctx;
  var ctx2 = A.HotspotsCanvas.ctx;

  // if image or hotspot asked for and have not arrived
  // then just draw the background.
  if( obj.status !== "arrived" ){
    if( obj.src )
       drawRectangle(A, obj, d);
    return;
  }

  if( obj.hot && (obj.hot.status !== "arrived") ){
    drawRectangle(A, obj, d);
    return;
  }

  if( obj.spherical ){
    var S={};
    if( d.stage === kStageFillAndText ){
      S.isHotspot = false;
      drawSphere(A, obj, S);
    }
    if( d.stage === kStageHots ){
      S.isHotspot = true;
      drawSphere(A, obj, S);
    }
    return;
  }


  if( obj.warped ){
    var S={};
    if( d.stage === kStageFillAndText ){
      S.isHotspot = false;
      S.stage = kStageFillAndText;
      S.imageSource = getImageSource(A,obj,S);
      RR.drawTexture(A, obj, S);
    }
    return;
  }

  var from = {
    x: 0, y:0, xw: obj.img.width, yh: obj.img.height};

  if( obj.stretch === "yes" ){
    // rescaled to fit, aspect ratio ignored.
  } else if( obj.stretch === "no" ){
    // ToDo: crop or center.
  } else if( obj.hScaling || obj.vscaling ){
    hRuler = getObjectByName(A, obj.hScaling);
    if( hRuler ){
      //var mid = activeObject.content[1];
      //mid.offset.x = A.Status.move.x;
      var xStart = hRuler.atStart;
      var xEnd = hRuler.atEnd;
      var ddx = xEnd - xStart;
      var xScale = ddx / xw;
      from.x = xStart;
      from.xw = ddx;
      from.yh = xScale * yh;
    }
    vRuler = getObjectByName(A, obj.vScaling);
    if( vRuler ){
      //var mid = activeObject.content[1];
      //mid.offset.x = A.Status.move.x;
      var yStart = vRuler.atStart;
      var yEnd = vRuler.atEnd;
      var ddy = yEnd - yStart;
      var yScale = ddy / yh;
      from.y = yStart;
      from.yh = ddy;
      if( !hRuler)
        from.xw = yScale * xw;
    }

//    ctx.drawImage(obj.img, xStart, 0, ddx, mScale * yh, x, y, xw, yh);
 //   return;

  }
  else {
    // obj.stretch undefined or "preserve-aspect"
    // Logic to rescale image to fit, preserving
    // aspect ratio and placing centrally.
    if( obj.img.width * yh < obj.img.height * xw ){
      // shift image left to centre.
      x += xw * 0.5;
      // rescale x
      xw = obj.img.width * yh / obj.img.height;
      // shift image mid back to mid
      x -= xw * 0.5;
    } else {
      // shift image top to y centre line
      y += yh * 0.5;
      // rescale y
      yh = obj.img.height * xw / obj.img.width;
      // shift image mid back to y centre line
      y -= yh * 0.5;
    }
  }
  if( isDefined( obj.opacity) )
    ctx.globalAlpha = obj.opacity;
  if( d.stage === kStageFillAndText )
    ctx.drawImage(obj.img, from.x, from.y, from.xw, from.yh,
      x, y, xw, yh);
  ctx.globalAlpha = 1.0;


  if( d.stage === kStageHots )
    if( obj.hot && obj.hot.status === "arrived" )
      ctx2.drawImage(obj.hot.img, x, y, xw, yh);
    else if( obj.hotspotColour ){
      ctx2.beginPath();
      ctx2.rect(x, y, xw, yh);
      ctx2.fillStyle = obj.hotspotColour;
      ctx2.fill();
    }
}

/**
 * Used in chart boxes.
 * Draws markings on top of a waveform.
 * @param A
 * @param obj
 * @param d
 */
function drawPlotLegends( A, obj, d ){
  if(d.stage!==kStageFillAndText)
    return;

  var {x,y,xw,yh} = getBox( obj );
  var indent = 40;
  var ctx = A.BackingCanvas.ctx;

  ctx.beginPath();
  // Draw baseline for audio
  ctx.moveTo( x+indent, y + yh/2 );
  ctx.lineTo( x+ xw, y+yh/2 );
  // Draw vertical line for scale
  ctx.moveTo( x+indent, y+yh );
  ctx.lineTo( x+indent, y);
  ctx.stroke();

  var i;

  ctx.font = "11px Arial";
  ctx.textAlign = "right";
  ctx.lineWidth=1.7;
  ctx.beginPath();
  // There are 5 ruler markings.
  // Each has a number and a 3-segment line.
  // The staggered line allows the +1 and -1 to be inside the scale
  // box.
  for( i=-1; i<= 1; i+=0.5){
    var dy = (Math.abs(i)>0.6) ? i* 8 : 0;
    var ady = Math.abs(dy)*0.4;
    var yy = y + yh/2-yh*0.5*i;
    ctx.fillText(i.toFixed(1), x + 30-ady, 5+yy + dy);
    ctx.moveTo( x+indent-8-ady, yy+dy );
    ctx.lineTo( x+indent-4, yy+dy );
    ctx.lineTo( x+indent, yy );
    ctx.lineTo( x+indent+6, yy );
  }
  ctx.stroke();
}


function drawParliament(A,obj,d){
  if(d.stage!==kStageFillAndText)
    return;
  var {x,y,xw,yh} = getBox( obj );

  var i;
  var phi = 0.618 * Math.PI * 2;
  var theta;
  var r;
  var start = 40;
  var n = 220;
  n+=start;
  var S = {};
  S.r = 5;
  var angle;
  var ctx = A.BackingCanvas.ctx;
  var overhangAngle = 20;
  for( i=start;i<n;i++ ){
    r = 0.4*yh*Math.sqrt(i/n);
    theta = i * phi;
    S.x = -r * Math.cos(theta)+x+ xw/2;
    S.y = -r * Math.sin(theta)+y+ yh/2;
    angle = (180 * theta / Math.PI + overhangAngle)%360;

    ctx.fillStyle = (angle > (180+2*overhangAngle)) ? "#993333" : "#3333AA";
    drawSpot(A, obj, S)
  }
}

function drawSankey(A,obj,d){
  drawRectangle(A,obj,d);
}

function drawRectangle(A, obj, d){
  //console.log( "draw - "+obj.type);
  var {x,y,xw,yh} = getBox( obj );
  var stage = d.stage;

  // -- Extra twiddles for chooser
  // The unchosen tabs are drawn early, so that they get overlapped.
  if( obj.drawEarly && (stage<9) ){
    stage += 2;
  }
  // Text position unchanged even if we expand the rectangle.
  xwText = xw;
  yhText = yh;

  // All the chooser rectangles are expanded, so that they will overlap.
  if( obj.drawExtra ){
    // The direction to expand in is currently a hack, based on size.
    // fixme drawExtra should tell us which direction to expand in.
    if( yh < 50 ){
      yh+=10;
    }
    else {
      xw+=10;
    }
  }

  var objAdjusted = {};
  objAdjusted.pos = {x:x,y:y};
  objAdjusted.rect = {x:xw,y:yh};
  objAdjusted.cornerRadius = obj.cornerRadius;

  // A chosen main rectangle has this style, to meld with the chooser rectangle.
  if( obj.style === "chosen" ){
    obj.colour       = "rgb(255,250,235)";
    obj.borderColour      = "rgb(145,125,0)";
    obj.cornerRadius = 8;
  }
  else{
    mayUpdateObjectStyle(A, obj);
  }

  // -- End of extra twiddles for chooser.

  var ctx = A.BackingCanvas.ctx;

  if( (stage===kStageOutline) || (stage===kStageFillAndText) ){
    ctx.save();
    ctx.beginPath();

    applyObjectSettingsToContext(ctx, obj);

    if( obj.id &&  obj.id === A.Highlight )
      ctx.fillStyle = "rgb(167,203,250)";
    if( obj.cornerRadius )
      drawRoundRect(A, objAdjusted, objAdjusted);
    else
      ctx.rect(x, y, xw, yh);

    if( stage===kStageOutline){
      ctx.stroke();
    }

    if( stage===kStageFillAndText){
      var frac = 0.14;
      if( !obj.chartBox ){
        ctx.fill();
        frac = 0.5;

      }
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(0,0,0,1.0)";
      ctx.fillText(obj.value, x + xwText *frac, y + yhText * frac+ 6);
    }

    if( obj.chartBox )
      drawPlotLegends(A,obj,d);
    ctx.restore();
  }

  if( (stage===kStageHots) && obj.hotspotColour ){
    var ctx2 = A.HotspotsCanvas.ctx;
    ctx2.beginPath();
    ctx2.rect(x, y, xw, yh);
    ctx2.fillStyle = obj.hotspotColour;
    ctx2.fill();
  }
}

function drawTextInBox(A, obj, d){
  if( d.stage !== kStageFillAndText )
    return;

  //console.log( "draw - "+obj.type);
  var {x,y,xw,yh} = getBox( obj );

  var ctx = A.BackingCanvas.ctx;

  ctx.save();
  ctx.beginPath();

  applyObjectSettingsToContext(ctx, obj);
  if( obj.cornerRadius )
    drawRoundRect(A, obj, obj);
  else
    ctx.rect(x, y, xw, yh);
  ctx.fill();
  ctx.stroke();

  //ctx.textAlign = "left";
  ctx.fillStyle = "rgba(0,0,0,1.0)";

  var textWidth  = ctx.measureText( obj.value ).width;
  // Approximate height (as M is 'square' );
  // Advanced metrics not supported in firefox or ie or edge.
  var textHeight = ctx.measureText( "M").width;

  var xPercent = isDefined( obj.xPos ) ? obj.xPos : 0.50;
  var yPercent = isDefined( obj.yPos ) ? obj.yPos : 0.50;
  ctx.fillText(obj.value,
    x + (xw-textWidth) * xPercent,
    y + (yh-textHeight) * yPercent + textHeight);
  ctx.restore();
  if( obj.hotspotColour ){
    var ctx2 = A.HotspotsCanvas.ctx;
    ctx2.beginPath();
    ctx2.rect(x, y, xw, yh);
    ctx2.fillStyle = obj.hotspotColour;
    ctx2.fill();
  }
}

function drawTile(A,obj,d){
  drawRectangle( A, obj, d );
  increaseMargin( A, obj, 10);
  drawImage( A,obj,d);
  increaseMargin( A, obj, -10);
}

function drawCircle(A, obj, d){
  //console.log( "draw - "+obj.type);
  var {x,y,xw,yh} = getBox( obj );

  var r = Math.min(xw, yh) / 2;
  if( r < 0 )
    return;

  var ctx = A.BackingCanvas.ctx;
  ctx.lineWidth = 3;
  ctx.font = "16px Arial";
  ctx.globalCompositeOperation = 'source-over';


  if( (d.stage===kStageOutline) || (d.stage===kStageFillAndText) ){
    ctx.save();
    ctx.beginPath();
    applyObjectSettingsToContext(ctx, obj);

    ctx.arc(x + xw / 2, y + yh / 2, r, 0, Math.PI * 2.0, true);
    if( d.stage===kStageOutline){
      ctx.stroke();
    }

    if( d.stage===kStageFillAndText){
      ctx.fill();
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(0,0,0,1.0)";
      ctx.fillText(obj.value, x + xw / 2, y + yh / 2 + 6);
    }
    ctx.restore();
  }
  if( (d.stage===kStageHots ) && obj.hotspotColour ){
    var ctx2 = A.HotspotsCanvas.ctx;
    ctx2.beginPath();
    ctx2.arc(x + xw / 2, y + yh / 2, r, 0, Math.PI * 2.0, true);
    ctx2.fillStyle = obj.hotspotColour;
    ctx2.fill();
  }
}


// 8 rigid transformations
function innerTransform( A, obj, S ){
  var {x,y,xw,yh} = getBox( obj );

  var ctx = getCtx(A,obj,S);

  var op = obj.transOp || 0;

  switch( op ){

    // cases 0 to 4 all have the same aspect ratio as no transform.
    case 0:
    default:
      // Identity transform.
      break;
    case 1:
      // Rotate 180
      ctx.transform( -1, 0, 0, -1, 2*x+xw, 2*y+yh );
      break;
    case 2:
      // Swap left-right
      ctx.transform( -1, 0, 0,  1, 2*x+xw, 0 );
      break;
    case 3:
      // Swap up and down
      ctx.transform( 1, 0, 0, -1, 0, 2*y+yh );
      break;

    // cases 4 to 7 all have the width-height swapped aspect ratio.
    case 4:
      // reflect in major diagonal
      ctx.transform( 0, 1, 1, 0, 0, 0 );
      break;
    case 5:
      // reflect in minor diagonal
      ctx.transform( 0, -1,-1, 0, 2*x+xw, 2*y+yh );
      break;
    case 6:
      //rotate 90 degrees clockwise
      ctx.transform( 0, 1, -1, 0,2*x+xw, 0 );
      break;
    case 7:
      // rotate 90 degrees counter-clockwise
      ctx.transform( 0, -1, 1, 0, 0, 2*y+yh );
      break;
  }
  A.transOp = op;
}

function drawTransform( A, obj, d ){
  var ctx = A.BackingCanvas.ctx;
  var ctx2 = A.HotspotsCanvas.ctx;
  ctx.save();
  ctx2.save();


  var S = {};
  // Setting up transform state of two contexts
  // which store their own transform state.
  S.isHotspot = false;
  innerTransform( A, obj, S );
  S.isHotspot = true;
  innerTransform( A, obj, S );
  drawContainer( A, obj, d );

  // restore transform states.
  ctx.restore();
  ctx2.restore();
}


/**
 * Computes min and max in each column, and then infills the area.
 * @param ctx
 * @param obj
 * @param ruler
 */
function fillMinMaxPlot(A, obj, ruler){
  var ctx = A.BackingCanvas.ctx;
  var x0 = obj.pos.x;
  var y0 = obj.pos.y;
  var xw = obj.rect.x;
  var yh = obj.rect.y;

  var pixelsPerItem = xw/(ruler.atEnd-ruler.atStart);


  var maxy = [];
  var miny = [];
  var xStart = ruler.atStart * pixelsPerItem;
  var bucket;
  var i;
  for( i = ruler.atStart; i < ruler.atEnd; i++ ){
    var y1 = scaledYofItem(i, obj, ruler);
    bucket = Math.floor(i * pixelsPerItem - xStart);
    if( isDefined(maxy[bucket]) ){
      maxy[bucket] = Math.max(y1, maxy[bucket]);
      miny[bucket] = Math.min(y1, miny[bucket]);
    } else {
      maxy[bucket] = y1;
      miny[bucket] = y1;
    }
  }
//  for( i = 0; i < bucket; i++ ){
//    maxy[i] = Math.max(miny[i + 1], maxy[i]);
//    miny[i] = Math.min(maxy[i + 1], miny[i]);
//  }
  ctx.fillStyle = "rgb(20,20,200)";
  ctx.beginPath();
  ctx.moveTo(x0, maxy[0]);
  for( i = 1; i <= bucket; i++ ){
    if( isDefined( maxy[i] ) )
      ctx.lineTo(x0 + i, maxy[i] + 1.5);
  }
  for( i = bucket; i >= 0; i-- ){
    if( isDefined( miny[i] ) )
      ctx.lineTo(x0 + i, miny[i] - 1.5);
  }
  ctx.closePath();
  ctx.fill();
}

// Draw in terms of the pixels.  There are 'fewer' of these than items.
function drawLineMinMaxPlot(A, obj, ruler){
  var ctx = A.BackingCanvas.ctx;
  var {x,y,xw,yh} = getBox( obj );

  ctx.strokeStyle = "rgb(20,20,200)";
  ctx.lineWidth = 1;
  var i;
  var y1 = scaledYofItem(rulerIndexFromX(x, ruler), obj);
  for( i = 1; i < xw; i++ ){
    var y2 = scaledYofItem(rulerIndexFromX(x+i, ruler), obj);
    ctx.beginPath();
    ctx.moveTo(x + i, Math.min(y1, y2) - 0.5);
    ctx.lineTo(x + i, Math.max(y1, y2) + 0.5);
    ctx.stroke();
    y1 = y2;
  }
}


// Draw in terms of the item numbers.  There are 'fewer' of these than pixels.
function drawLinePlot(A, obj, ruler){

  var ctx = A.BackingCanvas.ctx;


  var x0 = obj.pos.x;
  var y0 = obj.pos.y;
  var xw = obj.rect.x;
  var yh = obj.rect.y;

  var pixelsPerItem = xw / (ruler.atEnd - ruler.atStart);

  ctx.strokeStyle = obj.colour || "rgb(20,20,200)";
  // Line gets thicker as we zoom in.
  ctx.lineWidth = constrain( 1, pixelsPerItem*0.2, 4 );

//  var xStart = Math.floor(ruler.atStart) * pixelsPerItem;
  var xStart = ruler.atStart * pixelsPerItem;
  var bucket;
  var i;
  var y1 = scaledYofItem(Math.floor(ruler.atStart), obj);
  //var dx = (ruler.atStart -Math.floor(ruler.atStart))
  ctx.beginPath();
  ctx.moveTo(x0, y1);
  var delta = 0.1;
  if( pixelsPerItem <1 )
    delta = 0.2;

  var xx;
  var y1;
  var extra = 10;
  for( i = Math.floor(ruler.atStart/delta)*delta; i < Math.floor(2+ruler.atEnd/delta)*delta; i+=delta ){
    xx = (i * pixelsPerItem - xStart)+x0;
    y1 = scaledYofItem(i, obj);
    ctx.lineTo(xx, y1);
  }
  ctx.stroke();

// Commented out code draws spots on the waveform.


  var S = {};
  S.doStroke = false;
  S.r = 2;
  if( pixelsPerItem > 30 ){
    delta = 0.1;
    ctx.fillStyle="rgba(0,0,0,"+constrain( 0, (pixelsPerItem-30) / 150, 1 )+")";
    for( i = Math.floor(ruler.atStart/delta)*delta; i < Math.floor(2+ ruler.atEnd/delta)*delta; i+=delta ){
      xx = (i * pixelsPerItem - xStart)+x0;
      y1 = scaledYofItem(i, obj);
      S.x = xx;
      S.y = y1;
      drawSpot( A, S, S);
    }
  }

}

function drawGraph( A, obj, d ){
  if( d.stage !== kStageFillAndText  )
    return;

  //console.log( "draw - "+obj.type);
  var ruler = objectFromId(A, obj.scaling);

  //var pixelsPerItem = xw/(ruler.atEnd-ruler.atStart);
  drawLinePlot(A, obj, ruler);

/*
  if( pixelsPerItem > 5.5 ){
    drawLineMinMaxPlot(A, obj, ruler);
  }
  else {
    drawLinePlot( A, obj, ruler );
    //fillMinMaxPlot(A, obj, ruler);
  }
*/
}

// finds field value to first ; or </pre>
function fieldValue(field, line){
  var value;
  var sepIndex;
  var sep = ";";
  // Systemic HACK.  We are parsing lines using regex
  // and need to escape the ';'.  Instead we decree that
  // the DATA field is long, and never ; separated.
  // Field based definition is ill defined.
  // disable splitting for 'DATA'
  if( field == 'DATA' )
      sep = "<<<bogus separator>>>";
  if( field.charAt( 0 ) === field.charAt(0).toUpperCase() ){
    value = line.split(field + "=")[1] || "";
    value = value.split("</pre>")[0];
    sepIndex = value.indexOf(sep);
  }
  else {
    sep = '\n';
    value = line.split(field + ":")[1] || "";
    value = value.split("</pre>")[0];
    sepIndex = value.indexOf(sep);
  }

  var lineEndIndex = value.indexOf('\n');

  // command ends at </pre> or at ;.
  // Only use a ; as the end, if it is on the same line.
  if( (lineEndIndex === -1 ) || ( sepIndex <= lineEndIndex))
    value = value.split(sep)[0];

  return value;
}

function setClickAction(A, value){
  var h = A.Hotspots.Current.Click || [];
  var i;
  for( i = 0; i < value.length; i++ ){
    h.push(value[i]);
  }
  A.Hotspots.Current.Click = h;
}

function setZoomAction(A, value){
  var h = A.Hotspots.Current.Zoom || [];
  var i;
  for( i = 0; i < value.length; i++ ){
    h.push(value[i]);
  }
  A.Hotspots.Current.Zoom = h;
}

function setClickGoto(A, location){
  // ignore after '#'
  var where = (location + "#").split("#")[0];
  var num = location.split("#")[1]||"0";
  num = Number( num );
  setClickAction( A,[ "Goto", where, num+1 ] );
}


function parseFilename( location ){
  var where = (location + "#").split("#")[0];
  var num = location.split("#")[1] || "0";
  num = Number(num)+1;
  return { 'name':where, 'num':num};
}

function createProg( A, obj, data ){
  if( !obj.code )
    return;
  obeyCode( A, obj.code );
}

// >>>>>>>>>>>>>>>>  Layout and sizing.

function layoutMargined(A, obj, d){
  //console.log( "layout - "+obj.type);
  increaseMargin( A, obj, d.margins );
}

function layoutUnmargined(A, obj, d){
  //console.log( "layout - "+obj.type);
  var m = 0;
  var {x,y,xw,yh} = getBox( obj );
  setCellLayout(A, x + m, y + m, xw - 2 * m, yh - 2 * m, obj, d);
}

function layoutTransform( A, obj, d ){
  var op = obj.transOp || 0;
  if( op <4 )
    return layoutContainer( A, obj, d );

  var {x,y,xw,yh} = getBox( obj );

  obj.pos = {x:y,y:x};
  obj.rect = {x:yh,y:xw};
  layoutContainer( A, obj, d );
  obj.pos = {x:x,y:y};
  obj.rect = {x:xw,y:yh};

}

function layoutContainer( A, obj, d){
  //console.log( "layout - "+obj.type);
  var n = obj.content.length;
  var {x,y,xw,yh} = getBox( obj );

  var k = obj.sizing.cumulativeWants;
  //console.log( "n: "+n+", k:"+k);
  var wantsSoFar = 0.0;
  for( var i = 0; i < n; i++ ){
    var want = obj.content[i].sizing.wants;
    switch( obj.type ){
      case "HStack":
        setCellLayout(A, x + (wantsSoFar / k) * xw, y,
          xw * (want / k), yh, obj.content[i]);
        break;
      case "VStack":
        setCellLayout(A, x, y + (wantsSoFar / k) * yh,
          xw,yh * (want / k), obj.content[i]);
        break;
      default:
      case "Overlay":
        setCellLayout(A, x, y, xw, yh, obj.content[i]);
        break;
    }
    layoutCells( A, obj.content[i], d );
    wantsSoFar += want;
  }
}

function layoutNowt( A, obj, data ){
}

function sizeCell(A, obj, d){
  //console.log( "size cell - "+obj.type);
  obj.sizing = {};
  obj.sizing.min = 0;
  obj.sizing.wants = obj.sizeAs || 1.0;
  obj.sizing.cumulativeWants = 0.0;
}

function sizeContainer(A, obj, d){
  //console.log( "size container - "+obj.type);
  var n = 0;
  if( obj.content && Array.isArray(obj.content) ) n = obj.content.length;
  sizeCell(A, obj, d);
  for( var i = 0; i < n; i++ ){
    var o2 = obj.content[i];
    sizeCells(A, o2, d);
    obj.sizing.min += o2.sizing.min;
    obj.sizing.cumulativeWants += o2.sizing.wants;
  }
}

function setCellLayout(A, x, y, xw, yh, obj){
  obj.pos = {x:x,y:y};
  obj.rect = {x:xw,y:yh};
  //console.log( obj.layout );
}

function increaseMargin(A, obj, m){
  //console.log( "layout - "+obj.type);
  var {x,y,xw,yh} = getBox( obj );
  setCellLayout(A, x + m, y + m, xw - 2 * m, yh - 2 * m, obj);
}

function sizeNowt( A, obj, data ){
  sizeCell( A, obj, data );
  obj.sizing.wants = 0;
}

function mayRegisterClickAction( A, obj ){
  // setClickAction uses the 'Hotspots.Current.Click' object.
  if( obj.hasOwnProperty( "clickDo" )){
    if( !obj.hotspotColour ){
      var c = A.nextAutoColour("");
      obj.hotspotColour = c;
    }
    setClickAction( A, obj.clickDo );
  }
  if( obj.hasOwnProperty( "zoomDo" )){
    if( !obj.hotspotColour ){
      var c = A.nextAutoColour("");
      obj.hotspotColour = c;
    }
    setZoomAction( A, obj.zoomDo );
  }
}

function mayRequestImage(A, parent, obj){

  if( !obj ){
    return;
  }
  // note obj.src is user facing parameter, whereas
  // obj.img.src is part of the dom
  if( !obj.src )
    return;
  if( parent.type !== "Image"  && 
    parent.type !== "Tile" &&
    parent.type !== "Quad" ){
    return;
  }

  var file = urlOfFilename(obj.src);
  if( obj.previous_image === file )
    return;

  obj.status = "asked";
  obj.file = file;

  obj.img = document.createElement("img");
  obj.img.onload = (function(){
    var obj1 = obj;
    return function(){
      obj1.status = "arrived";
      console.log(obj1.file + " arrived");
      A.newEvents = true;
      if( A.Status.isAppReady ){
        drawCells(A, A.RootObject, {});
      }
    }
  })();
  obj.img.onerror = (function(){
    var obj1 = obj;
    return function(){
      obj1.status = "failed";
//      alert("Failed to load image " + obj1.file);
    }
  })();
  console.log("Requesting... " + obj.file );
  obj.img.crossOrigin = "anonymous";
  obj.previous_image = obj.file;
  obj.img.src = obj.file;
}

function mayRequestHotImage(A, obj){
  mayRequestImage(A, obj, obj.hot);
}

function mayRequestDisplayableImage(A, obj){
  mayRequestImage(A, obj, obj);
}

function createCell(A, obj, d){
  var detail;
  var c;
  if( obj.hasOwnProperty('autolink') )
    A.Styles.autolink = obj.autolink;
  // nextAutoColour sets up the 'Hotspots.Current.Click' object.
  if( obj.hasOwnProperty('card') && obj.card )
  {
    detail = sanitiseHtml(obj.card);
  }
  else
    detail = null;

  // dummy hotspotcolours may have been assigned...
  if( detail || obj.hotspotColour )
  {
    c = A.nextAutoColour(detail);
    obj.hotspotColour = c;
  }

  mayRegisterClickAction( A, obj);

  if( obj.hasOwnProperty( 'choice')){
    doChoose(A, obj, obj.choice);
  }
}

function createImage( A, obj, d ){
  createCell( A, obj );
  mayRequestDisplayableImage(A, obj);
  mayRequestHotImage(A, obj);

  // Image zone colours only used for cards.
  if( obj.hasOwnProperty('byHandColours') ){
    var i;
    var n = obj.byHandColours.length;
    for(i=0;i<n;i++){
      var zone = obj.byHandColours[i];
      if( zone.hotspotColour && zone.card ){
        c = zone.hotspotColour;
        var colourString = '[' + c[0] + ',' + c[1] + ',' + c[2] + ',' + c[3] + ']';
        //console.log("next-color:" + c + "n:" + n);
        detail = sanitiseHtml(zone.card);
        A.addHotspot(colourString);
        A.addInfoCardForCurrentHotspot(detail);
      }
      mayRegisterClickAction( A, zone );
    }
  }
}

function createTile( A, obj, d ){
  createImage(A, obj, d);
  addHover( A, ["highlight", obj.id] );
}

function createContainer( A, obj, d){
//console.log( "create container - "+obj.type);
  var n = 0;
  if( obj.content && Array.isArray(obj.content) ) n = obj.content.length;
  createCell(A, obj, d);
  for( var i = 0; i < n; i++ ){
    var o2 = obj.content[i];
    createCells(A, o2, d);
  }
}

function createCells(A, obj, data){
  visit(createThing, A, obj, data);
}

function sizeCells(A, obj, data){
  visit(sizeThing, A, obj, data);
  //console.log( obj.sizing);
}

function layoutCells(A, obj, data){
  if( obj.hasOwnProperty('margins') )
    data.margins = obj.margins;
  visit(layoutThing, A, obj, data);
}

function drawCells(A, obj, data){
  visit(drawThing, A, obj, data);
}

createThing = {};
sizeThing = {};
layoutThing = {};
drawThing = {};
writeThing = {};
readThing = {};

/**
 *
 * @param how - has a function for each type of object
 * @param A
 * @param what - is an object to visit
 * @param data -  carries extra information into the function
 */
function visit(how, A, what, data){
  if( how[what.type] ){
    how[what.type].call(how, A, what, data);
  } else how.default.call(how, A, what, data);
}

function registerMethod( forWhat, creating, sizing, layout, draw )
{
  if( creating )
    createThing[ forWhat ] = creating;
  if( sizing )
    sizeThing[ forWhat ] = sizing;
  if( layout )
    layoutThing[ forWhat ] = layout;
  if( draw )
    drawThing[ forWhat ] = draw;
}

function registerReadWrite( forWhat, read, write){
  if( read )
    readThing[ forWhat ] = read;
  if( write )
    writeThing[ forWhat ] = write;
}


// >>>>>>>>>>>>>>>>>> Data requests

/**
 * Used to execute a program stored as text within
 * the scene graph.
 *
 * Considerable overlap with function obeyLines
 */
function obeyCode(A,code){
  var activeObject = {};
  var name;
  var section;
  var S;

  for(i=0;i<code.length;){
    var command = code[i++];
    if( command === "selectCredits" ){
    }
    else if( command === "setCaption" ){
      A.setCaption( code[i++], A.page, A.fromWiki);
    }
    else if( command === "setCreditsTip" ){
      // Reserve a colour for the info button.
      A.addInfoHotspot();
      A.addInfoCardForCurrentHotspot( code[i++] );
    }
    // This is just selecting the item, to do more with it.
    else if( command === "chooseItem" ){
      activeObject = getObjectByName(A, code[i++]);
    }
    else if( command === "alert" ){
      alert("alert in action");
    }

    else if( command === "clickObject" ){
      activeObject = getObjectByName(A, code[i++]);
      var onClick = activeObject.onClick || onDraggableClicked;
      onClick( A, activeObject );
    }
    else if( command === "setTip" ){
      activeObject.card = code[i++];
    }
    else if( command === "setBright" ){
      A.BrightObjects = code[i++];
    }
    else if( command === "setClickAsCentre" ){
      activeObject = getObjectByName(A, code[i++]);
      setCentreDraggerX(activeObject, A.Status.move.x);
      setCentreDraggerY(activeObject, A.Status.move.y);

      drawDiagramAgain(A);
    }
    else if( command === "dump" ){
      console.log("flow-data:" + JSON.stringify(A.RootObject.content[2].content, null, 2));
      //console.log( A.RootObject.content[2].content );
    }
    else if( command === "zoom" ){
      activeObject = getObjectByName(A, code[i++]);
      zoom(A, activeObject, A.zoom);
      drawDiagramAgain(A);
    }
    else if( command === "highlight" ){
      A.Highlight = code[i++];
      //drawDiagramAgain( A );
    }
    else if( command === "loadSpec" ){
      var spec = code[i++];
      //const bright = code[i++];
      var prog = code.slice( i );
      var handler = (function( pp ){
        return function( AA, data, ss ){
          console.log( 'loadSpec handleNewData');
          handleNewData(AA, data, ss);
          obeyCode( AA, pp );
          //AA.BrightObjects = bright;
        }
      }(prog));
      requestSpec(A, spec,A.fromWiki, 1, handler );
      return;
    }
    else if( command === "loadImage" ){
      activeObject.src = code[i++];
      mayRequestDisplayableImage(A, activeObject);
    }
    else if( command === "Spec" ){
      S = parseFilename( code[i++]);
      requestSpec( A, S.name, A.fromWiki, S.num);
    }
    else if( command === "DoSpec" ){
      S = parseFilename( code[i++]);
      requestSpec( A, S.name, A.fromWiki, S.num, addNewInfoCards);
    }
    else if( command === "Image" ) {
      name = code[i++];
      setNewImage( A, name);
    }
    else if( command === "Goto" ){
      S = parseFilename( code[i++]);
      window.location.href = S.name;
      return;
    }
  }
}

/**
 * These lines are all about constructing the object.
 */
function obeyMediaWikiLines(A, lines){
  for( var i = 0; i < lines.length; i++ ){
    var item = lines[i];
    var data;
    var obj;
    var n;
    var c;
    var root;

    var detail = item.split("TIP=</pre>")[1] || item.split("card=</pre>")[1];
    var file = item.split("[[File:")[1] || "";
    file = file.split("]]")[0] || "";

    var spec = item.split("[[")[1] || "";
    spec = spec.split("]]")[0] || spec;
    spec = spec.split("|")[0] || spec;

    // Specify a table of colours which will be used for hotspots.
    if( item.startsWith("ZONECOLOURS=") ){
      obj = A.RootObject.lastImage;
      if( !obj ){
        continue;
      }

      data = fieldValue("COLOURS", item);
      console.log("colour-data:" + data);
      var colours = JSON.parse(data);
      console.log(colours);
      obj.byHandColours = obj.byHandColours || [];
      A.Hotspots.byHandColourIx = obj.byHandColours.length;
      obj.byHandColours = obj.byHandColours.concat(colours);
      A.Hotspots.byHandColours = obj.byHandColours;
    }

    // Add a TIP to the next zone (from zones specified earlier via ZONECOLOURS)
    if( item.startsWith("NEXTZONE:") ){
      if( A.Hotspots.byHandColours && detail ){
        var zone = A.Hotspots.byHandColours[A.Hotspots.byHandColourIx];
        if( isDefined(zone) ){
          if( !isDefined(zone.hotspotColour) ){
            zone = { 'hotspotColour': zone };
          }
          zone.card = detail;
          A.Hotspots.byHandColours[A.Hotspots.byHandColourIx++] = zone;
          obj = zone;
        }
      }
    }

    // Add a TIP to the next object.
    // Can also modify other attributes such as colours and edge rounding.
    // Can also turn an object into a chooser.
    if( item.startsWith("NEXTOBJECT:") ){
      if( !isDefined(A.RootObject.objectList) ){
        continue;
      }
      n = A.RootObject.itemIndex++;
      obj = A.RootObject.objectList[n];
      if( !isDefined(obj) ){
        continue;
      }

      data = fieldValue("colour", item);
      if( data ){
        obj.colour = data;
      }
      data = fieldValue("borderColour", item);
      if( data ){
        obj.borderColour = data;
      }
      data = fieldValue("cornerRadius", item);
      if( data && (!isNaN(Number(data))) ){
        obj.cornerRadius = Number(data);
      }
      if( detail ){
        obj.card = detail;
      }
    }

    // ----------- Filename follows these -----------------------------
    // Set object click to load a spec
    if( item.startsWith("CLICK LOAD SPEC") ){
      file = ("X" + spec).split("Toolbox/")[1] || fieldValue("SPEC", item);
      console.log("click-load-spec:" + file);
      obj.clickDo = ["Spec", file];
    }

    // Set object click to execute a section of a spec (without erasing
    // what's already there)
    if( item.startsWith("CLICK DO") ){
      file = ("X" + spec).split("Toolbox/")[1] || fieldValue("SPEC", item);
      console.log("click-do-spec:" + file);
      obj.clickDo = ["DoSpec", file];
    }

    // Set object click to goto a hyperlink
    if( item.startsWith("CLICK GOTO") ){
      file = item.split("GOTO=</pre>")[1] || "";
      // extract a wiki hyperlink.
      file = ("X" + file).split("[")[1] || "";
      file = file.split(" ")[0] || file.split("]")[0] || "";

      console.log("click-goto:" + file);
      obj.clickDo = ["Goto", file];
    }
    // ------------ End of group requiring a filename. ----------------

    // ADD in some object into the scene graph.
    // Can add at a particular named place using 'NAME='
    if( item.startsWith("ADD:") ){
      root = getObjectByName(A, fieldValue("NAME", item));
      root = root || A.RootObject;
      root.type = "VStack";
      root.content = root.content || [];
      data = fieldValue("DATA", item);
      var container = [];
      var json;
      try{ 
        json = JSON.parse(data);
      } catch(e) { 
        alert("JSON: " + e.message + "\n"+ data);
        window.Message.innerHTML = "<textarea>"+data+"</textarea>";
        return;
      }
      //console.log("flow-data:" + JSON.stringify(json, null, 2));

      //console.log(obj);
      if( !Array.isArray(json) ){
        container.push(json);
      } else {
        container = json;
        doTopLevelInstructions( A,json[0]);
      }
      // The top level thing may resize the area.
      for( var kk = 0; kk < container.length; kk++ ){
        convertJsonStructure(A, "", container[kk]);
        root.content.push(container[kk]);
      }
      //console.log(obj);
    }

    // Add an image into the scene graph.
    // This is required, if you want the image to actually load.
    if( item.startsWith("IMAGE") ){
      console.log("image:" + file);
      obj = getObjectByName(A, fieldValue("NAME", item));
      if( !obj ){
        continue;
      }
      A.RootObject.lastImage = obj;
      if( obj.src !== file ){
        obj.src = file;
      } else {
        console.log("Already set");
      }
    }

    // Used after IMAGE to add hotspot image for that image.
    if( item.startsWith("HOTSPOTS") ){
      console.log("hotspots:" + file);
      obj = A.RootObject.lastImage;
      if( !obj ){
        continue;
      }
      if( !obj.hot ){
        obj.hot = {};
      }
      if( obj.hot.src !== file ){
        obj.hot.src = file;
      } else {
        console.log("Already set");
      }
    }

    // DO some immediate command.  Currently it's confined to changing
    // the choice in a chooser.
    if( item.startsWith("DO") ){
      obj = getObjectByName(A, fieldValue("CHOOSER_NAME", item));
      if( obj ){
        data = fieldValue("VALUE", item);
        if( data ){
          data = JSON.parse(data);
          obj.choice = data;
        }
      }
      var bright = fieldValue("BRIGHT_OBJECTS", item);
      if( bright ){
        A.BrightObject = bright;
      }
    }

    // Experimental (and incomplete) code to request a subdiagram to add
    // in at a specified place.
    if( item.startsWith("SUBOBJECT") ){
      console.log("subobject:" + file);
      obj = getObjectByName(A, fieldValue("NAME", item));
      if( !obj ){
        continue;
      }

      obj.status = "asked";
      obj.file = file;
      obj.content = [];
      obj.onload = (function(){
        var obj1 = obj;
        return function(){
          obj1.status = "arrived";
          console.log(obj1.file + " subdiagram arrived");
          if( A.Status.isAppReady ){
            setupAndDrawDiagramDiv(A);
          }
        }
      })();
      obj.onerror = (function(){
        var obj1 = obj;
        return function(){
          obj1.status = "failed";
//          alert("Failed to load subdiagram " + obj1.file);
        }
      })();

      //obj.img.src = file;

    }

    // Set the caption, and info for the info button.
    if( item.startsWith("CREDITS") ){
      A.caption = fieldValue("CAPTION", item);
      console.log("caption:" + A.caption);
      A.setCaption( A.caption, A.page, A.fromWiki);
      // Reserve a colour for the info button.
      A.addInfoHotspot();

      if( detail ){
        A.addInfoCardForCurrentHotspot(detail);
      }
    }
  }
}

function loadMediaWikiLines(A, specFileData, section){
  console.log( `[${A.index}] MediaWiki format detected` );

  if( section ){
    specFileData = specFileData.split("<pre>START")[section] || "";
    var ix = specFileData.indexOf("</pre>");
    if( ix >=0 )
      specFileData = specFileData.substr(ix+6);
  }

  var lines = specFileData.split("<pre>");
  obeyMediaWikiLines(A, lines);
  console.log( "...parsed" );
}

function loadNewLines(A, specFileData, section){
  console.log( `[${A.index}] parse using loadNewLines...` + (section ? "(subsection)" : "") );

  if( specFileData.match(/__NOTOC__/))
    return loadMediaWikiLines( A, specFileData, section);
  if( specFileData.match(/^ADD:DATA/))
    return loadMediaWikiLines( A, specFileData, section);

  if( !specFileData.match(/^(?:!!|~~~)Scorpio/))
    specFileData = "~~~Scorpio" + specFileData;

  var str = specFileData.split(/(?:!!|~~~)Scorpio/)[1];
  str = "ADD:DATA="+Scorpio_Fmt.jsonOf( str );
  obeyMediaWikiLines( A, [ str ]);
  console.log( "...New scorpio loaded" );
}

function oneSpecArrived( A, data, index){
  console.log( `oneSpecArrived: page ${index}`);
  A.pagesToGo--;
  A.pagesLoaded[index]=data;
  if( A.pagesToGo > 0)
    return;
  A.currentPage = 0;
  handleNewData(A, A.pagesLoaded[0], 0);
}

function loadDiagram(A,page, fromwiki,section){
  console.log("Load Diagram: "+page);
  A.page = page;
  A.fromWiki = fromwiki;
  A.setToc(false);
  if( page.match(" ")){
    pages = page.split( " ");
    A.pagesToGo = pages.length;
    A.pagesLoaded = [];
    for( var i in pages){
      var fn = 
      function(j){ 
        return function(kA,kPage){
          oneSpecArrived( kA, kPage, j);
        }
      }(i);
      requestSpec( A,pages[i], fromwiki,section,fn );
    }
    return;
  }
  requestSpec( A,page, fromwiki,section);
}

/**
 * addNewInfoCards does not clear out old data before loading new lines from
 * a file.
 * It does do 'updateImages' so can be used to change the image.
 * @param A
 * @param data
 * @param section
 */
function addNewInfoCards(A, data, section){
  A.dataArriving = true;
  resetHotspots(A);
  A.Status.isAppReady = false;
  loadNewLines(A, data, section);

  var d= {};
  var obj = A.RootObject;
  createCells( A, obj, d );
  A.Status.time = 0;

  console.log( "addNewInfoCards")
  updateImages(A);
  setToc( A, A.TocShown );
  A.dataArriving = false;
}

/**
 * handleNewData wipes out all old data, including captions and hotpsots,
 * before bringing new data in.
 * @param A
 * @param data
 * @param section
 */
function handleNewData(A, data, section){
  //console.log( `[${A.index}] handleNewData`);

  A.resetHotspots();
  A.resetRootObject();
  // resetPorthole(A); // Not needed
  A.Status.isAppReady = false;
  loadNewLines(A, data, section);
  // A.inner has text that was already in the div.
  if( A.inner )
    loadNewLines(A, A.inner);

  var d= {};
  var obj = A.RootObject;
  createCells( A, obj, d );
  A.Hotspots.InitialAutocolours = A.Hotspots.autoColourIx;
  A.Status.time = 0;
  A.newEvents = true;

  // console.log( `[${A.index}] about to update images...`)
  updateImages(A);
  A.setToc( A.TocShown );
  // This is a counter of how many times to
  // optimise the image with force directed layout.
  A.iter = 200;
}

// Puts wikitext data into the edit page
function handleEditorData(A, data, section){
  A.MainDiv.innerHTML = data;
  // And switches to a different tab, if it should.
  if( A.tab ){
    var widget = document.getElementById( A.tab + 'Tab');
    if( widget ){
      widget.onclick();
    }
  }
}

// Translates wikitext data into html in the page.
// No longer actively used.
function handlePageData(A,str){
  var div = document.getElementById( "page" );
  if( !div )
    return;
  str = htmlOfMediaWiki( str );
  var name = A.page;
  name = decodeURI( name );
  name = name.replace(/_/g," ");
//  data = "<h1><a href='demos.htm?page0="+A.page+"'>Toolkit/"+name+"</a></h1><hr>"+data;
  str = "<h1>"+name+"</h1><hr>"+str;

  div.innerHTML = str;
  addPreview();
}

/**
 * Loads one source file into an item in an array.
 * @param A
 * @param data
 * @param action
 * @param url
 * @param section
 * @param data
 * @param action
 * @param url
 */
function fileActionLoader(A,data, action, url,section,fn){
  var txtFile = new XMLHttpRequest();
  // CDNs and Varnish should give us the very latest.
    txtFile.onreadystatechange = function(){
    if( this.readyState === 4 && this.status === 200 ){
      // data.push({ action: action, value: this.responseText});
      fn(A,this.responseText,section);
    }
  };

  txtFile.open("GET", url, true);
  //txtFile.setRequestHeader( "Cache-Control", "s-maxage=0" );
  txtFile.send();
}

function requestSpec(A,source, fromwiki,section,fn){
  A.SpecName = source;
  requestFile(A, source, fromwiki,section,fn);
}

function requestKwicContents(A,source, objin){
  A.KwicContents = source;
  var fromWiki = false;

  var obj = objin;
    var fnProcessKwic = function(A,text, n ){
    newKwicData( A, obj, text );
  };

  requestFile(A,source, fromWiki, 0,fnProcessKwic);
}

function requestFile(A,source, fromwiki,section,fn){
  fn = fn || handleNewData;
  var date = new Date();
  var nMillis = date.getTime();

  if( isFromServer() === "no" )
  {
    fileActionLoader( A,"", "", Registrar.diagramSrc + source + ".txt",section, fn);
  } else  if( fromwiki !== 'yes' ){
    fileActionLoader( A,"", "", Registrar.diagramSrc + source + ".txt?time="+ nMillis,section,fn);
  } else {
    // action=raw to get unprocessed file from wiki.
    // time=nMillis to avoid issues with cached content.
    fileActionLoader( A,"", "",
      "https://wiki.audacityteam.org/wiki/Toolbox/" + source +
      "?action=raw&time=" + nMillis,section, fn);
  }

}

function addObjectToDictionary(A, layout){
  A.RootObject.objectDict[layout.id] = layout;
}


function doTopLevelInstructions(A,obj){
  if( obj.options ){
    console.log(`Options: ${obj.options}`);
    if( obj.options.match( 'nodrag') )
    {
      var p = A.FocusCanvas;
      p.onclick = null;
      p.onmouseup = null;
      p.onmousedown = null;
      p.ondblclick = null;
    }
  }

  if( !obj.boxed )
    return;

  A.Porthole.width  = 560;
  A.Porthole.height = 50;
  if( !isNaN( obj.boxed ) )
    A.Porthole.height = +(obj.boxed);
  A.CaptionDiv.style.display = 'none';
  //A.CaptionDiv.style.height='0px';

  A.MainDiv.parentElement.style.margin='0px';
  var p = A.MainDiv.parentElement.parentElement;
  p.style.minHeight = (A.Porthole.height)+'px';
  p.classList.add('inline_content');
  p.classList.remove('wide_content');
  A.resizeDivs();
//  debugger;
}

/**
 *
 * converts user friendly format into more
 * verbose but more uniform format,
 * with content and type fields.
 *
 * Only one field should have a capital letter
 * It causes the type, value, id and content fields.
 * So {"Geshi":"dominos"}
 * is converted to:
 * { "type":"Geshi",
 *   "value":"dominos",
 *   "content": [],
 *   "id":"dominos",
 * };
 * @param A
 * @param indent
 * @param layout
 */

function convertJsonStructure(A, indent, layout){
  var key;
  for( key in layout ){
    // only look at user created keys,
    // i.e. not keys from any prototype
    if( !layout.hasOwnProperty(key) ) continue;

    // only look at keys which have upper case first letters.
    var ch = key.substr(0, 1);
    if( ch !== ch.toUpperCase() ) continue;

    // If an array, then there are more objects
    // to explore.
    if( Array.isArray(layout[key]) ){
      layout.content = layout[key];
    } else {
      // otherwise there are no contents.
      layout.content = [];
      layout.value = layout[key];
    }
    layout.type = key;
    delete layout[key];

    //console.log( indent+key );
    break;
  }
  // If we had a string, that is now the ID.
  if( (!layout.id) && layout.value && (typeof layout.value) == "string" ){
    layout.id = layout.value;
  }
  // we only index on 10 significant letters of the identifier.
  // in part this is because the string might actually be an essay
  // and never intended as an id at all.
  if( layout.id ){
    layout.id = layout.id.substr(0, 10);
    addObjectToDictionary(A, layout);
    A.RootObject.objectList.push(layout);
  }

  // Now recurse and process any substructure.
  if( layout.content && Array.isArray(layout.content) ){
    for( var i = 0; i < layout.content.length; i++ ){
      //console.log( indent+"Arg: "+i);
      convertJsonStructure( A, indent + "   ", layout.content[i]);
    }
  }
}

function doChoose( A, parentObj, item )
{
  if( !parentObj.content )
    return;
  if( !Array.isArray(parentObj.content))
    return;

  item--;
  var n = parentObj.content.length;
  for( var i=0;i<n;i++){
    var obj = parentObj.content[i];

    obj.colour  = (i===item) ? "rgb(255,250,235)":"rgb(255,230,205)";
    obj.borderColour = (i===item) ? "rgb(145,125,0)"  :"rgb(215,155,0)";
    obj.cornerRadius = 8;
    obj.drawEarly = (i!==item);
    obj.drawExtra = true;
    if( A.dataArriving )
      continue;
    if( i===item && (parentObj.chosen !== item )){
      parentObj.chosen = item;
      //console.log( "New choice of "+(item+1));
      if( obj.clickDo ){
        // This makes a temporary click action, so that we can
        // do it immediately.
        A.Hotspots.Current.Click = [];
        setClickAction( A, obj.clickDo );
        obeyCode(A,A.Hotspots.Current.Click);
      }
    }
  }
}

/**
 * This will take a string name but has been 
 * hacked so it will also work with an actual object.
 * Therefore function is badly named, and it and related code
 * need some clean up.
 */
function getObjectByName(A, name){
  if( typeof name !== 'string' ) return name;
  if( !A.RootObject.objectDict ) return 0;
  var shortName = name.substr(0, 10);
  return A.RootObject.objectDict[shortName];
}

function removeFrame(A){
  var doc = document.getElementById("body");
  doc.innerHTML =
    '<div id="content_here" style="text-align:center;"></div><div id="captionDiv" style="text-align:center;"><em>No Hotspot Zones Loaded (Yet)</em></div><div id="spec" style="margin-left:10px"></div>';
}

function isFromServer(){
  var str = window.location.href;
  return (str.indexOf('localhost') !== -1) ? "no" : "yes";
}


var Editors = [];
var Nozone = {};
Nozone.Zone = 0;

var Message;
var Message2;

function addPreview(){
  AnnotatorList.splice(1);
  console.log( "Removing annotator instance. "+AnnotatorList.length + " remain" );
  RR.initContent("atkContentDiv2");
}

function populateEditorElement(A, contentHere){

  // Used for debugging messages
  Message = document.getElementById("message");
  Message2 = document.getElementById("message2");

  // MainDiv contains all the other divs
  A.MainDiv = document.createElement("textarea");
  A.MainDiv.rows=50;
  A.MainDiv.cols=80;
  A.MainDiv.style.width="80%";
  A.MainDiv.style.fontFamily = "Consolas,Lucida Console,monospace";
  A.MainDiv.spellcheck="false";

  contentHere.appendChild(A.MainDiv);
}

function onDraggableClicked(A, obj){
  if( !A.Status.click )
    return;
  console.log( "Clicked on Object ", obj.id );
  A.dragObj = obj;
}

/**
 * During dragging, this function returns the proposed new position for
 * an object, including previous offset.
 * @param A
 * @param obj
 * @returns {{}}
 */
function newPos( A, obj, e ){
  offset = {};
  offset = obj.offset || obj;
  var d={};
  if( !A.Status.click )
    return d;
  if( A.dragObj !== obj)
    return d;
//  if( !obj.offset )
//    obj.offset = {x:0,y:0};
  if( !A.Status.move ){
    A.Status.move = {x:0,y:0};
    A.Status.click = {x:0,y:0};
  }
  if( obj.flip === 6 ){
    d.y = offset.y + A.Status.move.x - A.Status.click.x;
    d.x = offset.x + A.Status.move.y - A.Status.click.y;
    return d;
  }

  var oo = asVector2d( offset );
  transformXy( oo, e);
  var mm = asVector2d( A.Status.move );
  var cc = asVector2d( A.Status.click );
  var dd = oo.add( mm ).sub( cc );
  //antiTransformXy( dd, e);
  setFromVector2d( d, dd );

//  d.x = offset.x+A.Status.move.x -A.Status.click.x;
//  d.y = offset.y+A.Status.move.y -A.Status.click.y;

  return d;
}

/**
 * On locking in a move, it is as if you had clicked at the new position.
 * Future steps in the drag will act as if so.
 * @param A
 * @param obj
 * @param d
 * @returns {*}
 */
function onLockInMove( A, obj, d, e){
  offset = {};
  offset = obj.offset || obj;
  if( !A.Status.click )
    return;
  if( A.dragObj !== obj)
    return d;
  if( obj.flip === 6 ){
    A.Status.click.x += d.y - offset.y;
    A.Status.click.y += d.x - offset.x;
    offset.x = d.x;
    offset.y = d.y;
    return;
  }
  obj.placed = true;

  var oo = asVector2d( offset );
  transformXy( oo, e);
  var cc = asVector2d( A.Status.click );
  var dd = asVector2d( d );
  cc = cc.add( dd ).sub( oo );
  setFromVector2d( A.Status.click, cc);

  antiTransformXy( dd, e);
  setFromVector2d( offset, dd);

//  A.Status.click.x += d.x - offset.x;
//  A.Status.click.y += d.y - offset.y;
//  offset.x = d.x;
//  offset.y = d.y;
  Editor.editSource( A.index );
  //if( (Math.abs(d.x -obj.pos.x ) >0.1)|| (Math.abs(d.y -obj.pos.y )>0.1) ){
  //  console.log("New offset: "+ stringOfCoord( obj.offset) );
  //}
}

function finalDraw(A, obj, d){
  console.log("final draw");
  drawDiagramAgain(A);
}

function createDraggable(A, obj, d){
  obj.colour = "rgb(205,192,67)";
  obj.borderColour = "rgb(120,97,46)";
  obj.onClick = onDraggableClicked;
  obj.glyph="Spot";
  //obj.onMouseUp = finalDraw;
}

function createDraggable2(A, obj, d){
  obj.onClick = onDraggableClicked2;
  //obj.onMouseUp = finalDraw;
}

function registerMethods()
{
  var reg = registerMethod; // abbreviation
  // default is handled specially.  Anything with unspecified
  // option uses default.
  reg( "default",    createContainer,sizeContainer, layoutUnmargined, drawNowt);

  // Containers
  reg( "HStack",    0,0, layoutContainer, drawContainer);
  reg( "VStack",    0,0, layoutContainer, drawContainer);
  reg( "Overlay",   0,0, layoutContainer, drawContainer);
  reg( "Transform", 0,0, layoutTransform, drawTransform);

  // Actual objects
  reg( "Prog",      createProg,sizeNowt,layoutNowt, 0);
  reg( "Image",     createImage,0, layoutMargined, drawImage);
  reg( "Tile",      createTile, 0, layoutMargined, drawTile);
//  reg( "KWIC",      createKwic,       0,0, drawKwic);
//  reg( "Geshi",     0,0, layoutMargined, drawGeshi);
  reg( "Draggable", createDraggable,  0,0, drawDraggable);
  reg( "Drag2",     createDraggable2, 0,0, drawDraggable2);
  reg( "Arrows",    0, sizeNowt,layoutNowt, drawArrows);
  reg( "Spline",    0, sizeNowt,layoutNowt, drawSpline);
  reg( "Text",      0,0, layoutMargined, drawTextInBox);
  reg( "Circle",    0,0, layoutMargined, drawCircle);
  reg( "Rectangle", 0,0, layoutMargined, drawRectangle);
  reg( "Spacer",    0,0, layoutMargined, drawNowt2);

  reg( "Chart",     0,0, layoutMargined, drawChart);
  reg( "Graph",     0,0, layoutMargined, drawGraph);
  reg( "Bugle",     0,0, layoutMargined, drawBugle);
  reg( "Sankey",    0,0, layoutMargined, drawSankey);
  reg( "Parliament",0,0, layoutMargined, drawParliament);
  reg( "Path",      0,0,0, drawPath);
  reg( "Tree",      0,0,0, drawTree);
}

Registrar.inits.push( registerMethods );

Exports();

return metaData;
}( Registrar );// end of scorpiodiagrams_js
