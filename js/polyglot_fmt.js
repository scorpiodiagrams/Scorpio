Registrar.js.polyglot_fmt_js = function( Registrar ){

var metaData = 
{ 
  version: "2023-02",
  docString: "A generic markdown processor"
};

// Imports
// var Vector2d = Registrar.classes.Vector2d
//var Box = Registrar.classes.Box;

function Exports(){
  // Namespaced  formats classes and verbs
  // These are all for export.
//  Registrar.registerTextFormat( Jatex_Fmt );
//  Registrar.registerVerbs( Twisty );
//  Registrar.registerVerbs( Frac );
//  Registrar.registerVerbs( Stack );
//  Registrar.registerVerbs( Tile );
//  Registrar.registerVerbs( Symbol );
//  Registrar.registerVerbs( FontHandler );
//  Registrar.registerVerbs( SvgSymbols );
//  Registrar.registerVerbs( Macro );
//  Registrar.registerVerbs( Transform );
  // Global Exports 
  // These pollute the main namespace
//  window.Jatex = Jatex;
}

  
//  if( state.heroHeading )
//    line = line.replace(/^#HeroHead\((.*?),(.*?)\)/gi, state.heroHeading );
//  if( state.heading )
//    line = line.replace(/^#BlogHead\((.*?),(.*?)\)/gi, state.heading );
//  if( state.subsiteHeading )
//    line = line.replace(/^#ScorpioHead\((.*?),(.*?)\)/gi, state.subsiteHeading );

////  if( state.inlineJatex )
////    line = line.replace( /\$\$(.*?)\$\$/gi, state.inlineJatex );
//  if( state.inlineKatex )
//    line = line.replace( /\$\$(.*?)\$\$/gi, state.inlineKatex );

//  line = line        
//    .replace(/^(\[\])(.*)/, '<span class="highlight"><input type="checkbox" class="anki" id="item'+state.i+'"><label for="item'+state.i+'">$2</label></span>');
//  line = line  
//    .replace(/^(\[X\])(.*)/, '<span class="highlight"><input type="checkbox" checked="checked" class="anki" id="item'+state.i+'"><label for="item'+state.i+'">$2</label></span>');

//  line = escapeEmoji( line );
//  state.fragment = line;

//  if( typeof Katex_Fmt )
//    line = line.replace(/^#!!Katex:(.*$)/gim, function( match, capture ){ return Katex_Fmt.htmlOf( capture );});

//  line = line.replace(/^-( -)*$/gim, '<hr>');


// Katex format allows LaTeX embedded in a markdown doc.
function Polyglot_Fmt(){
  this.addCommands( "#Code( Bold ** Bold * Italic ` Tick #Button( Button #PopBox( PopBox ``` Section ~~~ Section \r\n Break ![[ Image #Island( Island #TipLink( TipLink #Tip( Tip #Footnote( Footnote #UFO( UFO #Rock( Rock #Boat( Boat #Pen( Pen #Sidebar Sidebar #GroupMe( Group #CloseBrace ) #) ) #Right( Right #Example( Example #Repo( Repo #ButtonWide( ButtonWide #Jump( Jump #Wiki( Wiki #DropCap( DropCap #DropCapRight( DropCapRight #NoBack( NoBack \r\n---- <hr> \r\n> BlockQuote \r\n< BlockQuoteRight ~~ StrikeOut \\Girl 👩🏼 \\Elephant 🐘 \\Boy 👨🏼 \\UFO 🛸 \\Rock 🚀 \\Boat ⛵️ \\Pen 🖋️ \\Diamond 🔹 \\Slush 🔸 \\Cursor4 Cursor4 \r\n$$ Katex $ KatexInline");
  // some can't be done from the split..
  this.fns[ "" ]="Ignore";
  this.fns[ "\r\n# " ]="H1";
  this.fns[ "\r\n## " ]="H2";
  this.fns[ "\r\n### " ]="H3";
  this.fns[ "\r\n#### " ]="H4";
  this.fns[ "\r\n##### " ]="H5";
  this.fns[ "\r\n###### " ]="H6";
  this.fns[ "\r\n####### " ]="H7";
  this.fns[ "# " ]="H1";
  this.fns[ "##" ]="H2";
  this.fns[ "###" ]="H3";
  this.fns[ "####" ]="H4";
  this.fns[ "#####" ]="H5";
  this.fns[ "######" ]="H6";
  this.fns[ "#######" ]="H7";
  this.fns[ "\r\n*" ]="Ul1";
  this.fns[ "\r\n**" ]="Ul2";
  this.fns[ "\r\n***" ]="Ul3";
  this.fns[ "\r\n****" ]="Ul4";
  this.fns[ "\r\n*****" ]="Ul5";
  this.fns[ "\r\n******" ]="Ul6";
  this.fns[ "\r\n*******" ]="Ul7";
  this.fns[ "\r\n> [!" ]="Dropdown";
  this.blobCounter = 0;
  return this;
}

Polyglot_Fmt.prototype ={
  name : "Polyglot",
  fns : [],

  handleButtonWide(){
    var line = this.getBraced();
    line = line.replace(/^(.*),(.*)$/gi, "<button class='wide' onclick=\"location.href='#$1';\"><a '><a href='#$1'>$2</a></button>"); 
    this.html.push(line);
  },
  handleRepo(){
    var line = this.getBraced();
    line = line.replace(/^(.*),(.*)$/gi, "<button onclick=\"setLocalRepo('$1');\"><a '><a href='#index'>$2</a></button>"); 
    this.html.push(line);
  },
  handleCursor4(){
    this.html.push(
`<button class="smallbutton" style='float:right'><svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
   width="20px" height="20px" viewBox="0 0 572.156 572.156"
   xml:space="preserve">
<g>
  <polygon points="495.405,241.769 418.657,197.457 418.657,258.115 314.042,258.115 314.042,153.498 374.699,153.498 
    330.389,76.751 286.078,0 241.769,76.751 197.457,153.498 258.115,153.498 258.115,258.115 153.498,258.115 153.498,197.457 
    76.751,241.767 0,286.078 76.751,330.387 153.498,374.699 153.498,314.042 258.115,314.042 258.115,418.657 197.457,418.657 
    241.767,495.405 286.078,572.156 330.387,495.405 374.699,418.657 314.042,418.657 314.042,314.042 418.657,314.042 
    418.657,374.699 495.405,330.389 572.156,286.078   "/>
</g>
</svg></button>`    
    );
  },
  // include stuff until ) or end of line.
  handleWiki(){
    this.handleFn("<a href='https://en.wikipedia.org/wiki/","' target='blank'>On Wikipedia...</a>");
  },
  handleDropCap(){
    this.handleFn("<div class='bigLeft'>","</div>");
  },
  handleDropCapRight(){
    this.handleFn("<span class='bigRight'>","</span>");
  },
  handleNoBack(){
    this.handleFn("<div class='banners'>","</div>");
  },
  handleExample(){
    this.handleFn("<div class='example'>","</div>");
  },
  handleRight(){
    this.handleFn("<div class='right'>","</div>");
  },
  handleBlockQuote(){
    var tok;

    this.html.push( "<blockquote>" );
    while( true ){
      this.untilIn(["\r\n"]);
      tok = this.peekTok();
      if( !tok.startsWith("\r\n>"))
        break;
      this.getTok();
      var prev = this.html[this.html.length-1];
      if( !prev.startsWith("</h"))
        this.html.push("<br>");
    }
    this.html.push("</blockquote>");
  },
  handleBlockQuoteRight(){
    this.handleFn("<blockquote class='right'>","</blockquote>");
  },
  addCommands( commands ){
    commands = commands.split(" ");
    for(var i = 0;i<commands.length;i+=2){
      this.fns[ commands[i]]=commands[i+1];
    }
  },
  peekTok(){
    if( this.tk>= this.tokens.length )
      return "";
    return this.tokens[this.tk];
  },
  getTok(){
    if( this.tk>= this.tokens.length )
      return "";
    return this.tokens[this.tk++];
  },
  untilIn( choices ){
    while( this.tk < this.tokens.length ){
      var tok = this.peekTok();
      for( choice of choices ){
        if( tok.startsWith( choice )){
          return choice;
        }
      }
      this.handleToken();
    }
    return "";
  },
  streamUntilIn( choices ){
    while( this.tk < this.tokens.length ){
      var tok = this.peekTok();
      for( choice of choices ){
        if( tok.startsWith( choice )){
          return choice;
        }
      }
      this.html.push(tok);
      this.getTok();
    }
    return;
  },
  capture( choice ){
    var buff = "";
    while( this.tk < this.tokens.length ){
      var tok = this.getTok();
      if( tok.startsWith( choice )){
        return buff;
      }
      buff = buff + tok;
    }
    return buff;
  },
  untilEol( ){
    return this.untilIn( ["\r\n"]);
  },
  eat(tok){
    if( this.peekTok() != tok)
      return false;
    this.getTok();
    return true;
  },
  handleKatex(){
    var kk = this.capture( "$$");
    try{ 
      // \widetilde, \widehat etc...
      kk = kk.replaceAll( "\\wide", "\\");
      kk = Registrar.modules.Katex.htmlOf( kk );
    } catch(e) {
      kk = "Bad Katex Block: "+e;
    } 
    kk = "<span class='jatex_block'>" + kk + "</span>";
    //kk = "<span style='color:#651'>" + kk + "</span>";
    this.html.push( kk );
  },
  handleKatexInline(){
    var kk = this.capture( "$"); 
    try{ 
      kk = kk.replaceAll( "\\wide", "\\");
      kk = Registrar.modules.Katex.htmlInlineOf( kk );
    } catch(e) {
      kk = "Bad Katex Inline: "+e;
    } 
    kk = "<span class='jatex_inline'>" + kk + "</span>";
    //kk = "<span style='color:#651'>" + kk + "</span>";
    this.html.push( kk );
  },  
  handleUl(n){
    n = n || 1;
    for( var i=0;i<n;i++)
      this.html.push("<ul>");
    this.html.push("<li>");
    this.untilEol();
    this.html.push("</li>");
    for( var i=0;i<n;i++)
      this.html.push("</ul>");
    this.eat("\r\n");
  },
  handleUl1(){ return this.handleUl( 1);},
  handleUl2(){ return this.handleUl( 2);},
  handleUl3(){ return this.handleUl( 3);},
  handleUl4(){ return this.handleUl( 4);},
  handleUl5(){ return this.handleUl( 5);},
  handleUl6(){ return this.handleUl( 6);},
  handleUl7(){ return this.handleUl( 7);},
  handleHn(n){
    n = n || "h3";
    this.html.push("<"+n+">");
    this.untilEol();
    this.html.push("</"+n+">");
    this.eat("\r\n");
  },
  handleH1(){ return this.handleHn( "h1");},
  handleH2(){ return this.handleHn( "h2");},
  handleH3(){ return this.handleHn( "h3");},
  handleH4(){ return this.handleHn( "h4");},
  handleH5(){ return this.handleHn( "h5");},
  handleH6(){ return this.handleHn( "h6");},
  handleH7(){ return this.handleHn( "h7");},
  handleImage(){
    var image = this.getTok();
    var close = this.getTok();
    //image = image.replace("/../../..","");
    image = image.replace(/\.\/images\//gi, `${Registrar.imageSrc}`);
    image = image.split( "|");
    this.html.push("<img width=300px src='"+image[0]+"'></img>");
  },
  handleBreak(){
    if( this.section)
      this.html.push("\r\n");
    else
      this.html.push("<br>");
  },
  handleSection( ){
    this.section = !this.section || 0;
    if( this.section){
      this.html.push("<div class='raw'>");
      this.streamUntilIn( ["```"]);
    }
    else
      this.html.push("</div>");
  },
  handleGroup(  ){
    // To end of line or closing brace.
    var choice = this.untilIn( [")"]);
    if( choice==")")
      this.getTok();
  }, 
  handlePrefixLines( prefix ){
    // To end of line or closing brace.
    var choice;

    while(true){
      choice = this.untilIn( ["\r\n"]);
      if( choice.startsWith("\r\n"+prefix)){
        this.getTok();
      }
      else 
        break;
    }
  }, 
  handleIsland(  ){
    // look ahead...
    var tk = this.tk;
    var name = "nut_"+(this.blobCounter++); 
    var tok1 = this.getTok();
    var tok2 = this.getTok();
    // was there a name for the island?
    if( tok2 == "," ){
      // yes, use it.
      name = tok1
    } else {
      // no, rewind the tokens.
      this.tk = tk;
    }
    this.html.push(`<span style="display:none" id="${name}">`);
    // To end of line or closing brace.
    this.handleGroup();    
    //this.html.push(line);
    this.html.push("</span>")
  }, 
  handleTipLink(  ){
    var name = "nut_"+(this.blobCounter-1);
    // To end of line or closing brace.
    var line = this.getBraced();
    line = line.replace(/^(.*),(.*)$/gi, `<span class='popbox_link' onmouseover="showTipBoxFromDiv(event,'${name}')" onclick="location.href='#$1';">$2</span>`); 
    this.html.push(line);
  }, 
  // also used by Footnote
  handleTip(  ){
    var name = "nut_"+(this.blobCounter-1);
    // To end of line or closing brace.
    var line = this.getBraced();
    var matches = line.match(/^([a-zA-Z0-9_]+),([\s\S]*)$/gi );
    if( matches ){
      name = matches[1];
      line = matches[2];
    }
    line = `<span class='popbox_link' onmouseover="showTipBoxFromDiv(event,'${name}')">${line}</span>`; 
    this.html.push(line);
  }, 
  handleFootnote(  ){
    // To end of line or closing brace.
    var name = this.getBraced();
    var line = `<sup><span class='popbox_link' onmouseover="showTipBoxFromDiv(event,'${name}')">${name}</span></sup>`; 
    this.html.push(line);
  }, 
  handleFn( pre, post ){
    this.html.push( pre );
    // To end of line or closing brace.
    var choice = this.untilIn( ["\r\n",")"]);
    if( choice!="\r\n")
      this.getTok();
    this.html.push(post);
    return choice;
  },
  getBraced( ){
    var line = "";
    // To end of line or closing brace.
    var choices=["\r\n",")"];
    while( this.tk < this.tokens.length ){
      var tok = this.getTok();
      for( choice of choices ){
        if( tok.startsWith( choice )){
          return line;
        }
      }
      line=line+tok;
    }
    return line;
  },
  getLongBraced( ){
    var line = "";
    // To end of line or closing brace.
    var choices=[")"];
    while( this.tk < this.tokens.length ){
      var tok = this.getTok();
      for( choice of choices ){
        if( tok.startsWith( choice )){
          return line;
        }
      }
      line=line+tok;
    }
    return line;
  },  
  handleButton(){
//<button onclick=\"location.href='#$1';\"><a '><a href='#$1'>$2</a></button>");
    var line = this.getBraced();
    line = line.replace(/^(.*),(.*)$/gi, "<button onclick=\"location.href='#$1';\"><a href='#$1'>$2</a></button>"); 
    this.html.push(line);
  },
  handlePopBox(){
//<button onclick=\"location.href='#$1';\"><a '><a href='#$1'>$2</a></button>");
    var name = "nut_"+(this.blobCounter++);
    var repo = Registrar.repo;

    this.html.push( `<span class='popbox_link' onmouseover=\"showTipBoxFromDiv(event,'${name}');\">`);
    this.untilEol();
    this.html.push('</span>');
    this.getTok();
    this.html.push(`<span id='${name}' style='display:none'>` );
    this.handleGroup();
    this.html.push('</span>');
  },
  handleJump(){
    var name = "nut_"+(this.blobCounter++);
    var toks = this.getTok().trim().split(" ");
    var url = toks.shift()||"missing";
    var repo = Registrar.repo;
    if( !url.match(";"))
      url = repo+';'+url; 
    this.html.push( `<span class='popbox_link' onmouseover=\"showTipBoxFromDiv(event,'${name}');\" onclick=\"location.href='#${url}'">`);
    this.untilEol();
    this.html.push( toks.join(" "));
    this.html.push('</span>');
    //this.getTok();
    this.html.push(`<span id='${name}' style='display:none'>` );
    this.handleGroup();
    this.html.push('</span>');
  }, 
  handleUFO(){
    var name = "nut_"+(this.blobCounter++);
    this.handleFn( 
      `<span class='popbox_link' onmouseover=\"showTipBoxFromDiv(event,'${name}');\">🛸 `,
      `</span><span id='${name}' style='display:none'><h1>🛸 UFO</h1>A plan for the far future.</span>` );
  },
  handleRock(){
    var name = "nut_"+(this.blobCounter++);
    this.handleFn( 
      `<span class='popbox_link' onmouseover=\"showTipBoxFromDiv(event,'${name}');\">🚀 `,
      `</span><span id='${name}' style='display:none'><h1>🚀 Rocket</h1>A plan for the near future.</span>` );
  },
  handleBoat(){
    var name = "nut_"+(this.blobCounter++);
    this.handleFn( 
      `<span class='popbox_link' onmouseover=\"showTipBoxFromDiv(event,'${name}');\">⛵ `,
      `</span><span id='${name}' style='display:none'><h1>⛵ Boat</h1>Code from the past needs updating.</span>` );
  },
  handlePen(){
    var name = "nut_"+(this.blobCounter++);
    this.handleFn( 
      `<span class='popbox_link' onmouseover=\"showTipBoxFromDiv(event,'${name}');\">🖋️ `,
      `</span><span id='${name}' style='display:none'><h1>🖋️Writings (WIP)</h1>Explainer still being written. (Work in Progress)</span>` );
  },
  handleSidebar(){
    var name = "nut_"+(this.blobCounter++);
    this.handleFn( 
      `<span class='popbox_link' onclick=\"showSidebarFromDiv('${name}');\">`);

    this.untilEol();
    this.html.push('</span>');
    this.getTok();
    this.html.push(`<span id='${name}' style='display:block'>` );
    this.untilEol();
    this.html.push('</span>');
  },  
  handleDropdown(){
    var info = this.eat("info");
    this.eat("]");
    this.eat("");
    var plus = this.eat("+");
    if( !plus )
      plus = !this.eat("-");

//    var c1 = "#282";// dark surround
//    var c2 = "#8c8";// medium heading
//    var c3 = "#efe";// light panel

    var c1 = "#651";// dark surround
    var c2 = "#dca";// medium heading
    var c3 = "#fed";// light panel

    var name = "nut_"+(this.blobCounter++);
    var initialState;
    if( plus )
      initialState = `<span id=\"${name}y\" style='color:${c1};display:none;'>►</span><span id=\"${name}n\" style='color:${c1};'>▼</span>` 
    else 
      initialState = `<span id=\"${name}y\" style='color:${c1};'>►</span><span id=\"${name}n\" style='display:none;color:${c1};'>▼</span>`;
    var showDiv = plus?"":"display:none;"
    this.html.push( `<br><div class='dropdown' style='background:${c2};padding:6px;border:0.5px solid ${c1};border-radius:6px 6px 0 0;width:100%;' onClick='DomUtils.toggleVisibility2(\"${name}\")'>${initialState}` );
    var choice = this.untilEol();
    this.html.push(`</div><div id=\"${name}\" style='background:${c3};padding:6px;border:0.5px solid ${c1};border-radius:0 0 6px 6px;border-top-style:none;width:100%;${showDiv}'>`);
    this.getTok();
    this.handleGroup();
    this.html.push("</div>");
  }, 
  handleStrikeOut( ){
    this.strike = !this.strike || 0;
    if( this.strike){
      this.html.push("<s>");
      var choice = this.untilIn( ["\r\n","~~"]);
      if( choice!="\r\n")
        this.getTok();
    }
    this.html.push("</s>");
    this.strike=false;
  },   
  handleBold( ){
    this.bold = !this.bold || 0;
    if( this.bold){
      this.html.push("<b>");
      var choice = this.untilIn( ["\r\n","*","**",")","#GetCode("]);
      if( choice!="\r\n")
        this.getTok();
    }
    this.html.push("</b>");
    this.bold=false;
  },
  handleItalic( ){
    this.italic = !this.italic || 0;
    if( this.italic)
      this.html.push("<em>");
    else
      this.html.push("</em>");
    if( this.italic ){
      var choice = this.untilIn( ["\r\n","*","**",")","#GetCode("]);
      if( choice!="\r\n")
        this.getTok();
      this.html.push("</em>");
    }
    this.italic=false;
  },  
  handleTick( ){
    this.tick = !this.tick || 0;
    if( this.tick)
      this.html.push("<span class='example'>");
    else
      this.html.push("</span>");
    if( this.tick ){
      var choice = this.untilIn( ["\r\n","`","*","**",")","#GetCode("]);
      if( choice!="\r\n")
        this.getTok();
      this.html.push("</span>");
    }
    this.tick=false;
  },
  handleIgnore( ){
    return ;
  },
  handleToken( ){
    var token = this.getTok();
    var translation = this.fns[token];
    if( !translation){
      if( token.startsWith("\r\n"))
        this.html.push("<br>");
      this.html.push( token );
      return;
    }
    // do we have a function for this?
    var proto = Object.getPrototypeOf(this);
    var fn = proto[ "handle"+translation ];
    if( !fn){
      this.html.push( translation );
      return;
    }
    fn.call( this, token);
    return;
  },
  htmlOf( str ){
    str = str || "Polyglot!";
    str = "LEADER\r\n"+str;
    // This is our complete tokenizer!
    // Our tokens are either the things matched here
    // OR they are the strings between.
    // We discard empty tokens.
    this.tokens = str.split( /(\r\n> [!\[]+|\]|!\[\[|\r\n>|\r\n\$\$|\$\$|\$|\r\n<|\\[a-zA-Z0-9]+|\\.|#[a-zA-Z]+\(?|\r\n#+ |##+|#\)|# |\)|\(|`+|\+|\-|\r\n\*+|\*+|\r\n\-\-\-\-|\r\n|,|\r\n~~~|~~)/);
    this.tk = 1;
    this.html = [];
    while( this.tk < this.tokens.length )
    {
      this.handleToken();
    }
    //str = str.filter(word => word != "");
    //str = str.map( word => this.fns[word] || word);
    str = this.html.join("");
    var html = `<div>${str}</div>\r\n\r\n`;
    return html;
  },
}

Polyglot_Fmt = new Polyglot_Fmt();
Registrar.register( Polyglot_Fmt );

Exports();

return metaData;
}( Registrar );// end of polyglot_fmt_js

