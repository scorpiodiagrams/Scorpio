


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

  tabbedHeader( index ){
    return `
  <div class="tab">
    <button class="tablinks active" id="HeaderHotspots${index}" onclick="DomUtils.openTab(event, 'Hotspots${index}')">Hotspots</button>
    <button class="tablinks" id="HeaderController${index}" onclick="DomUtils.openTab(event, 'Controller${index}')">Controller</button>
    <button class="tablinks" id="HeaderEdit${index}" onclick="DomUtils.openTab(event, 'Edit${index}')">Edit</button>
    <button class="tablinks" id="HeaderDownload${index}" onclick="DomUtils.openTab(event, 'Download${index}')">Download</button>
    <button class="tablinks" id="HeaderUpload${index}" onclick="DomUtils.openTab(event, 'Upload${index}')">Upload</button>
  </div>`
  },
  tabHotspots( index ){
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
    var Extras = RR.PolyHelper.htmlOf2( 
`> [!cinfo]- *Some title or other*
This is what is in the block.
Loadsa text)
`
      )
    return `
    <h3 style='margin-top:10px;'>Edit</h3>
    ${Extras}
    <p>Edit ye the stuff</p>
  <button onclick='Editor.editSource(${index})'>Edit!</button>
  `
  },
  tabDownload( index ){
    return `
    <h3 style='margin-top:10px;'>Download</h3>
    <p>Download a copy of the diagram.
    </p>
    <button onclick='OnFns.downloadImage(${index},2)'>HTML Snippet</button> - Download an .html file you can open in a browser.<br>
    <button onclick='OnFns.downloadImage(${index},1)'>Diagram Spec</button> - Download a text version of the diagram.<br>
    <button onclick='OnFns.downloadImage(${index})'>Image</button> - Download a .png of the diagram.
    `
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
    str += tabHotspots( index );
    str += tabController( index );
    str += tabUpload( index );
    str += tabEdit( index );
    str += tabDownload( index );
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

  makeDivs( A ){
    A.ToolsDiv = document.createElement("div");
    A.ToolHeaderDiv = document.createElement("div");
    A.ToolHotspotsDiv = document.createElement("div");
    A.ToolControllerDiv = document.createElement("div");
    A.ToolEditDiv = document.createElement("div");
    A.ToolDownloadDiv = document.createElement("div");
    A.ToolUploadDiv = document.createElement("div");

    var index = A.index;
    A.ToolsDiv.className="ToolsDiv DarkDiv"
    A.ToolHeaderDiv.innerHTML = this.tabbedHeader( index );
    A.ToolHotspotsDiv.innerHTML = this.tabHotspots( index );
    A.ToolControllerDiv.innerHTML = this.tabController( index );
    A.ToolEditDiv.innerHTML = this.tabEdit( index );
    A.ToolDownloadDiv.innerHTML = this.tabDownload( index );
    A.ToolUploadDiv.innerHTML = this.tabUpload( index );

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
  },
  appendDivs( A ){
    this.makeDivs(A);
    var p = A.MainDiv;    
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
  }
}

DetailsPanel = new DetailsPanel();


Exports();

return metaData;
}( Registrar );// end of details_panel_js
