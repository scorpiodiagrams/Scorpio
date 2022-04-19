
var elmnt = null;
// From w3Schools.  Move to DomUtils?
function dragMouseDown(elt) {
  e = window.event;
  e.preventDefault();
  // get the mouse cursor position at startup:
  pos3 = e.clientX;
  pos4 = e.clientY;
  elmnt = elt.parentElement;
  document.onmouseup = closeDragElement;
  // call a function whenever the cursor moves:
  document.onmousemove = elementDrag;
}

function elementDrag(e) {
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
}

function closeDragElement() {
  // stop moving when mouse button is released:
  elmnt = null;
  document.onmouseup = null;
  document.onmousemove = null;
}


// Editor format allows LaTeX embedded in a markdown doc.
function Editor_Fmt(){
  return this;
}


function resizeEditor(){
  var box = document.getElementById("editor_box");
  if(!box)
    return;
  var parent = box.parentElement;
  parent.style.width = (box.offsetWidth + 10)+"px";
  parent.style.height = (box.offsetHeight + box.offsetTop + 5)+"px";
}

function showEditor( show ){
  var box = document.getElementById("editor_box");
  if(!box)
    return;
  var parent = box.parentElement;
  parent.style.display = show ? "block" : "none";
}

function setEditorTitle( str ){
  var box = document.getElementById("editor_title_bar");
  if(!box)
    return;
  box.innerHTML = str;
}

function textChanged( evt ){
  if( !isDefined( Editor_Fmt.boxIndex ))
    return;
  setTextVersion( Editor_Fmt.boxIndex, "!!Scorpio"+evt.value );
}


function updateSource( index ){
  var box = document.getElementById("editor_box");
  if(!box){
    return false;
  }
  Editor_Fmt.boxIndex = index;
  var str = getTextVersion( index );
  box.value = str;
  return true;
}

function editSource( index ){
  showEditor( true );
  if( updateSource( index ))
    return;
  alert( "Create an edit box!!");
}  


function closeButtonHtml()
{
  return '<span class="close_button" onclick="showEditor(false)">&#10006;</span>';
}

Editor_Fmt.prototype ={
  name : "Editor",
  outro : "",

  debug(A,url,text){
    alert( url );
  },
  htmlOfEditorWidget(){
    var str;
    // This line is needed for auto resizing.
    this.editorReady = true;
    str = '<textarea id="editor_box" spellcheck="false" oninput="textChanged(this);" style="margin:5px;min-width:200px;min-height:300px;'
      +'width:29em;height:45.2em;">' 
      + str + '</textarea>';
    str = "<div class='popup' id='editor' style='text-align:left;top:10px;left:800px;display:none;'><div class='grab_bar' id='editor_grab_bar' onmousedown='dragMouseDown(this)'><span class='title_bar' id='editor_title_bar'>Title</span>"+closeButtonHtml()+ "</div>" + str + "</div>";
    return str    
  },
  htmlOf( str ){
    return Raw_Fmt.htmlOf( str ) + this.outro;
  },
  click( what, item ){
    console.log( what.id, " at ", item, " says ", this.vocab[item].definition );
    // Click happens after checked has been updated.
    this.vocab[item].checked = what.checked;
    this.nCardsLogical += what.checked ? -1 : +1;
    this.logicalCard = this.logicalPosOfCard( item );
    this.card = item;
    this.showCardCounter();
    this.showCard();
  },
  afterLoading(){
    if( !this.editorReady)
      return;
    new ResizeObserver(resizeEditor).observe(editor_box)
    this.editorReady = false;// for next time.
  }

}

Editor_Fmt = new Editor_Fmt();
Registrar.register( Editor_Fmt );

