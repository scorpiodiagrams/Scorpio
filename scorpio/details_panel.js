
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
    <input type="range" min="35" max="250" value="100" class="slider" style="width:200px" id="size${index}" oninput="DetailsPanel.updateSize(${index},this.value)"><br>
    <span style="width:70px;display:inline-block;">Rotate:</span>
    <input type="range" min="-36" max="36" value="0" class="slider" style="width:200px" id="rotate${index}" oninput="DetailsPanel.updateRotate(${index},this.value)"><br>
    <span style="width:70px;display:inline-block;">Animate:</span>
    <input type="range" min="0" max="100" value="0" class="slider" style="width:200px" id="animate${index}" oninput="DetailsPanel.updateAnimate(${index},this.value)">
  </div>`  
  },
  tabEdit( index ){
    return `
    <h3 style='margin-top:10px;'>Edit</h3>
    <p>Edit ye the stuff</p>
  <button onclick='Editor.editSource(${index})'>Edit!</button>
  `
  },
  tabDownload( index ){
    return `
    <h3 style='margin-top:10px;'>Download</h3>
    <p>Download a copy of the diagram.
    </p>
    <button onclick='DetailsPanel.downloadImage(${index})'>Image</button> - Download a .png of the diagram.<br>
    <button onclick='DetailsPanel.downloadImage(${index},1)'>Diagram Spec</button> - Download a text version of the diagram.<br>
    <button onclick='DetailsPanel.downloadImage(${index},2)'>HTML Snippet</button> - Download an .html file you can open in a browser.
    `
  },
  tabUpload( index ){
    return `
    <h3 style='margin-top:10px;'>Upload</h3>
    Upload an image to use as a background for your diagram.<br><br>
    <div>
    <button id='noBackground${index}' onclick='DetailsPanel.removeBackground(${index})' disabled>No Background</button>
    <label for="fileUpload${index}" class="fileUpload">
      <button onclick='DetailsPanel.uploadImageTrampoline(${index})'>New Background</button>
    </label>
    <span id='fileName${index}'>No File Uploaded yet.</span>
    </div><br>
    Upload a diagram spec to replace this diagram.<br><br>
    <button onclick='DetailsPanel.uploadSourceTrampoline(${index})'>Load Spec</button> - Use a Scorpio spec you made earlier.
    <div style='display:none'>
    <input id='imageUpload${index}' type='file' onChange="acceptImage(this,${index})"/>
    <br><img id="uploadedImg${index}" src="#"></img>
    <img id="internalImg${index}" onload="DetailsPanel.acceptInternalImage(${index})" src="#"></img>
    <input id='sourceUpload${index}' type='file' onChange="DetailsPanel.acceptSource(this,${index})"/>
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
    var A = AnnotatorList[ index ];
    var obj = A.RootObject;
    obj.content[1].size = value;
    Editor.updateSource( index )
    drawDiagramAgain(A);
  },
  updateRotate( index, value ){
    //console.log( "Rotate ", value * 5);
    var A = AnnotatorList[ index ];
    var obj = A.RootObject;
    obj.content[1].rotate = value * 5;
    Editor.updateSource( index )
    drawDiagramAgain(A);
  },
  updateAnimate( index, value ){
    var A = AnnotatorList[ index ];
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
    if( mode == 1)
      this.doDownloadSource(index);
    else if( mode == 2)
      this.doDownloadSnippet(index);
    else if( mode == 3)
      this.doDownloadJavascript(index);
    else
      this.doDownloadImage(index);
  },
  doDownloadImage(index){
    var A = AnnotatorList[index];
    if( !A.Status.isAppReady ) return;
    var dataUrl = A.BackingCanvas.toDataURL("image/png");
    //alert( "Download! "+dataUrl);
    Loader.downloadDurl( A.SpecName + ".png" , dataUrl );
  },
  doDownloadSource( index ){
    var A = AnnotatorList[index];
    if( !A.Status.isAppReady ) return;
    var str = getTextVersion( index );
    var dataUrl = Loader.durlOfText( str );
    //alert( "Download! "+dataUrl);
    Loader.downloadDurl( A.SpecName + ".txt" , dataUrl );
    console.log( str );
  },
  doDownloadSnippet( index ){
    var A = AnnotatorList[index];
    if( !A.Status.isAppReady ) return;
    var str = getTextVersion( index );
    str = str.replace(/\\/g,"\\\\");
    str =
  `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <script data-cfasync="false" src="http://www.scorpiodiagrams.com/scorpio/jsloader.js"></script>
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
  doDownloadJavascript( index ){
    var A = AnnotatorList[index];
    if( !A.Status.isAppReady ) return;
    var str = getJavascriptVersion( index );
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
  },
  acceptSource(fileTag, index ){
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
  },
  acceptInternalImage( index ){
    var A = AnnotatorList[index];
    A.internalImg = document.getElementById(`internalImg${index}`);
    A.receivedBackground = A.requestedBackground;
    drawDiagramAgain( A );
  },
  removeBackground(index){
    var noBackground = document.getElementById(`noBackground${index}`);
    noBackground.disabled=true;
    var A = AnnotatorList[index];
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
