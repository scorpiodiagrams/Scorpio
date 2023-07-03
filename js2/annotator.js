

Registrar.js.annotator_js = function( Registrar ){

var metaData = 
{ 
  version: "2023-04",
  docString: "Annotator Boxen. This is the Info Card box which has formatted markdown in it. Does a lot of the hotspot handling. Does the Focus layer of the diagram. Also has code to show the sidebar and the editor box. "
};

// Imports
// var Vector2d = Registrar.classes.Vector2d
// var Box = Registrar.classes.Box;

function Exports(){
  // Namespaced  formats classes and verbs
  Registrar.registerClass( Annotator );
  // These are all for export.
  // Global Exports 
  // These pollute the main namespace
  RR.Annotators = Annotators;

  Annotators.AOfIndex = function(index){
    return AnnotatorList[index];}
  OnFns.refreshToc = refreshToc;
  OnFns.drawHotShape = drawHotShape;
  OnFns.onMouseMove = onMouseMove;
  OnFns.closeTip = closeTip;
  OnFns.toggleToolsVisibility = toggleToolsVisibility;

  RR.makeInfoCard = makeInfoCard;

  RR.showSidebar = showSidebar;
  RR.showTipBoxFromDiv = showTipBoxFromDiv;
  RR.headingForDiv = headingForDiv;
  RR.infoCardMove = infoCardMove;
  RR.infoCardPos = infoCardPos;
  RR.changeTipText = changeTipText;
  RR.infoCardTimerCallback = infoCardTimerCallback;
  RR.annotatorsTimerCallback = annotatorsTimerCallback;
  RR.setTextVersion = setTextVersion;
  RR.getTextVersion = getTextVersion;
  RR.getJsonVersion = getJsonVersion;

  RR.getNamedAnnotator = getNamedAnnotator;
  RR.initContent = initContent;
  RR.initEditors = initEditors;


//  window.Jatex = Jatex;
}

// we export the annotator function AOfIndex via this variable.
// We don't export anything else via it. Maybe we should and make
// it clearer where the functions come from.
var Annotators={};

var AnnotatorList = [];

// Constructs an Annotator object
// An Annotator object deals with one diagram on one canvas.
// It coordinates the status and different layers.
class Annotator{

  constructor(){
    var A = this;
    console.log( "Making annotator instance "+AnnotatorList.length );
    A.initAnnotator();
    A.resetHotspots();

    // record it in the global list....
    var l = AnnotatorList.length;
    A.index = l;
    AnnotatorList.push( A );
    return A;
  }

  initAnnotator(){
    var A = this;
    A.Spec = {}; // the unparsed spec from wiki arrives here.
    A.Status = {};
    A.Status.Zone = -1;
    A.Status.imagesToCome = 2;
    A.Status.time = 0;
    A.Porthole = {};
    A.Porthole.width = 700;
    A.Porthole.height = 400;
    A.Porthole.margin = 5;
    A.Image = {};
    A.Image.imageSrc = './images/AudacityAu19.jpg';
    A.Hotspots = {};
    A.Hotspots.imageSrc = './images/AudacityAu19HS.png';
    A.Focus = {};
    A.Focus.radius = 35;
    A.Styles = {};
    A.Styles.current = 0;
    A.Styles.dict = [];
    A.Styles.autolink = false;
    A.iter = 0;// For force directed layout.
    return this;
  }

  drawFocusSpot(x, y){
    var A = this;
    var ctx = A.FocusCanvas.ctx;

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, A.Porthole.width, A.Porthole.height);

    ctx.fillStyle = "rgba( 5,5,5,0.2)";
    ctx.fillStyle = "#ffffff40";

    // Bigger circle
    ctx.beginPath();
    ctx.arc(x, y, A.Focus.radius+15, 0, Math.PI * 2.0, true);
    ctx.arc(x, y, A.Focus.radius, 0, Math.PI * 2.0, false);
    ctx.closePath();
    ctx.fill();
  }

  drawInfoButtonHotspot(){
    var A = this;
    var xw = 25;
    var yh = 25;
    var x = 5;
    var y = 5;
    var ctx2 = A.HotspotsCanvas.ctx;
    ctx2.lineWidth = 0;
    ctx2.beginPath();
    ctx2.fillStyle = "rgba(0,0,5,1.0)";
    //ctx2.rect(x, y, xw, yh);
    ctx2.arc(x + xw / 2, y + yh / 2, xw / 2, 0, Math.PI * 2.0, true);
    ctx2.fill();
  }

  drawInfoButton(){
    var A = this;
    var xw = 25;
    var yh = 25;
    var x = 5;
    var y = 5;
    var ctx = A.FocusCanvas.ctx;
    ctx.lineWidth = 3;
    ctx.font = "20px Times New Roman";
    ctx.strokeStyle = "rgba( 55, 55,155,1.0)";
    ctx.globalCompositeOperation = 'source-over';

    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,1.0)";

    ctx.arc(x + xw / 2, y + yh / 2, xw / 2, 0, Math.PI * 2.0, true);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(0,0,0,1.0)";
    ctx.fillText("i", x + 9, y + 19);
  }

  drawFilledArrow( obj, S){
    var A = this;
    var ctx = A.FocusCanvas.ctx;

    ctx.save();
    ctx.beginPath();

    ctx.translate(S.x, S.y);
    ctx.rotate(S.theta);
    ctx.translate( S.shaftWidth/2, 0 );

    ctx.moveTo(0,S.shaftWidth/2 );
    ctx.lineTo( S.shaftLength, S.shaftWidth/2 );
    ctx.lineTo( S.shaftLength, S.shaftWidth/2 );
    ctx.lineTo( S.shaftLength, S.headWidth/2 );
    ctx.lineTo( S.shaftLength+S.headLength, 0 );
    ctx.lineTo( S.shaftLength, -S.headWidth/2 );
    ctx.lineTo( S.shaftLength, -S.shaftWidth/2 );
    ctx.lineTo( S.shaftLength, -S.shaftWidth/2 );
    ctx.lineTo(0,-S.shaftWidth/2 );

    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Draws arrows pointing North, South East and West
  // as an overlay.
  drawFocusDragger(x, y){
    var A = this;
    var ctx = A.FocusCanvas.ctx;

    ctx.clearRect(0, 0, A.Porthole.width, A.Porthole.height);


  //  ctx.fillStyle = "rgba( 5,5,5,0.2)";
    ctx.fillStyle = "#ffffff40";

    var S={};
    S.shaftWidth = 10;
    S.shaftLength = 20;
    S.headWidth = 30;
    S.headLength = 25;
    S.theta = 0;
    S.x = x;
    S.y = y;
    S.style = "pointed";

    A.drawFilledArrow(S, S);
    S.theta = Math.PI/2;
    A.drawFilledArrow(S, S);
    S.theta = Math.PI;
    A.drawFilledArrow(S, S);
    S.theta = Math.PI*1.5;
    A.drawFilledArrow(S, S);

    ctx.beginPath();
    var w = S.shaftWidth;
    ctx.rect( x-w/2,y-w/2,w,w );
    ctx.closePath();
    ctx.fill();
  }

  // Sets the elements of the hotspots up, but does not 
  // recreate the canvas.
  resetHotspots(){
    var A = this;
    // Both these array structures includes hand-specified and autocolours.
    // The colours are added as they are discovered.

    // Array: It's indexed via the zone number and yields the colour,
    // e.g "[1,2,3,4]"
    // This structure is important for building the displayed toc
    A.Hotspots.colourOfZone = [];

    // HashTable: It's indexed via a colour string such as "[1,2,3,4]"
    // and yields an actions {} object.
    // The actions object includes, cards, click and hover actions and a
    // zone number.
    // This structure is important for deciding what to do on a click
    // or hover.
    A.Hotspots.actionsOfColour = [];

    // Autocolours are generated 'on demand', starting from colour 0.
    A.Hotspots.autoColourIx = 0;
    // The next quantity counts the number of autocolours found BEFORE
    // we get to drawing.  More may be used in drawing.
    A.Hotspots.InitialAutocolours = 0;

    // Array of colours specified by-hand.
    A.Hotspots.byHandColours = [];
    // A counter used when doling out the hand colours to the structures
    // that consume them.
    A.Hotspots.byHandColourIx = 0;

    // Bogus entry to catch bad cards.  This bogus entry acts as Zone 0.
    A.addHotspot("[5,0,0,0]");
  }

  resetPorthole(){
    var A = this;
    A.Porthole.width = 700;
    A.Porthole.height = 400;
  }

  // This isn't a pure data play.  It may update a div.
  resetCaption(){
    var A = this;
    A.setCaption("Caption was missing");
  }

  resetRootObject(){
    var A = this;
    A.RootObject = {};
    A.RootObject.type = 'VStack';
    A.RootObject.content = [];
    A.RootObject.itemIndex = 0;
    A.RootObject.objectDict = {};
    A.RootObject.objectList = [];

    //A.Hotspots.byHandColourIx = 0;
  }

  resizeDivs(){
    var A = this;
    if( !A.BackingCanvas )
      return;
    A.MainDiv.style.width = A.Porthole.width + 'px';

    A.BackingCanvas.width = A.Porthole.width;
    A.BackingCanvas.height = A.Porthole.height;
    A.FocusCanvas.width = A.Porthole.width;
    A.FocusCanvas.height = A.Porthole.height;
    A.HotspotsCanvas.width = A.Porthole.width;
    A.HotspotsCanvas.height = A.Porthole.height;

    A.HotspotsCanvas.ctx = A.HotspotsCanvas.getContext('2d', {willReadFrequently: true});
    A.BackingCanvas.ctx = A.BackingCanvas.getContext('2d', {willReadFrequently: true});
    A.FocusCanvas.ctx = A.FocusCanvas.getContext('2d', {willReadFrequently: true});
  }

  resizeForImage(img){
    var A = this;
    //alert( "RESIZING "+img.width +"x"+img.height );
    A.Porthole.width = img.width;
    A.Porthole.height = img.height;
    // resizeDivs();
    if( A.Status.isAppReady ){
      console.log( "---Resize for Image")
      A.setupAndDrawDiagramDiv();
    }
  }

  createDomElement(contentHere){
    var A = this;
    // Used for debugging messages
    // Only create for debugging users
    if(DomUtils.getArg('bonus')||true){
      Message = document.getElementById("message");
      Message2 = document.getElementById("message2");
    }
    // MainDiv contains all the other divs
    A.MainDiv = document.createElement("div");
    // Backing canvas has the image drawn into it
    A.BackingCanvas = document.createElement("canvas");
    // Focus canvas has the white-out with focus circle
    A.FocusCanvas = document.createElement("canvas");
    // Hotspots canvas has colour coded imagemap drawn on it.
    A.HotspotsCanvas = document.createElement('canvas');

    A.CaptionDiv = document.createElement("div");

    A.CaptionDiv.className = "CaptionDiv";
    A.CaptionDiv.innerHTML = "<em>No Hotspot Zones Loaded (Yet)</em>";

    A.MainDiv.className="MainDiv"
    A.BackingCanvas.className="ScorpioCanvas";
    A.FocusCanvas.className="ScorpioCanvas";
    A.HotspotsCanvas.className="ScorpioCanvas";

    var p;

    p = A.FocusCanvas;
    p.toolkitIndex = A.index;
    p.onmousemove = onMouseMove;
    p.onmouseout = onMouseOut;
    p.onmouseover = onMouseOver;
    p.onwheel = onMouseWheel;

    p.onclick = onFocusClicked;
    p.onmouseup = onMouseUp;
    p.onmousedown = onMouseDown;
    p.ondblclick = onFocusDoubleClick;

    p = contentHere;
    p.appendChild(A.MainDiv);

    p = A.MainDiv;
    p.appendChild(A.BackingCanvas);
    p.appendChild(A.FocusCanvas);
    p.appendChild(A.CaptionDiv);
    RR.appendDetailsPanelDivs( A );

    // Hotspot canvas and context do not need to be attached.
    A.resizeDivs();

  }

  createDomElements(){
    var A = this;
    var contentHere = document.getElementById("content_here" + A.index);
    A.createDomElement(contentHere);
  }

  // index is a colour in string format like "[10,10,30,255]".
  // This reserves a zone number for that colour (if not
  // already reserved) and sets the current hotspot to
  // be the actions for this colour.
  addHotspot(index){
    var A = this;

    // If we already have this colour, reuse it.
    if( A.Hotspots.actionsOfColour.hasOwnProperty(index) ){
      A.Hotspots.Current = A.Hotspots.actionsOfColour[index];
      return;
    }
    
    // Otherwise create a new actions object, and 
    // record the new colour in our two tables.
    var actions = {};
    actions.Zone = A.Hotspots.colourOfZone.length;
    A.Hotspots.Current = actions;

    A.Hotspots.colourOfZone.push( index );
    A.Hotspots.actionsOfColour[index] = actions;
  };

  addInfoHotspot( ){
    var A = this;
    // This is the zone for the info card.
    A.addHotspot("[0,0,5,255]");
  }

  addInfoCardForCurrentHotspot(text){
    var A = this;
    A.Hotspots.Current.Tip = formatClassNames( A, text);
  }


  // Three actions can be chosen, one for hover, 
  // one for a mmouse down event and one for a mouse 
  // click event (which happens on the mouse up)
  addActionForCurrentHotspot(event, actionText ){
    var A = this;
    if( !A.Hotspots )
      return;
    if( !A.Hotspots.Current )
      return;
    A.Hotspots.Current[event] = actionText;
  }

  addHover( actionText)
  { this.addActionForCurrentHotspot('Hover',actionText);}

  addClick( actionText)
  { this.addActionForCurrentHotspot('Click',actionText);}

  addDown( actionText)
  { this.addActionForCurrentHotspot('Down',actionText);}


  autoColourFromIx( ix ){
    var A = this;
    var index = autoColourOfIndex(ix);
    var rgb = rgbOfJsonString(index);
    return rgb;
  }

  autoColourFromOffset( offset ){
    var A = this;
    var a = (A.Hotspots.autoColourIx-offset);
    var index = autoColourOfIndex(a);
    var rgb = rgbOfJsonString(index);
    return rgb;
  }

  // tell some colours apart.
  nextAutoColour( Tip, overwrite){
    var A = this;
    var a = (A.Hotspots.autoColourIx++);
    var index = autoColourOfIndex(a);
    var rgb = rgbOfJsonString(index);
    var actions = A.Hotspots.actionsOfColour[index];
    if( actions && !overwrite)
      return rgb;

    A.addHotspot( index );
    if( Tip )
      A.addInfoCardForCurrentHotspot( Tip );

    return rgb;
  }

  infoText(){
    var txt = this.Hotspots && 
       this.Hotspots.actionsOfColour && 
       this.Hotspots.actionsOfColour[ "[0,0,5,255]" ] &&
       this.Hotspots.actionsOfColour[ "[0,0,5,255]" ].Tip;
    return txt;
  }

  drawFocusLayer( x, y){
    var A = this;
    if( A.Cursor === "dragger" ){
      A.drawFocusDragger( x, y);
    } else {
      A.drawFocusSpot( x, y);
    }
    A.drawInfoButton();
  }

  actionsFromCursorPos(x,y){
    var A = this;

    if( !A.HotspotsCanvas.ctx ) return -1;
    var pixel = A.HotspotsCanvas.ctx.getImageData(x, y, 1, 1).data;
    var result = "[" + pixel[0] + "," + pixel[1] + "," + pixel[2] + "," +
      pixel[3] + "]";
    var actions = A.Hotspots.actionsOfColour[result] ||
      // Testing with a reduced colour is no longer needed.
      /* A.Hotspots.actionsOfColour[roundColour(result)] || */
      Nozone;
    if( Message2 ) Message2.innerHTML =
      "Colour &amp; Zone: rgba" + result + ", Zone " + actions.Zone;
    return actions;
  }

  setNewImage(file){
    var A = this;

    // Only supported for whole-div images.
    if( (A.RootObject.content.length === 1) &&
      (A.RootObject.content[0].type === "Image") ){
      var obj = A.RootObject.content[0];
      //obj.file = file;
      //obj.img.crossOrigin = "anonymous";
      //obj.img.src = urlOfFilename( obj.file );
      obj.src = file;
      A.mayRequestDisplayableImage( obj)
    }
  }

  makeRainbowBox(){
    var A = this;
    var card = 
    "<h3>Hotspots</h3>This panel lists all the hotspot text for this diagram. The coloured boxes on the left will reveal where on the diagram the hotspots are, when you hover over them.<br clear='all'";
    var clicker = "onmouseover='OnFns.drawHotShape("+A.index+",\"drawAll\")'" +
      " onmouseout='OnFns.drawHotShape("+A.index+",\"clear\")' ";

    var str = "<table>";
    str += `
  <tr><td style='vertical-align:top;padding:5px;padding-left:0px'>
    <div ${clicker} class='RainbowBox'>All</div>
  </td>
  <td style='padding:5px'>${card}</td></tr>
  `
    str += "</table>";
    return str;
  }
  boxText( colour, size, text, action ){
    var textColour = textColourToContrastWithColourTuple(colour);
    return "<span style='display:inline-block;width:"+size+"px;height:"+size+"px;color:" + textColour +
      ";border:thin solid black;text-align:center;vertical-align:middle;" +
      "line-height:30px;background-color:" + colour + "' "+action+">" + text +
      "</span>";
  }
  makeToc(){
    var A = this;
    var h = A.Hotspots;
    if( !h || !h.colourOfZone)
      return "NO HOTSPOT COLOURS";
    var str = "<table style='max-width:350px;'>";
    for(var i=1;i<h.colourOfZone.length;i++){
      var c = h.colourOfZone[i];
      if( !c )
        continue;
      //var strc = stringOfTuple(c);
      var item = h.actionsOfColour[c];
      if( !item )
        continue;
      var card = item.Tip;
      if( !card )
        continue;
      card = Markdown_Fmt.htmlOf(card);
      // White text for numbers on dark backgrounds, black when light.
      var clicker = "onmouseover='OnFns.drawHotShape("+A.index+",\"draw\","+c+")'" +
        " onmouseout='OnFns.drawHotShape("+A.index+",\"clear\")'";
      var c2 = colourTupleOfJsonString(c);

      str += "<tr><td style='vertical-align:top;padding:5px;padding-left:0px'>" +
        this.boxText( rgbOfColourTuple(c2), 30, i-1, clicker) +
        "</td><td  style='padding:5px'>" + card + "</td></tr>";
    }
    str += "</table>";
    return str;
  }

  setToc( bShow ){
    var A = this;
    A.TocShown = bShow;
    var div = A.ToolsDiv;//.getElementById("tabular_contents"+A.index);
    if( !div )
      return;

    if( bShow ){
      var contents = A.makeToc();
      var text = A.makeRainbowBox() +
        "<hr>" +
        contents;
      //A.ToolHotspotsDiv.innerHTML = text;
    }

    div.style.display = bShow? 'block':'none';
    div.style.height  = bShow? "400px" : "300px";

    var toggler = document.getElementById("zoneToggler"+A.index);
    if( !toggler)
      return;
    // Note use of full width unicode + and - characters
    // rather than normal + and -..  This is because we
    // want the + or - to fill a box.

    var indicator = bShow ? "━":"╋"
    toggler.innerHTML=`<span class='boxed'>${indicator}</span>details`;
  }

  setCaption(caption, page, fromWiki){
    var A = this;
    //A.TocShown = false;
    A.Caption = {};
    A.Caption.text = caption;
    A.Caption.page = page;
    A.Caption.fromWiki = fromWiki;

    var captionDiv = A.CaptionDiv;//.getElementById("captionDiv"+A.index);
    if( !captionDiv )
      return;

    caption = DomUtils.escapeEmoji( caption );
    var index = A.index;

    var str = RR.PolyHelper.htmlOf2( 
`> [!cinfo]-Toc${index} *${caption}*
XX-REPLACE-ME-XX
)`
    );

    var str2 = RR.toolboxString( A );

    str = str.replace( /XX-REPLACE-ME-XX/, str2);
    captionDiv.innerHTML = sanitiseHtml(str);
  }

  enterNewZone(v){
    var A = this;
    var actions = A.latestActions;
    A.Highlight = "%none";
    // Update the detail div
    showOrHideTip( v, actions);

    // Do any additional hover action
    if( actions.Hover ){
      obeyCode( A,actions.Hover );
    }
    if( actions.Zoom )
      A.MainDiv.style.cursor = "zoom-in";
  }  
}



