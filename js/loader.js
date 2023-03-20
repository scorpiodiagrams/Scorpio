// loader is a module to load text and then when the text arrives do 
// something with it.
// It also can provide data for download.
function Loader(){
  return this;
}

Loader.prototype ={

  debug(A,url,text){
    alert( url );
  },
  loadFromUrl(A, url, fn){
    fn = fn || this.debug;
    var txtFile = new XMLHttpRequest();
    // CDNs and Varnish should give us the very latest.
    txtFile.onreadystatechange = function(){
      if( this.readyState === 4 && this.status === 200 ){
        // data.push({ action: action, value: this.responseText});
        fn(A,url,this.responseText);
      }
    };

    txtFile.open("GET", url, true);
    //txtFile.setRequestHeader( "Cache-Control", "s-maxage=0" );
    txtFile.send();
  },


  /**
   * A Durl is a Data URL.  For example, an image represented as a Base64 URL
   * string.
   */

  /**
   * Converts a string to a durl
   * @returns {string}
   */
  durlOfText( text ){
    return "data:application/txt," + encodeURIComponent(text);
  },
  /**
   * Converts the current annotated image region into a Durl.
   * @returns {string}
   */
  durlOfAnnotatedImage(){
    var new_canvas = document.createElement('canvas');
    new_canvas.width = Annotated.width;
    new_canvas.height = Annotated.height;
    var ctx = new_canvas.canvas.getContext('2d', {willReadFrequently: true});
    ctx.fillStyle = 'blue';
    ctx.fillRect(5, 5, 70, 70);
    ctx.drawImage(Gui.Ctx.canvas, Annotated.x, Annotated.y, Annotated.width,
      Annotated.height, 0, 0, Annotated.width, Annotated.height);
    var data = ctx.canvas.toDataURL("image/png");
    /* Change MIME type to trick the browser to download the file instead of
     displaying it */
    data = data.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
    return data;
  },
  downloadDurl( name, durl ){
    var link = document.createElement('a');
    link.download = name;
    link.href =  durl;
    link.click();
  },


}

Loader = new Loader();

function wikiWordsArrive(A, url, text)
{
  console.log( "Processing new spec from "+url);
  Markdown_Fmt.hasBigLogo = false;
  var module = Omnia_Fmt;
  var str = module.htmlOf( text );
  DomUtils.set( "div_output", str );
  // sets value, if the div is present.
  DomUtils.setValue( "raw_output", text );
  module.afterLoading( {"fmt_init":true});
}

function sidebarArrives(A, url, text)
{
  console.log( "Processing sidebar from "+url);
  Markdown_Fmt.hasBigLogo = false;
  var module = Registrar.modules.Omnia;
  var pieces = text.split( /\r?\n/g);
  var text = pieces.join( "\r\n");
  var str = module.htmlOfBlock( 'Polyglot', text );
//  str = "<div class='outer'><div class='nut_content'>" + str +"</div></div>";
//  var str = module.htmlOf( text );
  showSidebar( str );
  // sets value, if the div is present.
  //DomUtils.setValue( "raw_output", text );
  //module.afterLoading( {"fmt_init":true});
}

function loadSource( source )
{
  if( !source.match( /^([a-z_0-9A-Z\.])*\.md$/) )
    return;
  console.log( "Request to load: "+source);
  Loader.loadFromUrl( "foo", Registrar.wikiSrc+source, wikiWordsArrive);
}

function loadSidebar( source ){
  console.log( "Request to load sidebar: "+source);
  Loader.loadFromUrl( "foo", Registrar.wikiSrc+source, sidebarArrives);
}

function readFromText()
{
  var text = "\n"+ DomUtils.getValue( "raw_output" );
  text = text.replace( /\n/g, "\r\n");
  wikiWordsArrive( "foo", "foo", text);
}

function openAllNutshells()
{
  var nuts = document.querySelectorAll(".nutshell-bubble");
  for (var i = 0; i < nuts.length; i++) {
    nuts[i].style.display = 'inline-block';
  }  
}

function closeAllNutshells()
{
  var nuts = document.querySelectorAll(".nutshell-bubble");
  for (var i = 0; i < nuts.length; i++) {
    nuts[i].style.display = 'none';
  }  
}