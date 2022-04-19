var AnnotatorList = [];




/*
Intention:
Move all the hard coded strings into one section.
Upgrade the way we make the elements, so that it can all be
driven off of a markdown document.
*/

function tabbedHeader( index ){
  return `
<div class="tab">
  <button class="tablinks active" id="HeaderHotspots${index}" onclick="openTab(event, 'Hotspots${index}')">Hotspots</button>
  <button class="tablinks" id="HeaderController${index}" onclick="openTab(event, 'Controller${index}')">Controller</button>
  <button class="tablinks" id="HeaderEdit${index}" onclick="openTab(event, 'Edit${index}')">Edit</button>
  <button class="tablinks" id="HeaderDownload${index}" onclick="openTab(event, 'Download${index}')">Download</button>
  <button class="tablinks" id="HeaderUpload${index}" onclick="openTab(event, 'Upload${index}')">Upload</button>
</div>`
}

function tabHotspots( index ){
  return `
  <h3 style='margin-top:10px;'>Hotspots</h3>
  <p>A list of all the what's that comments</p>`
}

function tabController( index ){
  return `
  <h3 style='margin-top:10px;'>Controller</h3>
  <p>Here be mighty fine controllers for diverse things</p>
<div class="slidecontainer">
  <span style="width:70px;display:inline-block;">Size:</span>
  <input type="range" min="35" max="250" value="100" class="slider" style="width:200px" id="size${index}" oninput="updateSize(${index},this.value)"><br>
  <span style="width:70px;display:inline-block;">Rotate:</span>
  <input type="range" min="-36" max="36" value="0" class="slider" style="width:200px" id="rotate${index}" oninput="updateRotate(${index},this.value)">
</div>`  
}

function tabEdit( index ){
  return `
  <h3 style='margin-top:10px;'>Edit</h3>
  <p>Edit ye the stuff</p>
<button onclick='editSource(${index})'>Edit!</button>
`
}

function tabDownload( index ){
  return `
  <h3 style='margin-top:10px;'>Download</h3>
  <p>Download a copy of the diagram.
  </p>
  <button onclick='downloadImage(${index})'>Download Image</button> - A png of the diagram.<br>
  <button onclick='downloadImage(${index},1)'>Save as Text</button> - Save the Scorpio spec for later.<br>
  <button onclick='downloadImage(${index},2)'>Javascript</button> - A version of the spec for programmers.
  `
}


function downloadImage( index, mode ){
  if( mode == 1)
    doDownloadSource(index);
  else if( mode == 2)
    doDownloadJavascript(index);
  else
    doDownloadImage(index);
}

function acceptImage(fileTag, index ){
  if (fileTag.files && fileTag.files[0]) {
    var img = document.getElementById(`uploadedImg${index}`);
    img.onload = () => {
      //alert( `revoked image ${index} object ${img.src}`);
      URL.revokeObjectURL(img.src);  // 
      var A = AnnotatorList[index];
      A.backgroundImg = img;
      drawDiagramAgain(A);
    }
    var file = fileTag.files[0];
    img.src = URL.createObjectURL(file); // set 
    var name = document.getElementById(`fileName${index}`);
    name.innerHTML = ">>>"+file.name+"<<<";
    var noBackground = document.getElementById(`noBackground${index}`);
    noBackground.disabled=false;

  }  
}

function acceptSource(fileTag, index ){
  if (fileTag.files && fileTag.files[0]) {

    var fileName = fileTag.files[0].name;
    var matches;
    matches = fileName.match( /^.*(\/|\\)(.*?)$/);
    if( matches )
      fileName = matches[2];
    matches = fileName.match( /^(.*)\.txt$/);
    if( matches )
      fileName = matches[1];
    matches = fileName.match( /^(.*) \(\d*\)$/);
    if( matches )
      fileName = matches[1];
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      console.log( reader.result);
      var A = AnnotatorList[index];
      A.SpecName = fileName;
      setTextVersion( index, "!!Scorpio"+reader.result );

//      var A = AnnotatorList[index];
//      A.backgroundImg = img;
//      drawDiagramAgain(A);
    })
    reader.readAsText(fileTag.files[0]);
  }  
}



