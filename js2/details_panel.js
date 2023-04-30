


Registrar.js.details_panel_js = function( Registrar ){

var metaData = 
{ 
  version: "2023-04",
  docString: "Details Panel (below the diagrams)"
};

// Imports
var Annotators = RR.Annotators;

function Exports(){
  RR.appendDetailsPanelDivs = function(A){
    return DetailsPanel.appendDivs(A);};
  var DD = DetailsPanel;
  RR.toolboxString = DD.toolboxString;
  RR.tabHotspots = DD.tabHotspots;
  // These are for the DOM elements we create.
  // They are not used more widely.
  OnFns.updateSize = DD.updateSize; 
  OnFns.updateRotate = DD.updateRotate; 
  OnFns.updateAnimate = DD.updateAnimate; 
  OnFns.downloadImage = DD.downloadImage; 
  OnFns.removeBackground = DD.removeBackground; 
  OnFns.uploadImageTrampoline = DD.uploadImageTrampoline; 
  OnFns.uploadSourceTrampoline = DD.uploadSourceTrampoline; 
  OnFns.acceptImage = DD.acceptImage; 
  OnFns.acceptInternalImage = DD.acceptInternalImage; 
  OnFns.acceptSource = DD.acceptSource; 
}

/*
Intention:
Move all the hard coded strings into one section.
Upgrade the way we make the elements, so that it can all be
driven off of a markdown document.
*/

function DetailsPanel(){
  return this;
}

DetailsPanel.prototype ={

  tabHeader( index ){
    return RR.PolyHelper.htmlOf2( 
`#Tabs( ${index}, Hotspots, Controller, Edit, Download, Upload )`
    );
  },
  tabHotspots( index ){
    var A = Annotators.AOfIndex(index);
    if( A.Caption ){
      var contents = A.makeToc();
      var text = A.makeRainbowBox() +
        "<hr>" +
        contents;
      return text;
    }

    return `
    <h3 style='margin-top:10px;'>Hotspots</h3>
    <p>A list of all the what's that comments</p>`
  },
  tabController( index ){
    return `
    <h3 style='margin-top:10px;'>Controller</h3>
    <p>Here be mighty fine controllers for diverse things</p>
  <div class="slidecontainer">
    <span style="width:70px;display:inline-block;">Size:</span>
    <input type="range" min="35" max="250" value="100" class="slider" style="width:200px" id="size${index}" oninput="OnFns.updateSize(${index},this.value)"><br>
    <span style="width:70px;display:inline-block;">Rotate:</span>
    <input type="range" min="-36" max="36" value="0" class="slider" style="width:200px" id="rotate${index}" oninput="OnFns.updateRotate(${index},this.value)"><br>
    <span style="width:70px;display:inline-block;">Animate:</span>
    <input type="range" min="0" max="100" value="0" class="slider" style="width:200px" id="animate${index}" oninput="OnFns.updateAnimate(${index},this.value)">
  </div>`  
  },
  tabEdit( index ){
    return RR.PolyHelper.htmlOf2( 
`----
### Edit
Edit ye the stuff
#Action( Edit!, Editor.editSource, ${index})
`
    );
  },
  tabDownload( index ){
    return RR.PolyHelper.htmlOf2( 
`----
### Downloads
Download a copy of the diagram.
#Action( HTML Snippet, Editor.editSource, ${index}, 2) - Download an .html file you can open in a browser.
#Action( Diagram Spec, OnFns.downloadImage, ${index},1) - Download a text version of the diagram.
#Action( Image, OnFns.downloadImage, ${index}) - Download a .png of the diagram.
`
    );
  },
  tabUpload( index ){
    return `
    <h3 style='margin-top:10px;'>Upload</h3>
    Upload an image to use as a background for your diagram.<br><br>
    <div>
    <button id='noBackground${index}' onclick='OnFns.removeBackground(${index})' disabled>No Background</button>
    <label for="fileUpload${index}" class="fileUpload">
      <button onclick='OnFns.uploadImageTrampoline(${index})'>New Background</button>
    </label>
    <span id='fileName${index}'>No File Uploaded yet.</span>
    </div><br>
    Upload a diagram spec to replace this diagram.<br><br>
    <button onclick='OnFns.uploadSourceTrampoline(${index})'>Load Spec</button> - Use a Scorpio spec you made earlier.
    <div style='display:none'>
    <input id='imageUpload${index}' type='file' onChange="OnFns.acceptImage(this,${index})"/>
    <br><img id="uploadedImg${index}" src="#"></img>
    <img id="internalImg${index}" onload="OnFns.acceptInternalImage(${index})" src="#"></img>
    <input id='sourceUpload${index}' type='file' onChange="OnFns.acceptSource(this,${index})"/>
    </div>
    `
  },
  tabbedContent( index ){
    str = "";
    str += this.tabHotspots( index );
    str += this.tabController( index );
    str += this.tabUpload( index );
    str += this.tabEdit( index );
    str += this.tabDownload( index );
    return str;
  },

  // Panel functions....
  updateSize( index, value ){
    //console.log( "Size ", value);
    var A = Annotators.AOfIndex(index);
    var obj = A.RootObject;
    obj.content[1].size = value;
    Editor.updateSource( index )
    drawDiagramAgain(A);
  },
  updateRotate( index, value ){
    //console.log( "Rotate ", value * 5);
    var A = Annotators.AOfIndex(index);
    var obj = A.RootObject;
    obj.content[1].rotate = value * 5;
    Editor.updateSource( index )
    drawDiagramAgain(A);
  },
  updateAnimate( index, value ){
    var A = Annotators.AOfIndex(index);
    if( !A.pagesLoaded )
      return;
    var obj = A.RootObject;
    obj.content[1].animate = value;

    var nPages = A.pagesLoaded.length -1 ;
    var newPage = Math.floor(value * nPages/100.001);
    var frac = (value * nPages/100)-newPage;
    if( newPage != A.currentPage)
    {
      A.currentPage = newPage;
      handleNewData(A, A.pagesLoaded[newPage], 0);
      Editor.updateSource( index )
    }
    A.equanimTime = frac;
    drawDiagramAgain(A);
  },
  downloadImage( index, mode ){
    // Don't use 'this' since we may be called without one.
    var DP = DetailsPanel;
    if( mode == 1)
      DP.doDownloadSource(index);
    else if( mode == 2)
      DP.doDownloadSnippet(index);
    else if( mode == 3)
      DP.doDownloadJson(index);
    else
      DP.doDownloadImage(index);
  },
  doDownloadImage(index){
    var A = Annotators.AOfIndex(index);
    if( !A.Status.isAppReady ) return;
    var dataUrl = A.BackingCanvas.toDataURL("image/png");
    //alert( "Download! "+dataUrl);
    Loader.downloadDurl( A.SpecName + ".png" , dataUrl );
  },
  doDownloadSource( index ){
    var A = Annotators.AOfIndex(index);
    if( !A.Status.isAppReady ) return;
    var str = RR.getTextVersion( index );
    var dataUrl = Loader.durlOfText( str );
    //alert( "Download! "+dataUrl);
    Loader.downloadDurl( A.SpecName + ".txt" , dataUrl );
    console.log( str );
  },
  doDownloadSnippet( index ){
    var A = Annotators.AOfIndex(index);
    if( !A.Status.isAppReady ) return;
    var str = RR.getTextVersion( index );
    str = str.replace(/\\/g,"\\\\");
    str =
  `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <script data-cfasync="false" src="http://www.scorpiodiagrams.com/js2/jsloader.js"></script>
      <script type="text/javascript">

        // Load the modules you'll be using...
        scorpio.load('diagrams annotations katex');

        // Set a callback to run when scorpio is ready
        scorpio.setOnLoadCallback(makeDiagram);

        // Callback that makes the diagram
        function makeDiagram() {
          var diagram = new scorpio.diagram();
          diagram.setDiv( document.getElementById( 'diagram_div' ));
          diagram.setSpec(
  \`
  ${str}
  \`
            );
        }
      </script>
    </head>

    <body>
      <!--Div that will hold the diagram-->
      <div id="diagram_div">Diagram is not loaded (yet)</div>
      <br clear=all>
    </body>
  </html>`;
    var dataUrl = Loader.durlOfText( str );
    //alert( "Download! "+dataUrl);
    Loader.downloadDurl( A.SpecName + ".html" , dataUrl );
    console.log( str );
  },
  doDownloadJson( index ){
    var A = Annotators.AOfIndex(index);
    if( !A.Status.isAppReady ) return;
    var str = RR.getJsonVersion( index );
    var dataUrl = Loader.durlOfText( str );
    //alert( "Download! "+dataUrl);
    Loader.downloadDurl( A.SpecName + ".json" , dataUrl );
    console.log( str );
  },
  acceptImage(fileTag, index ){
    if (fileTag.files && fileTag.files[0]) {
      var img = document.getElementById(`uploadedImg${index}`);
      img.onload = () => {
        //alert( `revoked image ${index} object ${img.src}`);
        URL.revokeObjectURL(img.src);  // 
        var A = Annotators.AOfIndex(index);
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
  },
  acceptSource(fileTag, index ){
    if (fileTag.files && fileTag.files[0]) {

      var fileName = fileTag.files[0].name;
      // Uploaded file name... we kind of normalise the name.
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
        var A = Annotators.AOfIndex(index);
        A.SpecName = fileName;
        RR.setTextVersion( index, "!!Scorpio"+reader.result );
  //      var A = Annotators.AOfIndex(index);
  //      A.backgroundImg = img;
  //      drawDiagramAgain(A);
      })
      reader.readAsText(fileTag.files[0]);
    }  
  },
  acceptInternalImage( index ){
    var A = Annotators.AOfIndex(index);
    A.internalImg = document.getElementById(`internalImg${index}`);
    A.receivedBackground = A.requestedBackground;
    drawDiagramAgain( A );
  },
  removeBackground(index){
    var noBackground = document.getElementById(`noBackground${index}`);
    noBackground.disabled=true;
    var A = Annotators.AOfIndex(index);
    A.backgroundImg = null;
    var name = document.getElementById(`fileName${index}`);
    name.innerHTML = "No File Uploaded";
    drawDiagramAgain(A);
  },
  uploadImageTrampoline(index){
    var fileInput = document.getElementById(`imageUpload${index}`);
    fileInput.click();
  },
  uploadSourceTrampoline(index){
    var fileInput = document.getElementById(`sourceUpload${index}`);
    fileInput.click();
  },
  // End of panel functions
  divString( name, index, flag ){
    var content = this[ "tab"+name ]( index );
    var active = flag ? " active":""
    var display = flag ? "block":"none"
    return`
<div id='${name}${index}' class='tabcontent${active}' style='display:${display}'>
${content}
</div>
`
  },
  toolboxPanels(A){
    var index = A.index;
    var DD = DetailsPanel;
    var str = 
      DD.divString( "Hotspots", index, 1 ) +
      DD.divString( "Controller", index, 0 ) +
      DD.divString( "Edit", index, 0 ) +
      DD.divString( "Download", index, 0 ) +
      DD.divString( "Upload", index, 0 );
    return str;
  },
  toolboxString(A ){
    var index = A.index;
    var DD = DetailsPanel;
    var panels = DD.toolboxPanels( A );
    var header = DD.tabHeader( index );
    // can add class DarkDiv    
    str =`
<div id='Header${index}' style='height:400px'>
  ${header}
  <div class='Scroller'>
    ${panels}
  </div>
</div>
`   
    return str;
  },

  makeDivs( A ){
    A.ToolsDiv = document.createElement("div");
    var index = A.index;
    A.ToolsDiv.className="ToolsDiv DarkDiv"
  },
  appendDivs( A ){
    this.makeDivs(A);
    var p = A.MainDiv;    
    p.appendChild(A.ToolsDiv);
    p = A.ToolsDiv;
    p.innerHTML = this.toolboxString(A);
    return;
  }
}

DetailsPanel = new DetailsPanel();

Exports();

return metaData;
}( Registrar );// end of details_panel_js