// >>>>>>>>>>>>> Stand alone 

function refreshToc( index ){
  //var A = Annotators.AOfIndex(index);
  var toc = RR.tabHotspots( index );
  var id=`Hotspots${index}`;
  DomUtils.set( id, toc );
  //alert( "REFRESH"+index );
}

// These generates one new hotspot colour. 
// With a hotspot image, the colours are provided.
// Here the colours must be auto-generated.
// We try to make a nice palette of colours, moving through
// different hues and then different darkness/lightness, then
// coming back to very slightly different hues.
// There are 3x17=51 easily distinguished colours here, 
// after that it's hard to distinguish them.
function autoColourOfIndex(a){

  // Chrome and other
  // browsers may not preserve the
  // alpha exactly, so we make rgb and do not use alpha.

  // a should be smallish
  // this to ensure it is small, 24 bits.
  // We'll be picking bits out of a to construct the actual colour.
  a = a % (65536 * 256);

  // h (hue) on its own gives us 17 distinct colours before 
  // it repeats.
  // h doesn't actually repeat at 17, but visually it is 
  // almost as if it has.

  // We have 1024 different hues since we're using a % 1024.
  var h = (Math.PI * 57 * 2 / 1023) * (a % 1024);
  //var h = (Math.PI * 57 * 2 / 1024) * (a % 1024);
  //a = Math.floor(a/1024);

  // r, g and b are three phases so only one will be
  // strong at any one time.
  var r = Math.floor(127 * Math.cos(h)) + 128;
  h -= Math.PI * 2 / 3;
  var g = Math.floor(127 * Math.cos(h)) + 128;
  h -= Math.PI * 2 / 3;
  var b = Math.floor(127 * Math.cos(h)) + 128;
  h -= Math.PI * 2 / 3;

  // from a, drop the lower 4 bits, since our above hue 
  // cycle is about 16 long.
  // we're going to use the other bits to modulate luminance
  // and saturation.
  a = a >> 4;
  // Now gray-code the remaining bits using the XOR trick.
  // Idea of using gray code is to make changes in luminance or in
  // saturation, but not change both at the same time.
  a = a ^ (a >> 1);

  // luminance and saturation each grab 3 bits.
  var l = (((a & 2) << 6) + ((a & 8) << 3) + ((a & 32)));
  var s = (((a & 1) << 7) + ((a & 4) << 4) + ((a & 16) << 1)) / 500;

  // the six bits give us 64 possibilities, 
  // combined with the around 51 hues we have arguably 
  // 3264 colours.
  // We actually have many more, but some are
  // so similar as to be indistinguishable.

  // adjust the rgb's for luminance and saturation.
  r = Math.floor(r + (l - r) * s);
  g = Math.floor(g + (l - g) * s);
  b = Math.floor(b + (l - b) * s);

  // The final step is to make a string which can be
  // used as a unique index, and that can be formed 
  // easily from the rgb values.
  var index = "[" + r + "," + g + "," + b + ",255]";
  return index;
}


