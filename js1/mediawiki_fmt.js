// Mediawiki format allows LaTeX embedded in a markdown doc.
function Mediawiki_Fmt(){
  return this;
}



Mediawiki_Fmt.prototype ={
  name : "Mediawiki",

  debug(A,url,text){
    alert( url );
  },

  htmlOf( str ){
    str = str || "No Mediawiki";
    str = `<div class="raw">${str}</div>\r\n\r\n`;
    return html;
  }

}

Mediawiki_Fmt = new Mediawiki_Fmt();
Registrar.register( Mediawiki_Fmt );