function acceptInternalImage( index ){
  var A = AnnotatorList[index];
  A.internalImg = document.getElementById(`internalImg${index}`);
  A.receivedBackground = A.requestedBackground;
  drawDiagramAgain( A );
}


function removeBackground(index){
  var noBackground = document.getElementById(`noBackground${index}`);
  noBackground.disabled=true;
  var A = AnnotatorList[index];
  A.backgroundImg = null;
  var name = document.getElementById(`fileName${index}`);
  name.innerHTML = "No File Uploaded";
  drawDiagramAgain(A);
}


function uploadImageTrampoline(index){
  var fileInput = document.getElementById(`imageUpload${index}`);
  fileInput.click();
}

function uploadSourceTrampoline(index){
  var fileInput = document.getElementById(`sourceUpload${index}`);
  fileInput.click();
}


function tabUpload( index ){
  return `
  <h3 style='margin-top:10px;'>Upload</h3>
  Upload an image to use as a background for your diagram.<br><br>
  <div>
  <button id='noBackground${index}' onclick='removeBackground(${index})' disabled>No Background</button>
  <label for="fileUpload${index}" class="fileUpload">
    <button onclick='uploadImageTrampoline(${index})'>New Background</button>
  </label>
  <span id='fileName${index}'>No File Uploaded yet.</span>
  </div><br>
  Upload a diagram spec to replace this diagram.<br><br>
  <button onclick='uploadSourceTrampoline(${index})'>Load Spec</button> - Use a Scorpio spec you made earlier.
  <div style='display:none'>
  <input id='imageUpload${index}' type='file' onChange="acceptImage(this,${index})"/>
  <br><img id="uploadedImg${index}" src="#"></img>
  <img id="internalImg${index}" onload="acceptInternalImage(${index})" src="#"></img>
  <input id='sourceUpload${index}' type='file' onChange="acceptSource(this,${index})"/>
  </div>
  `
}


function tabbedContent( index ){
  str = "";
  str += tabHotspots( index );
  str += tabController( index );
  str += tabUpload( index );
  str += tabEdit( index );
  str += tabDownload( index );
  return str;
}


function updateSize( index, value ){
  //console.log( "Size ", value);
  var A = AnnotatorList[ index ];
  var obj = A.RootObject;
  obj.content[1].size = value;
  updateSource( index )
  drawDiagramAgain(A);
}

function updateRotate( index, value ){
  //console.log( "Rotate ", value * 5);
  var A = AnnotatorList[ index ];
  var obj = A.RootObject;
  obj.content[1].rotate = value * 5;
  updateSource( index )
  drawDiagramAgain(A);
}