// >>>>>>>>>>>>>>>>>>>> Clicking or moving

/*
 * enter annotation area.
 * Seems like nothing to do as we do things on a timer?
 */
function onMouseOver(e){
}


/*
 * When we exit the annotation area,
 * remove the decorations (the extra focus ring and the detail div).
 */
function onMouseOut(e){
  var index = e.target.toolkitIndex;
  var A = Annotators.AOfIndex(index);
  A.Status.isFocus = false;
  A.Highlight = "%none";
  window.getSelection().empty();

  if( !A.Status.isAppReady ) return;
  if( e.shiftKey ) return;
  var ctx = A.FocusCanvas.ctx;
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, A.Porthole.width, A.Porthole.height);
  
  A.Status.Zone = -1;

  A.Cursor = "spot";
  A.dragObj = undefined;
  //e.target.style.cursor = 'auto';
}

function onMouseUp( e ){
  var index = e.target.toolkitIndex;
  var A = Annotators.AOfIndex(index);
  window.getSelection().empty();

  //e.target.style.cursor = 'auto';
  A.Cursor="spot";
  console.log( "Up at "+ stringOfCoord(A.Status.move ) );
  if( A.dragObj && A.dragObj.onMouseUp )
  {
    A.dragObj.onMouseUp( A, A.dragObj );
  }
  A.dragObj = undefined;
  A.Status.click = undefined;

  var rect = e.target.getBoundingClientRect();
  var x = e.clientX - rect.left;
  var y = e.clientY - rect.top;
  A.drawFocusLayer(x, y);
  drawDiagramAgain(A);
}

