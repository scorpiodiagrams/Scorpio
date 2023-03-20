
var elmnt = null;

// Editor format allows LaTeX embedded in a markdown doc.
function Editor_Fmt(){
  return this;
}


Editor_Fmt.prototype ={
  name : "Editor",
  outro : "",

  debug(A,url,text){
    alert( url );
  },
  resizeEditor(){
    var box = document.getElementById("editor_box");
    if(!box)
      return;
    var parent = box.parentElement;
    parent.style.width = (box.offsetWidth + 10)+"px";
    parent.style.height = (box.offsetHeight + box.offsetTop + 5)+"px";
  },
  showEditor( show ){
    var box = document.getElementById("editor_box");
    if(!box)
      return;
    var parent = box.parentElement;
    parent.style.display = show ? "block" : "none";
  },
  setEditorTitle( str ){
    var box = document.getElementById("editor_title_bar");
    if(!box)
      return;
    box.innerHTML = str;
  },
  textChanged( evt ){
    if( !isDefined( Editor_Fmt.boxIndex ))
      return;
    setTextVersion( Editor_Fmt.boxIndex, "!!Scorpio"+evt.value );
  },
  updateSource( index ){
    var box = document.getElementById("editor_box");
    if(!box){
      return false;
    }
    Editor_Fmt.boxIndex = index;
    var str = getTextVersion( index );
    box.value = str;
    return true;
  },
  editSource( index ){
    this.showEditor( true );
    if( this.updateSource( index ))
      return;
    alert( "Create an edit box!!");
  }, 
  closeButtonHtml()
  {
    return '<span class="close_button" onclick="Editor.showEditor(false)">&#10006;</span>';
  },
  htmlOfEditorWidget(){
    var str;
    // This line is needed for auto resizing.
    this.editorReady = true;
    str = '<textarea id="editor_box" spellcheck="false" oninput="Editor.textChanged(this);" style="margin:5px;min-width:200px;min-height:300px;'
      +'width:29em;height:45.2em;">' 
      + str + '</textarea>';
    str = "<div class='popup' id='editor' style='text-align:left;top:10px;left:800px;display:none;'><div class='grab_bar' id='editor_grab_bar' onmousedown='DomUtils.dragMouseDown(this)'><span class='title_bar' id='editor_title_bar'>Title</span>"+this.closeButtonHtml()+ "</div>" + str + "</div>";
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
    new ResizeObserver(this.resizeEditor).observe(editor_box)
    this.editorReady = false;// for next time.
  }

}

Editor_Fmt = new Editor_Fmt();
// Editor is used in a few places ... it needs a name.
Editor = Editor_Fmt;
Registrar.register( Editor_Fmt );

