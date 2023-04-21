

// WikiWords with info cards
function Wordlist_Fmt(){
  return this;
}

Wordlist_Fmt.prototype ={
  name : "Wordlist",
  debug(A,url,text){
    alert( url );
  },
  htmlOf( text ){
    var blocks = text.split( "\r\n\r\n");
    var i;
    var str = "";
    for(i=0;i<blocks.length;i++)
    {
      var pieces = blocks[i].split( " - ");
      var wikiword = pieces[0];
      var wikidef = pieces.slice(1).join( " - ");
      str += `<div class="wikiword"><span class="fixwidth">${wikiword}</span><div class="wikidef"><h3>${wikiword}</h3>${wikidef}</div></div>\r\n\r\n`;
    }
    return str;
  }
}

Wordlist_Fmt = new Wordlist_Fmt();
Registrar.register( Wordlist_Fmt );