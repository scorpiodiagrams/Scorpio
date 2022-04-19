
// Plain old pre formatted text.  Nothing done ot it.
function Raw_Fmt(){
  return this;
}

Raw_Fmt.prototype ={
  name : "Raw",
  debug(A,url,text){
    alert( url );
  },
  htmlOf( str ){
    str = str || "No text (raw)";
    var click ='';
    var indexAdjust = 0;
    var magicString = "**Link to previous diagram!**\r\n";
    if( str.startsWith(magicString)){
      indexAdjust = 1;
      str = str.slice( magicString.length );
    }
    if( Scorpio_Fmt )
    {
      click = ` onclick='activateEditor(${Scorpio_Fmt.instance-indexAdjust})'`;
    }
    str = `<div class="raw"${click}>${str}</div>\r\n\r\n`;
    return str;
  }
}

Raw_Fmt = new Raw_Fmt();
Registrar.register( Raw_Fmt );