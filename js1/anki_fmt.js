// Anki format allows LaTeX embedded in a markdown doc.
function Anki_Fmt(){
  return this;
}



Anki_Fmt.prototype ={
  name : "Anki",
  logicalCard : 0,
  card : -1,
  oldCard : -1,
  AnkiReady : false,
  nCards : 50,
  nCardsLogical : 50,
  outro : `<br>Here is an 
<div class="nutshell-button" 
onclick="DomUtils.toggleVisibility('nutAnki')">Anki Deck</div> for the unchecked words
<div class="nutshell-bubble" id="nutAnki" style="display:none"><br clear="all"/>
<div class="anki-display" id="anki"></div>
<div class="hgroup">
<button onclick="Anki_Fmt.ankiAdjust(-50)">|&lt;</button>
<button onclick="Anki_Fmt.ankiAdjust(-1)">&lt;</button>
<button onclick="Anki_Fmt.ankiAdjust(+1)">&gt;</button>
<button onclick="Anki_Fmt.ankiAdjust(+50)">&gt;|</button> &nbsp;
<span id="anki-count">Card 1 of 50</span>
<button onclick="Anki_Fmt.ankiDownload(+50)">Download</button>
</div>
</div>`,


  debug(A,url,text){
    alert( url );
  },

  htmlOf( str ){
    str = str || "No Anki";
    str = str.replace(/\r\n/g,"\n");
    //str = `<div class="raw">${str}</div>\r\n\r\n`;
    var words = str.split( /^# /gm );
    words.shift();

    str = "";

    var wordcount = words.length;
    var start = 0;//wordcount * G.wordstart;
    var end = wordcount; //* G.wordend;
    var nWords = 45;
    str = "";
    var word;
    this.Anki = [];
    var i;
    for(i=0;i<nWords;i++){
      if(( i%15)==0)
      {
        str += "<div class='wordcolumn'>";
      }
      var ix = Math.floor( start + (i*(end-start))/nWords);

      chunk = words[ix];
      word = chunk.split( '\n')[0];
      str +='<span class="highlight">'+
      '<input type="checkbox" class="Anki" id="'+word+'-word" onclick="Anki_Fmt.click(this,'+i+');"><label for="'+word+'-word"> '+word+'</label><br>'+
      '</span>';

      var def = 
      {
        word: word,
        definition : chunk,
        checked : false
      };
      this.Anki.push( def );

      if(( i%15)==14)
      {
        str += "<hr></div>";
      }
    }
    this.card = 0;
    this.logicalCard=0;
    this.nCards = nWords;
    this.nCardsLogical = nWords;
    this.AnkiReady = this.Anki.length > 0;


    str = '<div class="wide_content">'+
      str +
      '</div>';
    return str + "<br clear='all'/>" + this.outro;
  },

  csvEscapedHtmlOfMarkdown( text ){
    text = text.replace( /\s+$/,'');
    text = Markdown_Fmt.htmlOf( text );
    text = text.replace( /<br\/>\r\n<br\/>$/, '' );
    text = text.replace(/"/g,'""' );
    return '"'+text+'"';
  },
  getDeck(){
    var str = "";
    var i;
    for( i=0;i<this.nCards;i++)
    {
      var card = this.Anki[i];
      if( card.checked )
        continue;
      var lines = card.definition.split('\n');
      var word = lines[0];
      lines.shift();
      var def = lines.join("\n");
      str += this.csvEscapedHtmlOfMarkdown( word ) + 
        ";" + 
        this.csvEscapedHtmlOfMarkdown( def ) + 
        "\n";
    }
    return str;
  },

  showCardCounter()
  {
    var checked = this.Anki[this.card].checked;
    var str = 
      checked ? 
        (     "[Card "+        (this.card+1) + " of " + this.nCards + "]")
      : ("&nbsp;Card "+ (this.logicalCard+1) + " of " + this.nCardsLogical);
    DomUtils.set( "anki-count", str );
  },
  showCard(){
    if( this.card == this.oldCard)
      return;
    if( (this.card < 0) || (this.card > this.nCards))
    {
      DomUtils.set( "anki", "Could not find card number "+this.card);
      return;
    }
    this.oldCard = this.card;
    var str = "# "+this.Anki[this.card].definition;
    str = Markdown_Fmt.htmlOf( str );
    DomUtils.set( "anki", str );
  },
  ankiAdjust( count ){
    var checked = this.Anki[this.card].checked;
    if( (count > 0 ) && checked )
    {
      count--;
    }
    this.logicalCard = Math.max(0,Math.min(this.logicalCard+count,this.nCardsLogical-1));
    this.card =-1;
    var i=-1;
    while((i<this.logicalCard)&&(this.card<this.nCards-1)){
      this.card++;
      if( !this.Anki[this.card].checked)
      {
        i++;
      }
    };
    this.showCardCounter();
    this.showCard();
  },
  ankiDownload(){
    var str = this.getDeck();
    console.log( str );
    Loader.downloadDurl( "Anki.txt", Loader.durlOfText( str ));
  },
  logicalPosOfCard( card ){
    var i;
    var logical = 0;
    for(i=0;i<card;i++){
      logical += this.Anki[i].checked ? 0:1;
    }
    return logical;
  },

  click( what, item ){
    console.log( what.id, " at ", item, " says ", this.Anki[item].definition );
    // Click happens after checked has been updated.
    this.Anki[item].checked = what.checked;
    this.nCardsLogical += what.checked ? -1 : +1;
    this.logicalCard = this.logicalPosOfCard( item );
    this.card = item;
    this.showCardCounter();
    this.showCard();
  },
  afterLoading(){
    if( !this.AnkiReady)
      return;
    this.ankiAdjust(0);
    this.AnkiReady = false;// for next time.
  }

}

Anki_Fmt = new Anki_Fmt();
Registrar.register( Anki_Fmt );