function onMouseDown( e ){

  // an existing selection messes up dragging.
  window.getSelection().empty();

  var index = e.target.toolkitIndex;
  var A = Annotators.AOfIndex(index);

  A.Status.move = {x:0,y:0};
  A.Status.click = undefined;

  var rect = e.target.getBoundingClientRect();
  var x = e.clientX - rect.left;
  var y = e.clientY - rect.top;

  A.Status.move = {x:x,y:y};

  A.Status.click = { x: x, y: y };
  console.log( "Down at "+ stringOfCoord(A.Status.click ) );

  var actions = A.actionsFromCursorPos(x, y, "log");
  if( actions.Down ){
    obeyCode( A, actions.Down);
    //e.target.style.cursor = 'all-scroll';
    A.Cursor="dragger";
    A.drawFocusLayer(x, y);
  } else {
    var v = Vector2d( e.clientX, e.clientY );
    showOrHideTip( v, actions );
  }

  drawDiagramAgain(A);
}

/**
 * This is intended to stop double-click selecting text outside the focus
 * window.  It does not seem to make a difference.  The text is selected for
 * a moment and then unselected.
 * @param e
 */
function onFocusDoubleClick(e){
  window.getSelection().empty();
}

function onFocusClicked(e){
  var index = e.target.toolkitIndex;
  // EasterEgg - Shift-Click on info button downloads the image.
  if( e.shiftKey ) {
    doDownloadImage(index);
  }

  var A = Annotators.AOfIndex(index);

  if( !A.Status.isAppReady ) return;
  window.getSelection().empty();

  var rect = e.target.getBoundingClientRect();
  var x = e.clientX - rect.left;
  var y = e.clientY - rect.top;

  var actions = A.actionsFromCursorPos(x, y, "log");
  if( actions.Click ){
    obeyCode( A,actions.Click );
  }
}

