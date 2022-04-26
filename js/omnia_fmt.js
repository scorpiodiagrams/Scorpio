// The formatter that processes '!!' and hands the sections off to the sub format processors  It of course knows about the full list of modules.
function Omnia_Fmt(){
  return this;
}

Omnia_Fmt.prototype ={
  name : "Omnia",
  intro : "",
  outro : "",

  debug(A,url,text){
    alert( url );
  },
  htmlOfScorpioWidget(){
    var str;
    str = "<img alt='Scorpio' draggable='false' src='./images/Scorpion.svg' width='100' height='100'/></img>";
    str = "<div class='popup' id='scorpio' style='text-align:left;top:10px;left:10px;background-color: #ffffff30;'><div class='grab_bar' id='grab_bar' style='color:#000;background-color:#c3b18e80;' onmousedown='dragMouseDown(this)'><span class='scorpio_title_bar'>Scorpio</span></div>" + str + "</div>";
    return str    
  },

  htmlOfWidgets(){
     return "" +
       Editor_Fmt.htmlOfEditorWidget( "Content appears here.") 
//       + Omnia_Fmt.htmlOfScorpioWidget()
       ;
  },
  htmlOfBlock( fmt, block ){
    var module = Registrar.modules[ fmt ] || Raw_Fmt;
    return module.htmlOf( block );
  },
  htmlOf( text ){
    var blocks = ("~~~\r\n"+text).split( /^(?:!!|~~~)/gm);
    if( blocks.length == 1){
      return Raw_Fmt.htmlOf(text);
    }
    var i;
    var str = "<div class='outer'><div class='nut_content'>"+
       this.htmlOfWidgets() +  this.intro;
    // Skip the first block.
    // It's guaranteed not to be a !! block.
    for(i=1;i<blocks.length;i++)
    {
      var pieces = blocks[i].split( /\r?\n/g);
      var fmt = pieces[0] || 'Markdown';
      var text = pieces.slice(1).join( "\r\n");
      str += this.htmlOfBlock( fmt, text);
    }
    return str+this.outro+"</div></div>";
  },
  afterLoading( flags ){
    if( !flags )
      return;
    for( module_name in Registrar.modules ){
      var module = Registrar.modules[module_name];
      if( module.afterLoading )
        module.afterLoading();
    }
  }

}

Omnia_Fmt = new Omnia_Fmt();
Registrar.register( Omnia_Fmt );
