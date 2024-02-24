// Multiscroller format allows multiscrollers to be added.
function Multiscroller_Fmt(){
  return this;
}

CodeBrowse = 
{ 
   MultiScroller: {
     Where: "CanvasSurface",
     Cols: [
       { 
         Name: "Files",
         DataSource: 1,
         Location: { x:0,y:0},
         ColCardSize: {x: {min:30,max:30}, y:{min:1,max:1}},
         ColCardStyling: {
           Margin:10, 
           Transparency: 0, 
           Border:5, 
           color:"#ddd"},
        OnHover: "&Nop",
        Layout: 0,
        Wrap: true
       },
       { 
         Name: "Functions",
         DataSource: 2,
         Location: { x:30,y:0},
         ColCardSize: {x: {min:30,max:30}, y:{min:1,max:1}},
         ColCardStyling: {
           Margin:10, 
           Transparency: 0, 
           Border:5, 
           color:"#ddd"},
        OnHover: "&Nop",
        Layout: 0,
        Wrap: true         
       },
       { 
         Name: "Instructions",
         DataSource: 3,
         Location: { x:60,y:0},
         ColCardSize: {x: {min:10,max:120}, y:{min:1,max:1}},
         ColCardStyling: {
           Margin:10, 
           Transparency: 0, 
           Border:5, 
           color:"#ddd"},
        OnHover: "&Nop",
        Layout: 0,
        Wrap: true
       },
    ]
   } 
};

Multiscroller_Fmt.prototype ={
  name : "Multiscroller",
  _progs : [] ,

  debug(A,url,text){
    alert( url );
  },

  splitUrl(url) {
    if( !url )
      return;

    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    const regexResult = /^\/?(.*\/)?(.*?)\.(\w+)$/.exec(pathname);

    if (regexResult) {
      const [_, prefix, fileName, fileSuffix] = regexResult;

      return {
        prefix: prefix || '',
        fileName: fileName,
        fileSuffix: fileSuffix
      };
    } else {
      return null;
    }
  },

  showMultiscroller( text ){
    var A=window.Multiscroller || {};
    var newContent = text;//Markdown_Fmt.htmlOf( text );
    
    if( A.MultiscrollerContent != newContent){
      A.MultiscrollerContent = newContent;

      if( !A.MultiscrollerDiv ){
        A.MultiscrollerDiv = document.createElement("pre");
        A.MultiscrollerDiv.style.width = '100%';
        A.MultiscrollerDiv.style.height = '100%';
    
        A.MultiscrollerDiv.className="SidebarDiv";
        A.MultiscrollerPos = Vector2d(0,0);
        var box = document.body;
        box.appendChild(A.MultiscrollerDiv);
      }

      A.MultiscrollerDiv.innerText = A.MultiscrollerContent;
      //A.MultiscrollerDiv.style.display = "block";
      if( isDefined( A.MultiscrollerPos.x ))
        A.MultiscrollerDiv.style.left = A.MultiscrollerPos.x + "px";
    } 
    window.Multiscroller = A;
    A.MultiscrollerDiv.style.display  = (text !== '') ? 'block' :'none';
    //positionInfoCard( Vector2d( 10,50 ));
  },

  /**
   * Loads one source file into an item in the _progs[] array.
   */
  fileLoader( url ){
    var data = this._progs;
    var parts = this.splitUrl( url );
    if( !parts )
      return;

    data.push({ name: parts.filename, value: "", postfix: parts.fileSuffix });
    var nProgs = data.length;
    var txtFile = new XMLHttpRequest();
    txtFile.onreadystatechange = function(){
      if( this.readyState === 4 && this.status == 200 ){
        data[nProgs - 1].value = this.responseText;
      }
    };

    txtFile.open("GET", url, true);
    txtFile.send();
  },

  InitFromScripts(){
    var n = document.scripts.length;
    var text = "Scripts:";
    var show = this.showMultiscroller;
    // we ignore the first script, which is KaTeX
    // we ignore th last script, which is a local unnamed script.
    var numScripts = n-2;
    function scriptArrives( A, url, text ){
      console.log(  ' ' + numScripts + ' ' + url);
      numScripts--;
      if( numScripts > 0)
        return;
      //text = text.split( /\r?\n/).join( "<br>\r\n");
      console.log( "showing\r\n"+text)
      RR.showSidebar("")
      show( text )
    }
    for( var i=1;i<n;i++)
    {
      Loader.loadFromUrl( "foo", document.scripts[i].src, scriptArrives )
    }
  },

  makeScroller(){
    var str = "";
    str = `<`
  },

  htmlOf( str ){
    str = str || "No Multiscroller";
    str += CodeBrowse.MultiScroller.Cols[2].Name;
    str = `<div class="raw" style="width:550px;height:600px;">${str}</div>\r\n\r\n`;
    return str;
  }

}

Multiscroller_Fmt = new Multiscroller_Fmt();
Registrar.register( Multiscroller_Fmt );