// Constructs an Annotator object
// An Annototor object deals with one diagram on one canvas.
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

    A.HotspotsCanvas.ctx = A.HotspotsCanvas.getContext('2d');
    A.BackingCanvas.ctx = A.BackingCanvas.getContext('2d');
    A.FocusCanvas.ctx = A.FocusCanvas.getContext('2d');
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
    if(getArg('bonus')){
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
    A.ToolsDiv = document.createElement("div");
    A.ToolHeaderDiv = document.createElement("div");
    A.ToolHotspotsDiv = document.createElement("div");
    A.ToolControllerDiv = document.createElement("div");
    A.ToolEditDiv = document.createElement("div");
    A.ToolDownloadDiv = document.createElement("div");
    A.ToolUploadDiv = document.createElement("div");

    // InfoCard div floats above the white-out
    A.InfoCardDiv = document.createElement("div");

    A.SidePanelDiv.className = "SidePanelDiv";
    A.SidePanelDiv.innerHTML = tabbedContent();//"Nothing here yet, folks.";

    A.CaptionDiv.className = "CaptionDiv";
    A.CaptionDiv.innerHTML = "<em>No Hotspot Zones Loaded (Yet)</em>";

    A.ToolsDiv.className="ToolsDiv DarkDiv"
    A.MainDiv.className="MainDiv"
    A.BackingCanvas.className="ScorpioCanvas";
    A.FocusCanvas.className="ScorpioCanvas";
    A.HotspotsCanvas.className="ScorpioCanvas";

    var index = A.index;
    A.ToolHeaderDiv.innerHTML = tabbedHeader( index );
    A.ToolHotspotsDiv.innerHTML = tabHotspots( index );
    A.ToolControllerDiv.innerHTML = tabController( index );
    A.ToolEditDiv.innerHTML = tabEdit( index );
    A.ToolDownloadDiv.innerHTML = tabDownload( index );
    A.ToolUploadDiv.innerHTML = tabUpload( index );

    A.ToolHeaderDiv.id = "Header"+index;
    A.ToolHotspotsDiv.id = "Hotspots"+index;
    A.ToolControllerDiv.id = "Controller"+index;
    A.ToolEditDiv.id = "Edit"+index;
    A.ToolDownloadDiv.id = "Download"+index;
    A.ToolUploadDiv.id = "Upload"+index;

    //A.ToolHeaderDiv.className = "tabcontent";
    A.ToolHotspotsDiv.className = "tabcontent active";
    A.ToolControllerDiv.className = "tabcontent";
    A.ToolEditDiv.className = "tabcontent";
    A.ToolDownloadDiv.className = "tabcontent";
    A.ToolUploadDiv.className = "tabcontent";
    A.ToolHotspotsDiv.style.display = 'block';

    var p;

    p = A.FocusCanvas;
    p.toolkitIndex = A.index;
    p.onmousemove = onMouseMove;
    p.onmouseout = onMouseOut;
    p.onclick = onFocusClicked;
    p.onmouseup = onMouseUp;
    p.onmousedown = onMouseDown;
    p.ondblclick = onFocusDoubleClick;
    p.onwheel = onMouseWheel;

    //A.InfoCardDiv.innerHTML = "Some Text";

    A.InfoCardDiv.className="InfoCardDiv DarkDiv";

    A.InfoCardHideTime = 0;
    A.InfoCardUpdateDelay = 0;
    A.InfoCardDivFrozen = false; // frozen = don't hide.
    A.InfoCardPos = Vector2d(0,0);

    p = contentHere;
    p.appendChild(A.MainDiv);
//    p.appendChild(A.SidePanelDiv);

    p = A.MainDiv;
    p.appendChild(A.BackingCanvas);
    p.appendChild(A.FocusCanvas);
    p.appendChild(A.InfoCardDiv);
    p.appendChild(A.CaptionDiv);
    p.appendChild(A.ToolsDiv);

    p = A.ToolsDiv;
    p.appendChild(A.ToolHeaderDiv);
    var q = document.createElement("div");  
    q.className="Scroller DarkDiv"
    p.appendChild(q);
    p = q;
    p.appendChild(A.ToolHotspotsDiv);
    p.appendChild(A.ToolControllerDiv);
    p.appendChild(A.ToolEditDiv);
    p.appendChild(A.ToolDownloadDiv);
    p.appendChild(A.ToolUploadDiv);







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
  detailIsShown(){
    var A = this;
    return A.InfoCardDivFrozen || ( A.InfoCardHideTime <= 0);
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

  // This function is called without any preceeding delay.
  showOrHideTip( actions){
    var A = this;
    var newContent = "";
    if( actions.Tip ){
      newContent = Markdown_Fmt.htmlOf(actions.Tip);
    } 
    
    if( A.RichToolTipContent != newContent){
      A.RichToolTipContent = newContent;
      A.InfoCardUpdateDelay = 10;
      A.InfoCardDivFrozen = false;
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
      var c2 = colourTupleOfJsonString(c);
      var clicker = "onmouseover='drawHotShape("+A.index+",\"draw\","+c+")'" +
        " onmouseout='drawHotShape("+A.index+",\"clear\")'";
      var textColor = textColourToContrastWithColourTuple(c2);
      str += "<tr><td style='vertical-align:top;padding:5px;padding-left:0px'>" +
        "<div style='width:30px;height:30px;color:" + textColor +
        ";border:thin solid black;text-align:center;vertical-align:middle;" +
        "line-height:30px;background-color:" + rgbOfColourTuple(c2) + "' "+clicker+">" + (i-1) +
        "</div></td><td  style='padding:5px'>" + card + "</td></tr>";
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

    caption = escapeEmoji( caption );
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
    A.InfoCardHideTime = 10; 
    A.InfoCardUpdateDelay = 0; 
    // State that we are showing something.
    A.Status.Zone = 10000;
  }
  else if( !A.InfoCardDivFrozen){
    A.InfoCardDiv.style.display = "none";
    A.InfoCardHideTime = 0;
    A.InfoCardUpdateDelay = 0; 
    A.Status.Zone = -1;
  }
  A.InfoCardDivFrozen = false;
  A.Cursor = "spot";
  A.dragObj = undefined;
  e.target.style.cursor = 'auto';
}

function onMouseUp( e ){
  var index = e.target.toolkitIndex;
  var A = AnnotatorList[index];
  window.getSelection().empty();

  e.target.style.cursor = 'auto';
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
    A.InfoCardDivFrozen = true;
    A.showOrHideTip( actions );
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
  e.preventDefault();
  var index = e.target.toolkitIndex;
  var A = AnnotatorList[index];
  A.zoom = Math.sign(e.deltaY);

  if( !A.latestActions )
    return;

  var actions = A.latestActions;

  if( actions.Zoom ){
    obeyCode( A,actions.Zoom );
  }

  console.log(A.zoom);
};

function enterNewZone(A){
  var actions = A.latestActions;
  A.Highlight = "%none";
  // Update the detail div
  if( !A.InfoCardDivFrozen )
    A.showOrHideTip( actions);
  // Do any additional hover action
  if( actions.Hover ){
    obeyCode( A,actions.Hover );
  }
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
    enterNewZone(A);
    if( !actions.Down )
      e.target.style.cursor = actions.Click ? 'pointer' : 'auto';
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

function doDownloadImage(index){
  var A = AnnotatorList[index];
  if( !A.Status.isAppReady ) return;
  var dataUrl = A.BackingCanvas.toDataURL("image/png");
  //alert( "Download! "+dataUrl);
  Loader.downloadDurl( A.SpecName + ".png" , dataUrl );
}

function doDownloadSource( index ){
  var A = AnnotatorList[index];
  if( !A.Status.isAppReady ) return;
  var str = getTextVersion( index );
  var dataUrl = Loader.durlOfText( str );
  //alert( "Download! "+dataUrl);
  Loader.downloadDurl( A.SpecName + ".txt" , dataUrl );
  console.log( str );
}

function doDownloadJavascript( index ){
  var A = AnnotatorList[index];
  if( !A.Status.isAppReady ) return;
  var str = getJavascriptVersion( index );
  var dataUrl = Loader.durlOfText( str );
  //alert( "Download! "+dataUrl);
  Loader.downloadDurl( A.SpecName + ".json" , dataUrl );
  console.log( str );
}


function setTextVersion( index, spec ){
  var A = AnnotatorList[index];
  if( !A )
    return;
  handleNewData( A, spec );  
}

function getTextVersion( index ){
  var A = AnnotatorList[index];
  var str = "Nothing Found";
  for( var obj of A.RootObject.content ){
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