function onMouseWheel(e) {
  var index = e.target.toolkitIndex;
  var A = Annotators.AOfIndex(index);
  A.zoom = Math.sign(e.deltaY);

  if( !A.latestActions )
    return;

  var actions = A.latestActions;

  if( actions.Zoom ){
    e.preventDefault();
    obeyCode( A,actions.Zoom );
  }

  console.log(A.zoom);
};

function onMouseMove(e){
  var index = e.target.toolkitIndex;
  var A = Annotators.AOfIndex(index);
  if( e.shiftKey ) return;

  if( !A.Status.isAppReady ) return;
  A.Status.isFocus = true;
  window.getSelection().empty();

  var rect = e.target.getBoundingClientRect();
  var x = Math.ceil(e.clientX - rect.left);
  var y = Math.ceil(e.clientY - rect.top);
  var coordinates = "Coordinates: (" + x + "," + y + ")";

  var actions = A.actionsFromCursorPos( x, y);
  A.latestActions = actions;
  if( Message ) Message.innerHTML = coordinates;


// Test cases:
// - move rapidly from a right-label to the card.
// must land on the card, even if pass through 
// other labels.
// - move onto right of straddling label.  as we
// move left, card stays where it is, also when 
// we move off.
// - as above but moving onto a lefty label.  card
// should move right.
// - coming off the card on left, we should be able 
// to move to a label on the right without the card 
// flipping.

  if( (A.Status.Zone !== actions.Zone) && !e.buttons  ){
    A.Status.Zone = actions.Zone;
    A.MainDiv.style.cursor = actions.Zone ? "move" : "auto";
    var v = Vector2d( e.clientX, e.clientY );
    A.enterNewZone(v);
    //if( !actions.Down )
    //  e.target.style.cursor = actions.Click ? 'pointer' : 'move';
    //drawDiagramAgain(A);
  }

  A.drawFocusLayer( x, y);

  A.Status.move = { x: x, y: y };
  if( e.buttons ){
    // Can get a little expensive/jittery as
    // we redraw everything on each mouse move (if dragging)
    drawDiagramAgain(A);
  }
}

/**
 * Recolours the hotspot image onto the focus layer.
 * Used from on-mouse events relating to the zones list.
 *
 * When we hover over the stripy all box or the individual colour
 * boxes, the related part of the image lights up.
 *
 * @param ix
 * @param action
 * @param colourMatch
 * @returns {number}
 */
