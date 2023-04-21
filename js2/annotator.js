var AnnotatorList = [];



function drawFocusSpot(A,x, y){

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

function drawInfoButtonHotspot(A){
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

function drawInfoButton(A){
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

function drawFilledArrow(A, obj, S){
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
function drawFocusDragger(A,x, y){

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

  drawFilledArrow(A, S, S);
  S.theta = Math.PI/2;
  drawFilledArrow(A, S, S);
  S.theta = Math.PI;
  drawFilledArrow(A, S, S);
  S.theta = Math.PI*1.5;
  drawFilledArrow(A, S, S);

  ctx.beginPath();
  var w = S.shaftWidth;
  ctx.rect( x-w/2,y-w/2,w,w );
  ctx.closePath();
  ctx.fill();
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
    A.InfoCard = {};
    A.setInfoCardSize();
    A.Styles = {};
    A.Styles.current = 0;
    A.Styles.dict = [];
    A.Styles.autolink = false;
    A.iter = 0;// For force directed layout.
    return this;
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

  setInfoCardSize(){
    var A = this;
    A.InfoCard.width = A.Porthole.width / 2 - 10;
    A.InfoCard.height = Math.max(350, A.Porthole.height - 100);
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
//    A.MainDiv.style.height = A.Porthole.height + 'px';
    A.SidePanelDiv.style.height = A.Porthole.height + 'px';
    A.SidePanelDiv.style.marginLeft = (A.Porthole.width+15) + 'px';

    A.BackingCanvas.width = A.Porthole.width;
    A.BackingCanvas.height = A.Porthole.height;
    A.FocusCanvas.width = A.Porthole.width;
    A.FocusCanvas.height = A.Porthole.height;
    A.InfoCardDiv.style.width = A.InfoCard.width + 'px';
    A.InfoCardDiv.style.height = A.InfoCard.height + 'px';
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

    A.SidePanelDiv = document.createElement("div");

    A.CaptionDiv = document.createElement("div");

    DetailsPanel.makeDivs( A );

    // InfoCard div floats above the white-out
    A.InfoCardDiv = document.createElement("div");

    A.SidePanelDiv.className = "SidePanelDiv";
    //A.SidePanelDiv.innerHTML = tabbedContent();//"Nothing here yet, folks.";

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

    //A.InfoCardDiv.innerHTML = "Some Text";

    A.InfoCardDiv.className="InfoCardDiv DarkDiv";

    A.InfoCardUpdateDelay = 0;
    A.InfoCardPos = Vector2d(0,0);

    p = contentHere;
    p.appendChild(A.MainDiv);
//    p.appendChild(A.SidePanelDiv);

    p = A.MainDiv;
    p.appendChild(A.BackingCanvas);
    p.appendChild(A.FocusCanvas);
    p.appendChild(A.InfoCardDiv);
    p.appendChild(A.CaptionDiv);
    DetailsPanel.appendDivs( A );

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

  detailPosFromCursorPos(x, y ){
    var A = this;
    var pt = Vector2d(0,0);
    // get position as somewhere in range -1..+1
    var tx = x / A.Porthole.width;
    var ty = y / A.Porthole.height;

    // InfoCard panel will be hard right or hard left.
    tx = (tx > 0.5) ? 0 : 1; // other side...

    // desired min overlap for rich window.
    var kOverlap=50;
    var portholeLoc = A.MainDiv.getBoundingClientRect();
    //getOffset( A.MainDiv );
    
    // porthole edge positions.
    var xLeft   = portholeLoc.left;
    var xRight  = portholeLoc.left + A.Porthole.width;
    var yTop    = portholeLoc.top;
    var yBottom = portholeLoc.top + A.Porthole.height;


    var fullWidth = Math.min(window.innerWidth, document.documentElement.clientWidth || window.innerWidth);
    // convert to positions for card.
    xLeft   = Math.max(0, xLeft+kOverlap- A.InfoCard.width);
    xRight  = Math.min(xRight-kOverlap, fullWidth - A.InfoCard.width);
    yBottom = yBottom - A.InfoCard.height;

    pt.x = xLeft + tx*( xRight-xLeft);
    pt.y = yTop  + ty*( yBottom-yTop);

    return pt;
  }

  drawFocusLayer( x, y){
    var A = this;
    if( A.Cursor === "dragger" ){
      drawFocusDragger(A, x, y);
    } else {
      drawFocusSpot(A, x, y);
    }
    drawInfoButton(A);
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

  // this eventually happens.
  // It either posts the delayed information
  // and possibly repositions.
  // OR it hides the cards.
  delayedInfoCardUpdate(){
    var A = this;
    var inTheDetail = A.InfoCardDiv.matches(':hover');
    if( inTheDetail ){
      return;
    }
    if( A.RichToolTipContent ){
      A.InfoCardDiv.innerHTML = A.RichToolTipContent;
      A.InfoCardDiv.style.display = "block";
      if( isDefined( A.InfoCardPos.x ))
        A.InfoCardDiv.style.left = A.InfoCardPos.x + "px";
    }
    else
    {
      A.InfoCardDiv.style.display = "none";
    }
  }

  // called on a timer tick...
  timeoutsForOneDiagram(){
    var A = this;
    if( A.InfoCardUpdateDelay > 0){
      A.InfoCardUpdateDelay--;
      if( A.InfoCardUpdateDelay <= 0 ){
        A.delayedInfoCardUpdate();
      }
    }
  }

  makeRainbowBox(){
    var A = this;
    var card = 
    "<h3>Hotspots</h3>This panel lists all the hotspot text for this diagram. The coloured boxes on the left will reveal where on the diagram the hotspots are, when you hover over them.<br clear='all'";
    var clicker = "onmouseover='drawHotShape("+A.index+",\"drawAll\")'" +
      " onmouseout='drawHotShape("+A.index+",\"clear\")' ";

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
      var clicker = "onmouseover='drawHotShape("+A.index+",\"draw\","+c+")'" +
        " onmouseout='drawHotShape("+A.index+",\"clear\")'";
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
      A.ToolHotspotsDiv.innerHTML = text;
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
    var str = "<em>"+caption+"</em>";
    if( page ){


    }

    if( A.Hotspots.colourOfZone && A.Hotspots.colourOfZone.length > 0)
      str +=
        " &nbsp; <span class='nutshell-button' id='zoneToggler"+
        A.index+"' "+
        "onclick='toggleToolsVisibility("+A.index+")'>+ details</span>";
    captionDiv.innerHTML = sanitiseHtml(str);
  }

}

// >>>>>>>>>>>>> Stand alone 

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
 * This gets rid of the info card when we move back onto the
 * diagram.  Maybe instead this should be keyed to moving off
 * the info card?
 */
function onMouseOver(e){
  var index = e.target.toolkitIndex;
  var A = AnnotatorList[index];
  A.InfoCardUpdateDelay = 10; 
}


/*
 * When we exit the annotation area,
 * remove the decorations (the extra focus ring and the detail div).
 */
function onMouseOut(e){
  var index = e.target.toolkitIndex;
  var A = AnnotatorList[index];
  A.Status.isFocus = false;
  A.Highlight = "%none";
  window.getSelection().empty();

  if( !A.Status.isAppReady ) return;
  if( e.shiftKey ) return;
  var ctx = A.FocusCanvas.ctx;
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, A.Porthole.width, A.Porthole.height);
  
  var inTheDetail = A.InfoCardDiv.matches(':hover');
  if( inTheDetail ){
    // Cancel hide timer.
    // They made it into the div before timeout.
    A.InfoCardUpdateDelay = 0; 
    // State that we are showing something.
    A.Status.Zone = 10000;
  }
  else{
    A.InfoCardDiv.style.display = "none";
    A.InfoCardUpdateDelay = 10; 
    A.Status.Zone = -1;
  }
  A.Cursor = "spot";
  A.dragObj = undefined;
  //e.target.style.cursor = 'auto';
}

function onMouseUp( e ){
  var index = e.target.toolkitIndex;
  var A = AnnotatorList[index];
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
  var A = AnnotatorList[index];

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
    //A.InfoCardDivFrozen = true;
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

  var A = AnnotatorList[index];

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
  var A = AnnotatorList[index];
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

function enterNewZone(v,A){
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

function onMouseMove(e){
  var index = e.target.toolkitIndex;
  var A = AnnotatorList[index];
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
  var pt = A.detailPosFromCursorPos( x, y);
  A.InfoCardPos.x = pt.x;


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

  var flipsNow = e.buttons;

  if( flipsNow ){
    A.InfoCardDiv.style.left = pt.x + "px";
  }

  if( (A.Status.Zone !== actions.Zone) && !e.buttons  ){
    A.Status.Zone = actions.Zone;
    A.MainDiv.style.cursor = actions.Zone ? "move" : "auto";
    var v = Vector2d( e.clientX, e.clientY );
    enterNewZone(v,A);
    //if( !actions.Down )
    //  e.target.style.cursor = actions.Click ? 'pointer' : 'move';
    //drawDiagramAgain(A);
  }

  //A.InfoCardDiv.style.left = pt.x + "px";
  A.InfoCardPos.y = pt.y;
  A.InfoCardDiv.style.top = pt.y + "px";

  A.drawFocusLayer( x, y);

  A.Status.move = { x: x, y: y };
  if( e.buttons ){
    // Can get a little expensive/jittery as
    // we redraw everything on each mouse move (if dragging)
    drawDiagramAgain(A);
  }
}

function setTextVersion( index, spec ){
  var A = AnnotatorList[index];
  if( !A )
    return;
  handleNewData( A, spec );  
}

function getTextVersion( index ){
  var A = AnnotatorList[index];
  var str = "No diagram, no instructions for drawing";
  if( A ) for( var obj of A.RootObject.content ){
    if( writeThing[ obj.type ] ){
      str = "##"+obj.value +"\r\n";
      str += writeThing[obj.type]( A, obj, {} );
    }
  }
  return str;
}

function getJavascriptVersion( index ){
  var A = AnnotatorList[index];
  var str = JSON.stringify( A.RootObject.content, null, 2 );
  return str;
}


function toggleToolsVisibility(index){
  var A = AnnotatorList[index];
  A.TocShown = !(A.TocShown || false);
  A.setToc( A.TocShown );
  return false;
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
  var A=window.TipBox || {};
  if( !A.InfoCardDiv )
    return;
  if( A.InfoCardUpdateDelay > 0){
    A.InfoCardUpdateDelay--;
    if( A.InfoCardUpdateDelay > 0 )
      return;
  }
  var inTheDetail = A.InfoCardDiv.matches(':hover');
  if( inTheDetail && (A.InfoCardUpdateDelay==0)){
    return;
  }
  A.InfoCardUpdateDelay = 10;

  if( A.ShownContent == A.RichToolTipContent)
    return;
  A.ShownContent = A.RichToolTipContent;

  if( A.RichToolTipContent ){
    A.InfoCardDiv.innerHTML = A.RichToolTipContent;
    A.InfoCardDiv.style.display = "block";
    A.InfoCardDiv.scrollTo( 0, 0);
    if( isDefined( A.InfoCardPos.x ))
      A.InfoCardDiv.style.left = A.InfoCardPos.x + "px";
  }
  else
  {
    A.InfoCardDiv.style.display = "none";
  }
}

function mayCreateInfoCard(A){
  if( A.InfoCardDiv )
    return;
  A.InfoCard = {};
  A.InfoCard.width = 390;
  A.InfoCard.height = 300;

  // InfoCard div floats above the white-out
  A.InfoCardDiv = document.createElement("div");

  A.InfoCardDiv.style.width = '390px';
  A.InfoCardDiv.style.height = '300px';

  A.InfoCardDiv.className="InfoCardDiv DarkDiv";
  A.InfoCardPos = A.InfoCardPos || Vector2d(0,0);
  var box = document.body;
  box.appendChild(A.InfoCardDiv);
  A.InfoCardUpdateDelay = -1;// force immediate...

  A.InfoCardDiv.innerHTML = A.RichToolTipContent;
  A.InfoCardDiv.style.display = "block";
  if( isDefined( A.InfoCardPos.x ))
    A.InfoCardDiv.style.left = A.InfoCardPos.x + "px";
  //A.InfoCardUpdateDelay = -1;
  //window.TipBox = A;
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
function changeTipText( v, text ){
  var A=window.TipBox || {};
  window.TipBox = A;

  A.InfoCardPos = A.InfoCardPos || {};

  var div = A && A.InfoCardDiv;
  var inTheDetail = div && div.matches(':hover') && div.style.display=='block';

  var newContent = text;//Markdown_Fmt.htmlOf( text );
  mayCreateInfoCard( A );

  // No text update? return.  
  if( A.RichToolTipContent == newContent)
    return;
  A.RichToolTipContent = newContent;
  // The guard is for the special case where the info card 
  // itself triggers a change in text.
  if( inTheDetail ){
    A.InfoCardDiv.innerHTML = A.RichToolTipContent;    
    //A.InfoCardUpdateDelay = 200;
    return;
  }
  updateInfoCardFromMouse( v ); // handles S2.
  if( A.InfoCardUpdateDelay > 0)
    return; // S3 text to show was updated.
  // S1. Immediate update.
  A.InfoCardUpdateDelay = -1;
  infoCardTimerCallback();
}

function mayExitHotspot( v ){
  //return;
  var A = window.TipBox;
  var hover = document.elementFromPoint( v.x, v.y);
  // When debugging, and maybe when scrolling, there may be no element.
  if( !hover )
    return;
  if( hover.className == 'popbox_link' )
    return;
  if( hover.className == 'popbox_link2' )
    return;
  if ( hover.className == 'ScorpioCanvas' )
    return;
  changeTipText( v, "");
}

function infoCardPos(){
  var A=window.TipBox ||{};
  A.InfoCardPos = A.InfoCardPos || {};
  return Vector2d( A.InfoCardPos.x ||0, A.InfoCardPos.y||0);
}

// v is the mouse position, not the card position.
function updateInfoCardFromMouse(v){
  var h = window.innerHeight;
  var w = document.body.clientWidth;

  var A=window.TipBox ||{};
  window.TipBox = A;
  A.InfoCardPos = A.InfoCardPos || {};

  if( v.x >= 0)
    A.InfoCardPos.x = v.x;
  A.InfoCardPos.y = v.y;

  var div = A && A.InfoCardDiv;
  if(!div)
    return;


  var p = A.InfoCardPos.y/h;
  h = h-A.InfoCard.height;
  var q = A.InfoCardPos.x/w;
  q = (q>0.5)?0:1;
  w = w-A.InfoCard.width;
  A.InfoCardPos.x = q*w; // delayed
  A.InfoCardPos.y = p*h; // delayed
  // No delay on y.
  // But don't move if in the info card.
  var inTheDetail = div.matches(':hover') && div.style.display=='block';
  if( inTheDetail && (A.InfoCardUpdateDelay==0)){
    A.RichToolTipContent=0;
    return;
  }
  if( A.RichToolTipContent===0 )
    return;
  div.style.top  = (p*h) + "px";
}

function showTipBoxFromDiv( e, divName ){
  var v = Vector2d( e.clientX, e.clientY );
  var header = "";
  if( divName.startsWith("footer_")){
    header = "<h4>Footnote "+divName.split("footer_")[1]+"</h4>";
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
  var div=document.getElementById( divName );
  var text = div ? div.innerHTML : `No preview available. Did not find "${divName}" in this document. I plan to fix this in a future version.<br><br>Haven't yet decided whether to load the page in the background, or to make a digest of the links in the entire document, and load that.`;
  changeTipText( v, header+text );
}

function closeTip(){
  var A=window.TipBox ||{};
  if( !A.InfoCardDiv )
    return;  
  A.InfoCardDiv.style.display='none';
  A.RichToolTipContent = ""; 
  A.ShownContent = "";  
  A.InfoCardUpdateDelay = 0;
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
      // InfoCard div floats above the white-out
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
