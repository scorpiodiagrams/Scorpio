// Boring functions that work with the dom/html.
function DomUtils(){
  // DomUtils knows how to manipulate the dom.
  // It hides most of the html specific stuff.
  // It keeps a list of surfaces (Diagram Canvases).
  this.surfaces = {};
  return this;
}

DomUtils.prototype ={

  // From w3Schools.  
  dragMouseDown(elt) {
    e = window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt = elt.parentElement;
    document.onmouseup = DomUtils.closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = DomUtils.elementDrag;
  },
  elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  },
  closeDragElement() {
    // stop moving when mouse button is released:
    elmnt = null;
    document.onmouseup = null;
    document.onmousemove = RR.infoCardMove;
  },
  escapeEmoji( str ){
    // italics for non unicode characters.    
    return str.replace(/([^\u0000-\u00ff]+)/g, "<span class='emoji'>$1</span>");
  },
  openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    var id = +(tabName.match(/\D*(\d*)/)[1]);
    var id2;
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      id2 = +(tabcontent[i].id.match(/\D*(\d*)/)[1]);
      if( id == id2 )
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      id2 = +(tablinks[i].id.match(/\D*(\d*)/)[1]);
      if( id == id2 )
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
  },
  setFavicon( icon ){
    var link = document.querySelector("link[rel~='icon']");
    link.href = icon;
  },   
  setSize( what, size ){
    if( typeof what == "string")
      what = document.getElementById(what);
    what.style.width = size.x + "px";
    what.style.height = size.y + "px";
    return what;
  },
  setAtOrigin( what ){
    if( typeof what == "string")
      what = document.getElementById(what);
    what.style.position = "absolute";
    what.style.left = "0px";
    what.style.top = "0px";
    return what;
  },
  scrollToDiv( name ){
    if( !name ){
      scrollTo(0,0);
      return;
    }
    var div = document.getElementById(name)
    if( !div ){
      //return;
      // Alternative code that tells you about a missing link..
      var text = `### ${name} not found
        May need information from a different document`
      RR.changeTipText( RR.infoCardPos(), Markdown_Fmt.htmlOf(text) );
      return;
    }
    div.scrollIntoView({behavior:'smooth',block:"center"});
  },
  initDiagramDiv( name,size ){
    //if( typeof what == "string")
    //   what = document.getElementById(what);
    this.surfaces[name] = new DiagramCanvas( name, size);
  },
  newCanvas( size ){
    var s = {};
    s.canvas = document.createElement("canvas");
    this.setAtOrigin( s.canvas );
    s.canvas.width = size.x;
    s.canvas.height = size.y;
    s.ctx = s.canvas.getContext('2d', {willReadFrequently: true});
    return s;
  },
  getChecked( what ){
    var div = document.getElementById(what);
    return div.checked;
  },
  toggleChecked( what ){
    var div = document.getElementById(what);
    div.style.checked = !div.style.checked;
  },
  toggleVisibility( what ){
    var div = document.getElementById(what);
    div.style.display = (div.style.display==='none')? 'inline-block':'none';
  },
  toggleVisibility2( what ){
    var div = document.getElementById(what);
    var show;
    if( div ){
      show = (div.style.display==='none');
      div.style.display = show ? 'block':'none';
    }
    
    div = document.getElementById(what+'y');
    show = (div.style.display!=='none');
    div.style.display = !show ? 'inline':'none';
    div = document.getElementById(what+'n');
    div.style.display = show ? 'inline':'none';
  },
  setVisibility( what, show ){
    var div = document.getElementById(what);
    if( div )
      div.style.display = show ? 'inline-block':'none';
  },
  getValue( what ){
    var div = document.getElementById(what);
    return div.value;
  },
  setValue( what, value){
    var div = document.getElementById(what);
    if( div )
      div.value = value;
  },
  setAttr( what, attr, value){
    var div = document.getElementById(what);
    if( div )
      div[attr] = value;
  },  
  set( what, value){
    var div = document.getElementById(what);
    div.innerHTML = value;
  },
  getSetting( name){
    return "// "+ name + ": "+(this.getChecked( name )?"Yes":"No")+"\n";
  },
  get2dCtx( name ){
    return this.surfaces[ name ].draw.ctx;
  },
  get2dCanvas( name ){
    return this.surfaces[ name ].draw.canvas;
  },
  getArg(arg){
    var line = window.location.href;
    line = "&" + line.split('?')[1] || "";
    line = line.split('&' + arg + '=')[1] || "";
    line = (line + '&').split('&')[0];
    return line;
  },
  getAnchor(){
    var line = window.location.href;
    line = line.split('#')[1] || "";
    return line;
  },
}

DomUtils = new DomUtils();