function drawHotShape(ix, action, colourMatch){
  var A = AnnotatorList[ ix ];
  var ctx = A.FocusCanvas.ctx;

  if( !A.HotspotsCanvas.ctx ) return -1;

  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, A.Porthole.width, A.Porthole.height);

  if( action === "clear" ){
    A.Hotspots.lastHot = action;
    return;
  }

  var drawAll = action === "drawAll";

  var colourString;
  if( drawAll )
    colourString = "all";
  else
    colourString = rgbOfColourTuple(colourMatch);

  // We'll cache the picked-out shape.
  if( A.Hotspots.lastHot !== colourString ){
    var c = colourMatch;


    // colourWith is slightly faded so we can see image underneath.
    var colourWith   = drawAll ? [255,255,255,200] : [ c[0],c[1],c[2],200];
    var colourAbsent = [ 255,255,255, 200];
    var drawAllOpacity = 230;
    var w = A.Porthole.width;
    var h = A.Porthole.height;
    var pixels = A.HotspotsCanvas.ctx.getImageData(0, 0, w, h);
    var d = pixels.data;
    for( var i = 0; i < w * h * 4; i += 4 ){
      if( drawAll  && d[i+3]<50){
        d[i    ] = colourWith[0];
        d[i + 1] = colourWith[1];
        d[i + 2] = colourWith[2];
        d[i + 3] = colourWith[3];
      }
      else if( drawAll ){
        d[i + 3] = drawAllOpacity;
      }
      else if( d[i] === c[0] && d[i + 1] === c[1] && d[i + 2] === c[2] &&
        d[i + 3] === c[3] ){
        d[i    ] = colourWith[0];
        d[i + 1] = colourWith[1];
        d[i + 2] = colourWith[2];
        d[i + 3] = colourWith[3];
      } else if( colourAbsent[3] > 50) {
        d[i    ] = colourAbsent[0];
        d[i + 1] = colourAbsent[1];
        d[i + 2] = colourAbsent[2];
        d[i + 3] = colourAbsent[3];
      }
    }
    A.Hotspots.lastHot = colourString;
    A.Hotspots.pixels = pixels;
  }

  ctx.putImageData( A.Hotspots.pixels, 0, 0);
}

function setTextVersion( index, spec ){
  var A = Annotators.AOfIndex(index);
  if( !A )
    return;
  handleNewData( A, spec );  
}

function getTextVersion( index ){
  var A = Annotators.AOfIndex(index);
  var str = "No diagram, no instructions for drawing";
  if( A ) for( var obj of A.RootObject.content ){
    if( writeThing[ obj.type ] ){
      str = "##"+obj.value +"\r\n";
      str += writeThing[obj.type]( A, obj, {} );
    }
  }
  return str;
}

function getJsonVersion( index ){
  var A = Annotators.AOfIndex(index);
  var str = JSON.stringify( A.RootObject.content, null, 2 );
  return str;
}

function toggleToolsVisibility(index){
  var A = Annotators.AOfIndex(index);
  A.TocShown = !(A.TocShown || false);
  A.setToc( A.TocShown );
  return false;
}

function annotatorsTimerCallback(){
  var A;
  // Iterate through all the diagrams in the document.
  for(var i=0;i<AnnotatorList.length;i++){
    A = Annotators.AOfIndex(i);
    RR.animateForOneDiagram(A);
  }
}

function infoCardMove(e) {
  e = e || window.event;
  //e.preventDefault();
  // calculate the new cursor position:
  var v = Vector2d( e.clientX, e.clientY);
  // set the element's new position:
  updateInfoCardFromMouse( v );
  mayExitHotspot( v );
}

// Consumes the UpdateDelay.
function infoCardTimerCallback()
{
  var T=window.TipBox || {};
  if( !T.InfoCardDiv )
    return;
  if( T.InfoCardUpdateDelay > 0){
    T.InfoCardUpdateDelay--;
    if( T.InfoCardUpdateDelay > 0 )
      return;
  }
  var inTheDetail = T.InfoCardDiv.matches(':hover');
  if( inTheDetail && (T.InfoCardUpdateDelay==0)){
    return;
  }
  T.InfoCardUpdateDelay = 10;

  if( T.ShownContent == T.RichToolTipContent)
    return;
  T.ShownContent = T.RichToolTipContent;
  updateCardDiv( T );
}

function updateCardText( card, divName, i){
  if( !divName )
    return;
  card.InfoCardDiv.style['opacity'] = 0.8;  
  if( !divName.startsWith("nutj_"))
    return;
  var x = +(divName.split( "nutj_")[1]);

  divName = `nutj_${x+i}`;
  var header = headingForDiv( divName );
  var div=document.getElementById( divName );
  card.RichToolTipContent = div ? div.innerHTML : " ";
}

function updateCardFollowerPositions( ){
  var T=window.TipBox ||{};
  var Divs = RR.MultiscrollerDivs;
  var yStart;
  yStart = T.InfoCardPos.y;
  for( var i=4;i>=0;i--){
    S = Divs[i];
    //yStart -= S.InfoCard.height;
    yStart -= S.InfoCardDiv.offsetHeight;
    S.InfoCardPos.y = yStart;
    S.InfoCardDiv.style.top = yStart + "px";
  }
  yStart = T.InfoCardPos.y+T.InfoCardDiv.offsetHeight;
  for( var i=5;i<10;i++){
    S = Divs[i];
    S.InfoCardPos.y = yStart;
    S.InfoCardDiv.style.top = yStart + "px";
    yStart += S.InfoCardDiv.offsetHeight;
    //yStart += S.InfoCard.height;
  }
}

function updateCardFollowerText( divName  ){
  var T=window.TipBox ||{};
  var Divs = RR.MultiscrollerDivs;
  for( var i=4;i>=0;i--){
    S = Divs[i];
    updateCardText( S, divName, i-5);
  }
  for( var i=5;i<10;i++){
    S = Divs[i];
    updateCardText( S, divName, i-4);
  }
}

function updateCardFollowersFromMouse( divName  ){
  updateCardFollowerText( divName  );
  updateCardFollowerPositions( );
}


function updateCardFollowersFromCard(){
  var T=window.TipBox ||{};
  var Divs = RR.MultiscrollerDivs;
  for( var i=0;i<10;i++){
    S = Divs[i];
    if( isDefined( T.InfoCardPos.x ) ){
      S.InfoCardPos.x = T.InfoCardPos.x;
      S.InfoCardDiv.style.left = T.InfoCardPos.x + "px";
      if( !T.RichToolTipContent )
        S.RichToolTipContent = "Card";
      else if( S.RichToolTipContent )
        S.InfoCardDiv.innerHTML = S.RichToolTipContent;    
    }
    S.InfoCardDiv.style.display = T.RichToolTipContent ? 'block':'none';
  }
  updateCardFollowerPositions( );
}

function updateCardDiv( T ) {
  if( T.RichToolTipContent ){
    T.InfoCardDiv.innerHTML = T.RichToolTipContent;
    T.InfoCardDiv.scrollTo( 0, 0);
    if( isDefined( T.InfoCardPos.x ))
      T.InfoCardDiv.style.left = T.InfoCardPos.x + "px";
    T.InfoCardDiv.style.display = "block";
  }
  else
  {
    T.InfoCardDiv.style.display = "none";
  }
  updateCardFollowersFromCard();
}

function makeInfoCard( T ){
  T.InfoCard = {};
  T.InfoCard.width = 390;
  T.InfoCard.height = 30;

  // InfoCard div floats above the white-out
  T.InfoCardDiv = document.createElement("div");

  T.InfoCardDiv.style.width = '390px';
  T.InfoCardDiv.style.height = 'auto';
  T.InfoCardDiv.style.minHeight = T.InfoCard.height + 'px';
  T.InfoCardDiv.style.maxHeight = '300px';
  T.InfoCardDiv.style.overflow = 'auto';

  T.InfoCardDiv.className="InfoCardDiv DarkDiv";
  T.InfoCardPos = T.InfoCardPos || Vector2d(0,0);
  T.InfoCardDiv.style.display = "none";
  var box = document.body;
  box.appendChild(T.InfoCardDiv);
}

function mayCreateInfoCard(T){
  if( T.InfoCardDiv )
    return;
  makeInfoCard( T );
  T.InfoCardUpdateDelay = -1;// force immediate...
  updateCardDiv( T );
  T.InfoCardDiv.addEventListener('mousedown', function (event) {
    // Use currentTarget to get the listener div (i.e. this div)
    DomUtils.dragMouseDown(event.currentTarget);
  });
  //T.InfoCardUpdateDelay = -1;
  //window.TipBox = T;
  //positionInfoCard( Vector2d( 10,50 ));
  document.onmousemove = infoCardMove;
}

// The info card update logic needs care to get the UI we want.
// We want low flicker when moving over diverse items.
// We want to be able to quick-move to the card and get what we expect.

// 1. If blank, display the next hover immediately.
// 2. Continue displaying a displayed hover for at least 10 ticks 
// after moving off of it
// 3. [Last Gasp rule] If it is time to blank, display the most recent 
// hover and invoke rule 2, provided it is not what we are showing. ow
// do blank

// These rules prioritise displaying something over being blank.
// They reduce flicker by avoiding blanking when momentarily between
// hovers. Rule 2 is what lets us move from a hover to the card.

// Then when on the card:
// A. Rescind the blanking. Keep displaying whilst we are on it.
// B. Rescind card movement.
// C. Blank the card the moment we move off it.

// The rules take some getting right. It is easy to mix up
// - Time of start of hover and time of end of hover.
// - Action when on hover and when on card
// - What the hover state says you are (e.g. blank) and what you are 
//   actually showing.



// Tooltip showing == timer not zero.
function changeTipText( v, text, divName ){
  var TipBox=window.TipBox || {};
  window.TipBox = TipBox;

  TipBox.InfoCardPos = TipBox.InfoCardPos || {};

  var div = TipBox && TipBox.InfoCardDiv;
  var inTheDetail = div && div.matches(':hover') && div.style.display=='block';

  var newContent = text;//Markdown_Fmt.htmlOf( text );
  mayCreateInfoCard( TipBox );

  // No text update? return.  
  if( TipBox.RichToolTipContent == newContent)
    return;
  TipBox.RichToolTipContent = newContent;
  // The guard is for the special case where the info card 
  // itself triggers a change in text.
  if( inTheDetail ){
    TipBox.InfoCardDiv.innerHTML = TipBox.RichToolTipContent;    
    return;
  }
  updateInfoCardFromMouse( v, divName ); // handles S2.
  if( TipBox.InfoCardUpdateDelay > 0)
    return; // S3 text to show was updated.
  // S1. Immediate update.
  TipBox.InfoCardUpdateDelay = -1;
  infoCardTimerCallback();
}

function mayExitHotspot( v ){
  var hover = document.elementFromPoint( v.x, v.y);
  // When debugging, and maybe when scrolling, there may be no element.
  if( !hover )
    return;
  // If on link that makes a tip, do not dismiss the tip 
  if( hover.className.includes( 'popbox_link' ))
    return;
  // If on a canvas (which makes tips) the canvas is responsible 
  // for dismissing the tip.
  if ( hover.className == 'ScorpioCanvas' )
    return;
  changeTipText( v, "");
}

function infoCardPos(){
  var T=window.TipBox ||{};
  T.InfoCardPos = T.InfoCardPos || {};
  return Vector2d( T.InfoCardPos.x ||0, T.InfoCardPos.y||0);
}

// v is the mouse position, not the card position.
function updateInfoCardFromMouse(v, divName){
  var h = window.innerHeight;
  var w = document.body.clientWidth;

  var T=window.TipBox ||{};
  window.TipBox = T;
  T.InfoCardPos = T.InfoCardPos || {};

  if( v.x >= 0)
    T.InfoCardPos.x = v.x;
  T.InfoCardPos.y = v.y;

  var div = T && T.InfoCardDiv;
  if(!div)
    return;

  var p = T.InfoCardPos.y/h;
  T.InfoCard.height = div.offsetHeight;
  h = h-T.InfoCard.height;
  var q = T.InfoCardPos.x/w;
  q = (q>0.5)?0:1;
  w = w-T.InfoCard.width;
  T.InfoCardPos.x = q*w; // delayed
  T.InfoCardPos.y = p*h; // delayed
  // No delay on y.
  // But don't move if in the info card.
  var inTheDetail = div.matches(':hover') && div.style.display=='block';
  if( inTheDetail && (T.InfoCardUpdateDelay==0)){
    T.RichToolTipContent=0;
    return;
  }
  if( T.RichToolTipContent===0 )
    return;
  div.style.top  = (p*h) + "px";
  updateCardFollowersFromMouse( divName );
}

function headingForDiv( divName ){
  var header = "";
  if( divName.startsWith("footnote_")){
    header = "<h4>Footnote "+divName.split("footnote_")[1]+"</h4>";
  }
  else if( divName.startsWith("equation_")){
    header = "<h4>Equation "+divName.split("equation_")[1]+"</h4>";
  }
  else if( divName.startsWith("figure_")){
    header = "<h4>Figure "+divName.split("figure_")[1]+"</h4>";
  }  
  else if( divName.startsWith("content_of_section_")){
    header = "<h4>Section "+divName.split("content_of_section_")[1]+"</h4>";
  }  
  else if( divName.startsWith("content_of_exercise_")){
    header = "<h4>Exercise "+divName.split("content_of_exercise_")[1]+"</h4>";
  }  
  return header;
}

function showTipBoxFromDiv( e, divName ){
  var v = Vector2d( e.clientX, e.clientY );
  var header = headingForDiv( divName );
  var div=document.getElementById( divName );
  var text = div ? div.innerHTML : `No preview available. "${divName}" may be in a different document.<br><br>I plan to search the other docs in a future version. I haven't yet decided whether to load just the missing document in the background, or to make a digest of the links in the entire collection and load that.`;
  changeTipText( v, header+text, divName );
}

function closeTip(){
  var T=window.TipBox ||{};
  if( !T.InfoCardDiv )
    return;  
  T.InfoCardDiv.style.display='none';
  T.RichToolTipContent = ""; 
  T.ShownContent = "";  
  T.InfoCardUpdateDelay = 0;
}

// This function is called without any preceeding delay.
function showOrHideTip( v, actions){
  var A=window.TipBox || {};
  window.TipBox = A;
  var newContent = "";
  if( actions.Tip ){
    newContent = Markdown_Fmt.htmlOf(actions.Tip);
  } 
  
  if( A.RichToolTipContent != newContent){
    if( newContent )
      changeTipText( v, newContent );
    else 
      A.RichToolTipContent = "";
  } 
}

function showSidebar( text ){
  var A=window.Sidebar || {};
  var newContent = text;//Markdown_Fmt.htmlOf( text );
  
  if( A.SidebarContent != newContent){
    A.SidebarContent = newContent;

    if( !A.SidebarDiv ){
      A.SidebarDiv = document.createElement("div");
      A.SidebarDiv.style.width = '160px';
      A.SidebarDiv.style.height = '100%';
  
      A.SidebarDiv.className="SidebarDiv DarkDiv";
      A.SidebarPos = Vector2d(0,0);
      var box = document.body;
      box.appendChild(A.SidebarDiv);
    }

    A.SidebarDiv.innerHTML = A.SidebarContent;
    A.SidebarDiv.style.display = "block";
    if( isDefined( A.SidebarPos.x ))
      A.SidebarDiv.style.left = A.SidebarPos.x + "px";
  } 
  window.Sidebar = A;
  A.SidebarDiv.style.display  = 'block';
  //positionInfoCard( Vector2d( 10,50 ));
}

// contents of sidebar IS contents of div.
function showSidebarFromDiv( divName ){
  var div=document.getElementById( divName );
  showSidebar( div.innerHTML );
}

var timer = 0;



function timerCallback(){
  RR.infoCardTimerCallback();
  RR.annotatorsTimerCallback();
}

function getNamedAnnotator( diagramName ){
  for( var i in AnnotatorList){
    var AA = AnnotatorList[i];
    if( AA.SpecName == diagramName ){
      return AA;
    }
  }
  return null;
}

function initContent( classes ){
  if( classes ){
  }
  else {
    classes = "atkContentDiv";
    AnnotatorList = [];
    if( typeof Scorpio_Fmt ){
      Scorpio_Fmt.instance = 0;
    }
  }
  var base = AnnotatorList.length;
  var contentDivs = document.getElementsByClassName( classes );
  for(var i=0;i<contentDivs.length;i++){
    var A = new Annotator();
    A.SpecName = Registrar.page + "Figure"+i;
    A.index = i+base;
    A.page = DomUtils.getArg('page' + (i + base)) || contentDivs[i].getAttribute("data-page") || "SmallCrowd";
    A.inner = contentDivs[i].innerHTML;

    // Make the divs etc for the display.
    A.createDomElement( contentDivs[i] );

    // If it's an existing spec, update it with new data.
    if( (base > 0 ) && (A.page === DomUtils.getArg('page0')) ){
      var spec = Editors[0].MainDiv.value;
      console.log( 'page0 handleNewData');
      handleNewData( A, spec );
    }
    // else load it with new data.
    else if( typeof LocalPages[ A.page ] !== 'undefined'){
      console.log( `[${A.index}] LocalPages handleNewData`);
      handleNewData( A, LocalPages[ A.page ] );
    }
    else {
      RR.loadDiagram(A, A.page, 'no', 1);
    }
  }
  RR.Multiscroller = new RR.classes.Multiscroller;
  if( timer )
    clearInterval( timer );
  // Timer is for animation such as rotating earth.
  timer = setInterval(timerCallback, 30);

}

function initEditors(){
  regs();

  var contentDivs = document.getElementsByClassName( "atkEditorDiv" );
  for(var i=0;i<contentDivs.length;i++){
    var A = {};
    A.index = i;
    A.page = DomUtils.getArg('page' + i) || contentDivs[i].getAttribute("data-page") || "SmallCrowd";
    A.tab = DomUtils.getArg('action');

    populateEditorElement( A, contentDivs[i] );
    requestSpec(A,A.page, 'remote',1,handleEditorData);
    Editors.push( A );

    //loadDiagram( A, A.page, 'no',1);
  }
  initContent();
  // Timer is for animation such as rotating earth.
  //setInterval(timerCallback, 30);
}

Exports();

return metaData;
}( Registrar );// end of annotator_js
