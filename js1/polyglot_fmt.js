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

// state variables
// These are for handling the grungy #VBar etc
  let imageClass = '';
  let indentClass = '';
  let chunkClass = '';
  let linkClass = '';
  let selIndicator = false;
  let cards = false;
  let inCard = false;

function inits(){
  imageClass = '';
  indentClass = '';
  chunkClass = '';
  linkClass = '';
  selIndicator = false;
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
  this.splitterPattern = /(\r\n> \[!|\]\(|\]|!\[\]\(|!\+\[\[|\[|\r\n>|\r\n\$\$|\$\$|\$|\r\n<|\\[a-zA-Z0-9\_\.]+|\\.|#Hash|#[a-zA-Z0-9]+\(?|\r\n### %[a-zA-Z0-9]+\(?|\r\n#+ |\r\n##+|#`+|#\)|#\*|#\$|#+ |#\/|\)|\(|`+|\+|\-|\r\n\*+ |\*+|\r\n *\- |\r\n\-\-\-\-?|\r\n|,|\r\n~~~|~~)/;
  this.addCommands( "#Code( Code ** Bold * Italic ` Tick #Overlay Overlay #Selected Selected #Buttons Buttons #Kwic Kwic #KwicTitle KwicTitle #VBar1 VBar1 #VBar2 VBar2 #VBar3 VBar3 #VBar4 VBar4 #ImageAs ImageAs #IndentAs IndentAs #Cards Cards #ChunkAs ChunkAs #LinkAs LinkAs #Button( Button #PopBox( PopBox #Pop( Pop #Menu( Menu #Quote( Quote #Action( Action #Tabs( Tabs ``` Section ~~~ Section \r\n Break ![]( Image [ URL #Full( Full #Image( Image2 #Anchor( Anchor #Island( Island #TipLink( TipLink #Tip( Tip #Footnote( Footnote #Hash # #FootnoteRef( FootnoteRef #FootnoteEnd Ignore #Eqn( Eqn #EqnRef( EqnRef #page( Page #ScrollTo( ScrollTo #LittleLogo( LittleLogo #CBox( CBox #UFO( UFO #Rock( Rock #Boat( Boat #Pen( Pen #Sidebar Sidebar #GroupMe( Group #Caption Caption #CloseBrace ) #) ) #* * #` ` #``` ``` #$ $ #/ / #Right( Right #Example( Example #Repo( Repo #ButtonWide( ButtonWide #Jump( Jump #Wiki( Wiki #DropCap( DropCap #DropCapRight( DropCapRight #NoBack( NoBack \r\n---- Hr \r\n--- Hr \r\n> BlockQuote \r\n< BlockQuoteRight ~~ StrikeOut \\Girl 👩🏼 \\Elephant 🐘 \\Boy 👨🏼 \\UFO 🛸 \\Rock 🚀 \\Boat ⛵️ \\Pen 🖋️ \\Diamond 🔹 \\Slush 🔸 \\Cursor4 Cursor4 \r\n$$ Katex $ KatexInline #CommandList CommandList #JatexList JatexList");
  // some can't be done from the split..
  this.fns[ "" ]="Ignore";
  //this.fns[ "\r\n\r\n# " ]="H1";
  //this.fns[ "\r\n\r\n## " ]="H2";
  //this.fns[ "\r\n\r\n### " ]="H3";
  //this.fns[ "\r\n\r\n#### " ]="H4";
  //this.fns[ "\r\n\r\n##### " ]="H5";
  //this.fns[ "\r\n\r\n###### " ]="H6";
  //this.fns[ "\r\n\r\n####### " ]="H7";
  //this.fns[ "\r\n\r\n##" ]="H2";
  //this.fns[ "\r\n\r\n###" ]="H3";
  //this.fns[ "\r\n\r\n####" ]="H4";
  //this.fns[ "\r\n\r\n#####" ]="H5";
  //this.fns[ "\r\n\r\n######" ]="H6";
  //this.fns[ "\r\n\r\n#######" ]="H7";

  this.fns[ "># " ]="H1";
  this.fns[ ">## " ]="H2";
  this.fns[ ">### " ]="H3";
  this.fns[ ">#### " ]="H4";
  this.fns[ ">##### " ]="H5";
  this.fns[ ">###### " ]="H6";
  this.fns[ ">####### " ]="H7";

  this.fns[ "\r\n# " ]="H1";
  this.fns[ "\r\n## " ]="H2";
  this.fns[ "\r\n### " ]="H3";
  this.fns[ "\r\n#### " ]="H4";
  this.fns[ "\r\n##### " ]="H5";
  this.fns[ "\r\n###### " ]="H6";
  this.fns[ "\r\n####### " ]="H7";
//  this.fns[ "\r\n#" ]="H1";
  this.fns[ "\r\n##" ]="H2";
  this.fns[ "\r\n###" ]="H3";
  this.fns[ "\r\n####" ]="H4";
  this.fns[ "\r\n#####" ]="H5";
  this.fns[ "\r\n######" ]="H6";
  this.fns[ "\r\n#######" ]="H7";
  this.fns[ "\r\n* " ]="Ul1";
  this.fns[ "\r\n** " ]="Ul2";
  this.fns[ "\r\n*** " ]="Ul3";
  this.fns[ "\r\n**** " ]="Ul4";
  this.fns[ "\r\n***** " ]="Ul5";
  this.fns[ "\r\n****** " ]="Ul6";
  this.fns[ "\r\n******* " ]="Ul7";
  // An alternative form of unordered list...
  this.fns[ "\r\n- " ]="Ul1";
  this.fns[ "\r\n - " ]="Ul1";
  this.fns[ "\r\n  - " ]="Ul2";
  this.fns[ "\r\n   - " ]="Ul2";
  this.fns[ "\r\n    - " ]="Ul3";
  this.fns[ "\r\n> [!" ]="Dropdown";
  this.fns[ "\r\n### %Footnote(" ]="FootnoteRef";
  this.blobCounter = 0;
  return this;
}

Polyglot_Fmt.prototype ={
  name : "Polyglot",
  fns : [],
  // lists all the commands in a raw div
  handleCommandList(){
    this.html.push(`<div class='raw'>`);
    var cmds = Object.keys( this.fns ).sort();
    var proto = Object.getPrototypeOf(this);

    for(var mode=0;mode<2;mode++){
      for(var i=0;i<cmds.length;i++){
        var name = cmds[i].replace("\r\n","");
        var translation = this.fns[cmds[i]];
        var fn = proto[ "handle"+translation ];
        if( fn && mode == 0)
          this.html.push(`${name} - handle${translation}\r\n`);
        if( !fn && mode ==1 )
          this.html.push(`${name} - ${translation}\r\n`);
      }
    }
    this.html.push(`</div>`);
  },
  // lists all the JaTeX in a raw div
  handleJatexList(){
    this.html.push(`<div class='raw'>`);
    var cmds;
    cmds = RR.Jatex.listCommands();
    this.html.push(cmds.join("\r\n"));
    cmds = RR.Jatex.listSymbols();
    this.html.push(cmds.join("\r\n"));
    this.html.push(`</div>`);
  },
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
  // draws a four arrowed thing using svg
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


  // These functions arrived with Pimellos
  // ParamTok gets parameters after the specified token.
  // Overlay is for a popover overlay
  // Buttons will show some of our standard buttons.
  // The various handleXxxAs functions set a mode for
  //  images (e.g roundels)
  //  Chunks (fold up or not)
  //  Indents (diamond_orange or diamond_blue) the style of the indented item.
  //  Links (hyperlink, toKwic, to third colums )
  // Selected displays the next item with a selection indicator
  // Kwic/KwicTitle set where the Kwic will load data from
  // VBars are for 3 col layout
  // Cards are for Flex card layout  
  getParamTok(){
    let str = this.getTok().trim();
    this.eat("\r\n");
    if( str == 'none' || str == 'default')
      str = '';
    return str;
  },
  handleOverlay(){this.eat("\r\n");this.html.push(popoverText())},
  handleButtons(){this.html.push(popoverButtons(this.getParamTok()))},
  handleImageAs(){imageClass=this.getParamTok();},
  handleChunkAs(){chunkClass=this.getParamTok();},
  handleIndentAs(){indentClass=this.getParamTok();},
  handleLinkAs(){linkClass=this.getParamTok();},
  handleSelected(){selIndicator=true;this.eat("");this.eat("\r\n");},
  handleKwic(){Registrar.kwicSrc=this.getTok();Registrar.kwicTitle=Registrar.kwicSrc;this.eat("\r\n");},
  handleKwicTitle(){Registrar.kwicTitle=this.getTok();this.eat("\r\n");},
  handleVBar1(){ this.eat("");inits();this.html.push( '<div class="container"><div class="column" id="col1">');this.eat("\r\n");},
  handleVBar2(){ this.eat("");inits();this.html.push( '</div><div class="resizer" id="resizer1" onmousedown="startResizing(this,event)" ontouchstart="startResizing(this,event)"></div><div class="column" id="col2">');this.eat("\r\n");},
  handleVBar3(){ this.eat("");inits();this.html.push( '</div><div class="resizer" id="resizer2" onmousedown="startResizing(this,event)" ontouchstart="startResizing(this,event)"></div><div class="column" id="col3">');this.eat("\r\n");},
  handleVBar4(){ this.eat("");inits();this.html.push( '</div></div>');this.eat("\r\n");},
  handleCards(){this.eat("");this.html.push('<div class="container3">');this.eat("\r\n");cards=true;},
  mayCard( more ){
    if( !cards )
      return;
    if( inCard ){
      this.html.push( '</div>' ) // end card
    }
    if( more ){
      this.html.push( '<div class="card3">' );
      inCard = true;
      return;
    }
    this.html.push( '</div>' ) // end cards container
    cards = false;
    inCard = false;
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
    this.handleFn2("<div class='banners'>","</div>");
  },
  handleExample(){
    this.handleFn2("<div class='example'>","</div>");
  },
  handleRight(){
    this.handleFn2("<div class='right'>","</div>");
  },
  handleCaption(){
    this.handleFn2("<div class='caption'><em>","</em></div>","#CaptionEnd");
  },
  handleAnchor(){
    this.handleFn("<span id='","'></span>");
  },
  // Go full screen, and start loading the sample multiscroller
  handleFull(){
    Multiscroller_Fmt.InitFromScripts();
  }, 
  handleHr(){
    this.html.push( "<hr>")//" style='border:0;height:2px;background:red'>" );
    this.eat("\r\n");
  }, 
  handleBlockQuote2(){
    var tok;

    this.html.push( "<blockquote>" );

    // concatenate all \r\n> into one blockquote.
    while( true ){
      this.eat("");
      tok = this.peekTok();
      if( tok.startsWith("*") || tok.startsWith("##") ){
        this.getTok();
        this.handleToken( "\r\n"+tok );
      }
      else 
        this.untilIn(["\r\n"]);
      tok = this.peekTok();
      if( !tok.startsWith("\r\n>")){
        break;
      }
      // discard the \r\n> and keep going.`
      this.getTok();
    }
    this.html.push("</blockquote>");
    this.eat("\r\n");
  },
  handleBlockQuote(){
    this.handleFn3("<blockquote>","</blockquote>", "\r\n>");
  },
  handleBlockQuoteRight(){
    this.handleFn3("<blockquote class='right'>","</blockquote>", "\r\n<");
  },
  handleQuote(){
    this.handleFn2("<blockquote><em>\"","\"</em></blockquote>", ")");
  },
  addCommands( commands ){
    commands = commands.split(" ");
    for(var i = 0;i<commands.length;i+=2){
      this.fns[ commands[i]]=commands[i+1];
    }
  },
  peekTok(n){
    n = n||0;
    if( (this.tk+n)>= this.tokens.length )
      return "";
    if( (this.tk+n)<0)
      return "";
    return this.tokens[this.tk+n];
  },
  getTok(){
    if( this.tk>= this.tokens.length )
      return "";
    let toke= this.tokens[this.tk++];
    if( toke == '\r\n')
      this.lineCtr++;
    return toke;
  },
  untilIs( choices ){
    while( this.tk < this.tokens.length ){
      var tok = this.peekTok();
      for( choice of choices ){
        if( tok ==  choice ){
          return choice;
        }
      }
      this.handleToken();
    }
    return "";
  },
  untilIn( choices ){
    while( this.tk < this.tokens.length ){
      var tok = this.peekTok();
      for( choice of choices ){
        if( tok.startsWith( choice )){
          return tok;
        }
      }
      this.handleToken();
    }
    return "";
  },
  matchURL(){
    var hx  = this.html.length;
    var tok = this.untilIn( ["](","\r\n"] );
    if( tok != "](" )
      return "";
    this.tk++;
    var text = this.html.slice( hx-this.html.length ).join("");
    this.html.length = hx;
    this.eat("");
    var popbox = "";
    tok = this.peekTok()+this.peekTok(1);

    // Custom addition for links to Kwic
    if( linkClass == 'kwic' ){
      tok = this.getTok();
      tok = tok.replace( /%20/g, " " );
      tok = tok.replace( /%2C/g, "," );
      this.html.push( `<span class=kwic-launch onclick="launchKwic('${tok}')">${text}</span>`)
      tok = this.untilIn( [")","\r\n"] );
      if( tok != ")" )
        return "";
      this.tk++;
      return 'OK';
    }

    // Custom addition for links that update col3
    if( linkClass == 'col3' ){
      tok = this.getTok();
      anchor = '';
      if( this.peekTok()?.[0] === '#' ){
        anchor = this.getTok().slice(1);
      }
      anchor += this.captureAndEat( ')' );
      this.html.push( `<span class=kwic-launch onclick="intoCol('${tok}',3,'${anchor}')">${text}</span>`)
      return 'OK';
    }

    // This is messy code originally made for SICM
    this.html.push("<a href=\"");
    if( tok.startsWith("bibliography"))
      text = '['+text+']';
    else if( tok.startsWith("references"))
      text = '['+text+']';
    else if( tok.startsWith("#figure_")){
      var name = tok.split("#figure_")[1]||"";
      popbox = ` class='popbox_link' onclick="OnFns.closeTip();" onmouseover="OnFns.showTipBoxFromDiv(event,'figure_${name}')"`
    }
    else if( tok.startsWith("#footnote_")){
      var name = tok.split("#footnote_")[1]||"";
      popbox = ` class='popbox_link' onclick="OnFns.closeTip();" onmouseover="OnFns.showTipBoxFromDiv(event,'footnote_${name}')"`
    }    
    else if( tok.startsWith("#exercise_")){
      var name = tok.split("#exercise_")[1]||"";
      popbox = ` class='popbox_link' onclick="OnFns.closeTip();" onmouseover="OnFns.showTipBoxFromDiv(event,'content_of_exercise_${name}')"`
    }
    else if( tok.startsWith("#section_")){
      var name = tok.split("#section_")[1]||"";
      popbox = ` class='popbox_link' onclick="OnFns.closeTip();" onmouseover="OnFns.showTipBoxFromDiv(event,'content_of_section_${name}')"`
    }    
    if( tok.startsWith("#")){
      tok  = `#${Registrar.repo};${Registrar.page}!`;
      tok += this.getTok().slice(1);
      this.html.push(tok)
    }
    else if(tok.includes(";")){
      tok  = `#`;
      tok += this.getTok();
      this.html.push(tok)
    }
    else if( tok.includes(".html"))
    {
      tok=tok;
    }
    else if(!tok.startsWith("http")){
      tok  = `#${Registrar.repo};`;
      this.html.push(tok)
    }

    tok = this.untilIn( [")","\r\n"] );
    if( tok != ")" )
      return "";
    this.tk++;
    this.html.push(`\"${popbox}>`);
    this.html.push( text );
    this.html.push("</a>");
    return "OK";
  },
  // a wrapper to allow match something that may roll back.
  // this looks suspiciously like parsing...
  mayHandle( fn ){
    var tk = this.tk;
    var hx = this.html.length;
    if( fn.call(this) != "")
      return false;
    this.tk = tk-1;
    this.html.length = hx;
    // Output the token that we failed to match.
    this.html.push( this.getTok());
    return true;
  },
  handleURL(){
    return this.mayHandle( this.matchURL )
  },
  handleScrollTo(){
    tok = this.captureAndEat( ")" );
    this.html.push(`<a href="javascript:;" onclick="DomUtils.scrollToDiv('${tok}');">${tok}</a>`);
    return;
    this.html.push(`<a href="#${Registrar.repo};${Registrar.page}!${tok}">${tok}</a>`);
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
  captureAndEat( choice ){
    var buff = this.capture( choice );
    this.getTok();
    return buff;
  },
  capture( choice ){
    var buff = "";
    while( this.tk < this.tokens.length ){
      var tok = this.peekTok();
      if( tok.startsWith( choice )){
        return buff;
      }
      buff = buff + tok;
      this.getTok();
    }
    return buff;
  },
  captureToEol(){
    var tk = this.tk;
    var hx = this.html.length;
    var tok = this.untilEol();
    var buff = this.html.slice( hx ).join("");
    this.html.length = hx;
    // Output the token that we failed ot match.
    //this.html.push( buff );
    this.eat("\r\n");
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
    var kk = this.captureAndEat( "$$");
    var id = "";
    var Katex = Registrar.modules.Katex;
    if( Katex ) try{ 
      // \widetilde, \widehat etc...
      //kk = kk.replaceAll( "\\wide", "\\");
      id = kk.match( /\\tag\{([0-9\.]+)\}/ );
      id = (id && id[1]) || "";
      kk = Katex.htmlOf( kk );
    } catch(e) {
      kk = "Bad Katex Block: "+e;
    } 
    kk = "<span class='jatex_block'>" + kk + "</span>";
    if( id )
      kk = `<span id='equation_${id}'>${kk}</span>`;
    //kk = "<span style='color:#651'>" + kk + "</span>";
    this.html.push( kk );
  },
  handleKatexInline(){
    var kk = this.captureAndEat( "$"); 
    var Katex = Registrar.modules.Katex;
    if( Katex ) try{ 
      //kk = kk.replaceAll( "\\wide", "\\");
      kk = Katex.htmlInlineOf( kk );
    } catch(e) {
      kk = "Bad Katex Inline: "+e;
    } 
    kk = "<span class='jatex_inline'>" + kk + "</span>";
    //kk = "<span style='color:#651'>" + kk + "</span>";
    this.html.push( kk );
  }, 
  // Page for page numbers....
  handlePage(){
    var kk = this.captureAndEat( ")");
    this.html.push( 
      `<table id="p${kk}" width="100%" style="color:#420c">
        <td><hr style="border-top:1px solid #8868;border-bottom:none;"/></td>
        <td style="width:1px;white-space:nowrap">page ${kk}</td>
        <td style="width:30px"><hr style="border-top:1px solid #8868;border-bottom:none;"/></td>
      </table>`);
  }, 
  handleUl(n){
    n = n || 1;
    this.eat("");
    this.eat(" ");
    for( var i=0;i<n;i++)
      this.html.push("<ul>");
    this.html.push(`<li class="${indentClass}">`);
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
    n = n || 3;
    if( n<4 )
      this.mayCard( n > 2 )
    var buff = this.captureToEol();
    var section;
    section = buff.match( /^\s*([0-9\.]+)/);
    section = section ? `section_${section[1]}` : "";
    if( !section ){
      section = buff.match( /^\s*Exercise\s*([0-9A-Z\.]+)/);
      section = section ? `exercise_${section[1]}` : "";
    }
    //section = section.replaceAll("\.","-");
    let nInvoke = 'h'+n
    if( n==5){
      nInvoke +=' onclick="toggleExpanded(this);"';
    }
    var text = `<${nInvoke}>${buff}</h${n}>`;
    // The double span here is that we need the content to vanish,
    // but we still need a span for the id as an anchor, and that 
    // span needs to be visible.
    if(section)
      text += `<span id='${section}'></span><span id='content_of_${section}' style='display:none'>${buff}</span>`;
    if( this.inJump )
      ;//text = "</span>"+text+"<span class='chunk'>"
    else
      text = "</span>"+text+"<span class='chunk'>"

    this.html.push(text);
    this.eat("\r\n");
  },
  handleH1(){ return this.handleHn( 1);},
  handleH2(){ return this.handleHn( 2);},
  handleH3(){ return this.handleHn( 3);},
  handleH4(){ return this.handleHn( 4);},
  handleH5(){ return this.handleHn( 5);},
  handleH6(){ return this.handleHn( 6);},
  handleH7(){ return this.handleHn( 7);},
  handleImage(c){
    var image = this.getTok();
    var close = this.getTok();
    var match;
    //image = image.replace("/../../..","");
    image = image.replace(/\.+\/images\//gi, `${Registrar.imageSrc}`);
    match = image.match(/(.*)\|(.*)/);
    var size = "";
    if( match ) { 
      size = `width=${match[2]} `;
      image = match[1];
    }
    let cl = imageClass ? `class="${imageClass}" `:""
    if( cl && selIndicator ){
      cl = `class="selected ${imageClass}" `;
      selIndicator = false;
    }
    this.html.push(`<img ${size}${cl}src='${image}'></img>`);
    this.eat( "");
    this.eat( ")");
    if( this.peekTok() == '[' ){
      let img = this.html.pop();
      //this.html.push( `<span onclick="alert('foo');">${img}</span>`);
      this.tok = this.getTok();
      this.handleURL();
      this.html.pop();
      this.html.pop();
      this.html.push( img );
      this.html.push( '</a>' );
    }
  },
  handleImageColoured(){
    this.handleImage(1);
  },
  handleImage2(){
    var args = this.getArgs();
    var image = args[0];
    var ref = args[1];
    this.html.push(`<span id='${ref}'><img style="display: block;margin-left:auto;margin-right:auto;width:50%" src='${Registrar.imageSrc}/${image}' alt='${ref}'></img></span>`);
    this.eat( "");
  },  
  handleCBox(){
    var a1=this.getTok();
    var a2=this.getTok();
    var a3=this.getTok();
    var a4=this.getTok();
    var Ann = RR.classes.Annotator;
    this.html.push( Ann.prototype.boxText( a2, 15, "", ""));
  },
  handleLittleLogo(){
    var image = this.captureAndEat( ")");
    if( image !== "" ){
      //DomUtils.setAttr( "little_logo_src","src",)
      DomUtils.setVisibility( "little_logo_src", true);
    } else {
      DomUtils.setVisibility( "little_logo_src", false);
    }

    //alert( image );
  },
  handleBreak(){
    this.eat("");
    // In verbatim, just add new lines.
    if( this.section){
      this.html.push("\r\n");
      return;
    }
    var tok;
    this.html.push("<br>");
//    while( this.peekTok() == "\r\n"){
//      this.getTok();
//      this.eat("");    
//      this.html.push("<br>");
//    }
  },
  formatAsScheme( prog ){
    prog = prog.trim().split("\r\n").join(" ");
    prog = prog.split("(");
    result=prog[0] || "";
    var indent = 0;
    // Show what's before first "(" verbatim.
    var prefix = "";
    if( result && (prog.length > 1))
      result += "\r\n"
    // loop will only get things after the first "("
    for(var i=1;i<prog.length;i++){
      var line = (prog[i].trim());
      var closings = ("XXX"+line+"XXX").split(")").length -1;
      indent = Math.max( indent + 1 -closings, 0 );

      if( line.length == 1 ) {
        prefix = prefix + "("+line;
      } 
      else if( line ) {
        result += prefix +"("+line;
        prefix = "\r\n"+(Array(indent*2+1).join(" "));
      }
      else
        prefix = prefix + "( ";
    }
    // Check remote possibility we never showed the last line...
    // Can happen with unbalanced brackets.
    if( prefix.trim()){
      result += prefix;
    }
    return result;
  },
  handleSection( ){
    this.section = !this.section || 0;
    if( this.section){
      this.html.push("</span><div class='raw'>");
      var json_buff = "";
      var tok=this.peekTok();
      if( tok && !tok.startsWith("\r\n")){
        tok=this.getTok();

        // These GeShI handlers should probably move out into their oen space
        if( tok == "jsonx"){
          let text = this.capture( ["```"]);
          var module = Registrar.modules[ "PrettyPrint" ];
          if( module){
            text = module.htmlOf( text );
          }
          this.html.push( text );
          this.html.push( "</div><div>");
          return;
        }

        // We cheat on tables, and don't use the standard format
        // We require that it be in a triple quote block.
        if( tok == "table"){
          let text = this.capture( ["```"]);
          var module = Registrar.modules[ "Tablifier" ];
          if( module){
            text = module.htmlOf( text );
          }
          this.html.pop();
          this.html.push( "</span>");
          this.html.push( text );
          this.html.push( "<div>");
          return;
        }

        // Markdown in a GeShI block
        if( tok == "mdown"){
          let text = this.capture( ["```"]);
          var module = Registrar.modules[ "Remarkable" ];
          if( module){
            text = module.htmlOf( text );
          }
          this.html.push( text );
          this.html.push( "</div><div>");
          return;
        }

        if( tok == "json"){
          json_buff = this.capture( ["```"]);
        }        

        // We've had Scheme here a while...
        if( tok == "Scheme"){
          var name = "nut_"+(this.blobCounter++);
          var buff = this.capture( ["```"]);
          var fbuff = this.formatAsScheme( buff );
          var small = fbuff.split("\r\n").length < 8;
          var d1 = small ? "none" : "inline";
          var d2 = small ? "inline" : "none";
          this.html.push(
          `<div id="${name}n" style='display:${d1}' onClick='DomUtils.toggleVisibility2("${name}")'><div class='moniker'> ▶ Scheme </div>` );
          this.html.push(buff);
          this.html.push('</div>');
          this.html.push(
          `<div id="${name}y" style='display:${d2}' onClick='DomUtils.toggleVisibility2("${name}")'><div class='moniker'> ▼ Scheme </div>` );
          this.html.push(`${fbuff}</div>`);
          return;
        }
        this.html.push("<div class='moniker'>"+tok+"</div>");
      }
      this.streamUntilIn( ["```"]);

      if( json_buff ){
        this.html.push( json_buff );
        var module = Registrar.modules[ "DataIsland" ];
        if( module){
          var text = module.htmlOf( json_buff );
          this.html.push( "</div><div>");
          this.html.push( text );
        }
      }
    }
    else
      this.html.push("</div><span class='chunk'>");
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
    line = line.replace(/^(.*),(.*)$/gi, `<span class='popbox_link' onmouseover="OnFns.showTipBoxFromDiv(event,'${name}')" onclick="location.href='#$1';">$2</span>`); 
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
    line = `<span class='popbox_link' onmouseover="OnFns.showTipBoxFromDiv(event,'${name}')">${line}</span>`; 
    this.html.push(line);
  }, 
  handleFootnote(  ){
    // To end of line or closing brace.
    var name = this.getBraced();
    // Closing the link on click is necessary to get scrolling to
    // complete on Chrome. Without it, the tip closes during scrolling
    // and this disrupts scrolling and scrolling ends.
    var line = `<sup><a href="#${Registrar.repo};${Registrar.page}!footnote_${name}" class='popbox_link' onclick="OnFns.closeTip();" id='footnote_ref${name}' onmouseover="OnFns.showTipBoxFromDiv(event,'footnote_${name}')">${name}</a></sup>`; 
    this.html.push(line);
  }, 
  handleFootnoteRef(  ){

    if( this.peekTok(-1).startsWith("\r\n"))
      this.html.push( "<br>");
    // To end of line or closing brace.
    var name = this.getBraced();
    this.eat("");
    this.eat("\r\n");
    this.html.push(`<a href="#${Registrar.repo};${Registrar.page}!footnote_ref${name}"><sup>${name}</sup></a>`);
    this.html.push(`<span id='footnote_${name}'>`);
    choice = this.untilIn( ["#FootnoteEnd","#FootnoteRef","\r\n### %"]);
    //this.getTok();
    if( this.html.slice(-1)=="<br>")
      this.html.pop();    
    this.html.push(`</span>`);
  }, 
  // Very like footnote, but can be to a different page.
  handleLinkWithPreview( prefix ){
    // To end of line or closing brace.
    var args = this.getArgs();
    var page = args[0];
    var name = args[1];
    var line = `<a href="#${Registrar.repo};${page}!${prefix}${name}" class='popbox_link' onclick="OnFns.closeTip();" onmouseover="OnFns.showTipBoxFromDiv(event,'${prefix}${name}')">${name}</a>`; 
    this.html.push(line);
  }, 
  handleEqn(){
    this.handleLinkWithPreview( "equation_" );
  },
  handleFig(){
    this.handleLinkWithPreview( "figure_" );
  },
  handleSect(){
    this.handleLinkWithPreview( "section_" );
  },
  handleEx(){
    this.handleLinkWithPreview( "exercise_" );
  },
  handleEqnRef(  ){
    // To end of line or closing brace.
    var name = this.getBraced();
    //this.html.push(`<sup>${name}</sup>`);
    this.html.push(`<span id='Eqn${name}'>`);
    choice = this.untilIn( ["#EqnEnd"]);
    this.getTok();
    this.html.push(`</span>`);
  }, 

  // Scans to ) or end of line
  handleFn2( pre, post, option ){
    this.html.push( pre );
    // To end of line or closing brace.
    var choice = option;
    while( choice == option ){
      choice = this.untilIn( [")", "\r\n"]);
      if( choice == "\r\n")
        choice = this.peekTok(1);
      if( choice == option ){
        this.getTok();
        this.getTok();
        this.html.push( "<br>" );
      }
    }
    this.html.push(post);
    this.eat("\r\n");
    return choice;
  },
  // Scans to end of line, only.
  handleFn3( pre, post, option ){
    this.html.push( pre );
    // To end of line.
    var choice = option;
    while( choice == option ){
      choice = this.untilIn( ["\r\n"]);
      if( choice == "\r\n")
        choice = this.peekTok(1);
      if( choice == option ){
        this.getTok();
        this.getTok();
        this.html.push( "<br>" );
      }
    }
    this.html.push(post);
    this.eat("\r\n");
    return choice;
  },
  handleFn( pre, post, option ){
    this.html.push( pre );
    // To end of line or closing brace.
    var choice = this.untilIn( ["\r\n",option || ")"]);
    if( choice!="\r\n")
      this.getTok();
    this.html.push(post);
    return choice;
  },
  getArgs(){
    var args = this.getBraced();
    return args.split(",");
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
  handlePopBoxInner(classname){
//<button onclick=\"location.href='#$1';\"><a '><a href='#$1'>$2</a></button>");
    var name = "nut_"+(this.blobCounter++);
    var repo = Registrar.repo;

    this.html.push( `<span class='${classname}' onmouseover=\"OnFns.showTipBoxFromDiv(event,'${name}');\">`);
    this.untilEol();
    this.html.push('</span>');
    this.getTok();
    this.html.push(`<span id='${name}' style='display:none'>` );
    this.handleGroup();
    this.html.push('</span>');
  },
  handlePopBox(){
    this.handlePopBoxInner( 'popbox_link');
  },
  // different styling...
  handleMenu(){
    this.handlePopBoxInner('popbox_link2');
  },
  handleJump(){
    // HACK: nutj_1 avoids collision with nut_1 but real problem is using a new
    // counter
    this.inJump = true;
    var name = "nutj_"+(this.blobCounter++);
    var toks = this.getTok().trim().split(" ");
    var url = toks.shift()||"missing";
    var repo = Registrar.repo;
    if( !url.match(";"))
      url = repo+';'+url; 
    // Hack: no <br>

    var sel = url == ( `${Registrar.repo};${Registrar.page}` ) ? 
      " selected_box" : "";
    if( this.html.slice(-1)=="<br>")
      this.html.pop();        
    this.html.push( `<div class='popbox_link${sel}' onmouseover=\"OnFns.showTipBoxFromDiv(event,'${name}');\" onclick=\"location.href='#${url}'">`);
    // Use commented out line to disable multiscroller
//    this.html.push( `<div class='popbox_link${sel}' onclick=\"location.href='#${url}'">`);
    this.untilEol();
    this.html.push( toks.join(" "));
    this.html.push('</div>');
    //this.getTok();
    this.html.push(`<span id='${name}' style='display:none'>` );
    this.handleGroup();
    this.html.push('</span>');
    this.inJump=false;
  }, 
  handlePop(){
    var name = "nut_"+(this.blobCounter++);
    //var toks = this.getTok().trim();
    this.html.push( `<span class='popbox_link' onmouseover=\"OnFns.showTipBoxFromDiv(event,'${name}');\">`);
    this.untilEol();
    //this.html.push( toks );
    this.html.push('</span>');
    //this.getTok();
    this.html.push(`<span id='${name}' style='display:none'>` );
    this.handleGroup();
    this.html.push('</span>');
  },  
  handleUFO(){
    var name = "nut_"+(this.blobCounter++);
    this.handleFn( 
      `<span class='popbox_link' onmouseover=\"OnFns.showTipBoxFromDiv(event,'${name}');\">🛸 `,
      `</span><span id='${name}' style='display:none'><h1>🛸 UFO</h1>A plan for the far future.</span>` );
  },
  handleRock(){
    var name = "nut_"+(this.blobCounter++);
    this.handleFn( 
      `<span class='popbox_link' onmouseover=\"OnFns.showTipBoxFromDiv(event,'${name}');\">🚀 `,
      `</span><span id='${name}' style='display:none'><h1>🚀 Rocket</h1>A plan for the near future.</span>` );
  },
  handleBoat(){
    var name = "nut_"+(this.blobCounter++);
    this.handleFn( 
      `<span class='popbox_link' onmouseover=\"OnFns.showTipBoxFromDiv(event,'${name}');\">⛵ `,
      `</span><span id='${name}' style='display:none'><h1>⛵ Boat</h1>Code from the past needs updating.</span>` );
  },
  handlePen(){
    var name = "nut_"+(this.blobCounter++);
    this.handleFn( 
      `<span class='popbox_link' onmouseover=\"OnFns.showTipBoxFromDiv(event,'${name}');\">🖋️ `,
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
    var cinfo = this.eat("cinfo");
    this.eat("]");
    this.eat("");
    var plus = this.eat("+");
    if( !plus )
      plus = !this.eat("-");
    //plus = false;
    var preload = this.peekTok();
    preload = preload.match(/Toc(\d+)/);
    if( preload ){
      // discard TocNNN 
      this.getTok();
      preload = `OnFns.refreshToc(${preload[1]});`
    }
    else 
      preload = "";
    cinfo = cinfo?"text-align:center;" :"";
    var c1 = "#651";// dark surround
    var c2 = "#dca";// medium heading
    var c3 = "#fed";// light panel
    var c4 = "#002";// almost black

    var name = "nut_"+(this.blobCounter++);
    var initialState;
    if( plus )
      initialState = `<span id=\"${name}y\" style='color:${c1};display:none;'>►</span><span id=\"${name}n\" style='color:${c1};'>▼</span>` 
    else 
      initialState = `<span id=\"${name}y\" style='color:${c1};'>►</span><span id=\"${name}n\" style='display:none;color:${c1};'>▼</span>`;
    var showDiv = plus?"":"display:none;"
    this.html.push( `<div class='dropdown' style='background:${c2};color:${c4};padding:6px;border:0.5px solid ${c1};border-radius:6px 6px 0 0;width:auto;${cinfo}' onClick='${preload}DomUtils.toggleVisibility2(\"${name}\")'>${initialState}` );
    var choice = this.untilEol();
    this.html.push(`</div><div id=\"${name}\" style='background:${c3};color:${c4};padding:6px;border:0.5px solid ${c1};border-radius:0 0 6px 6px;border-top-style:none;width:auto;text-align:left;${showDiv}'>`);
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
  handleCode( ){
    this.bold = !this.bold || 0;
    if( this.bold){
      this.html.push("<span class='example'>");
      var choice = this.untilIn( ["\r\n",")","#GetCode("]);
      if( choice!="\r\n")
        this.getTok();
    }
    this.html.push("</span>");
    this.bold=false;
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
      var choice = this.untilIn( ["\r\n","`","*","**","#GetCode("]);
      if( choice!="\r\n")
        this.getTok();
      this.html.push("</span>");
    }
    this.tick=false;
  },
  handleIgnore( ){
    return ;
  },
  handleAction(){
    var args = this.getArgs();    
    this.html.push(`<button onclick='${args[1]||Alert}(${args[2]}||0, ${args[3]||0})'>${args[0]||"No prompt"}</button>`); 
  },
  handleTabs(){
    var args = this.getArgs();
    var index = args.shift();
    this.html.pop(); // remove br.
    this.html.push( `<div class="tab">`)
    for( var arg of args){
      var name = `${arg}${index}`.replace(/\s/g,"");
      this.html.push( `<button class="tablinks active" id="Header${name}" onclick="DomUtils.openTab(event, '${name}')">${arg}</button>`)
    }
    this.html.push( `</div>`)
  },
  handleToken( tok ){
    var token = tok || this.getTok();
    var translation = null;

    // Test using hasOwnProperty, otherwise properties like
    // fill() which we didn't add to fns are included too.
    if( this.fns.hasOwnProperty( token ))
      translation = this.fns[token];
    else {
      if( token.startsWith("\r\n")){
        if( token.startsWith("\r\n#"))
          ;
        else if( token.startsWith("\r\n>"))
          ;
        if( token.startsWith("\r\n*"))
          ;
        else
          ;//this.html.push("<br>");
      }
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
  // This is a hacky fix up for partially org mode docs,
  // in lieu of properly converting them into markdown first.
  orgModeFixUpOf( str ){
    // the italic fix dance...
    // The voodoo we're doing with $ here is to split the
    // string into text islands and LaTeX/Other islands.
    // for both $$ and $ LaTeX blocks and ``` blocks.
    // The magic we use here is that we will be ignoring 
    // the odd islands, so we trick $$ into being an odd island.
    str = str.replace(/\$\$/g, "$$=$$=$$");
    // protect islands...
    str = str.replace(/```/g, "$$XXX");
    // protect marked out /
    str = str.replace(/#\//g, "$$/$$");
    str = str.split("\$");
    // Just transform the even numbered islands.
    for(var i=0;i<str.length;i+=2){
      str[i] = str[i].replace( /\//g,"\*");
      // also fix super and subscripts...
      str[i] = str[i].replace( /(\^\{\S*?\})/g, "$$$1$$");
      str[i] = str[i].replace( /(\_\{\S*?\})/g, "$$$1$$");
    }
    str=str.join('\$');
    // restore in reverse order....
    str = str.replace(/\$\/\$/g, "/");
    str = str.replace(/\$XXX/g, "```");
    str = str.replace( /\$=\$=\$/g,"$$$$");
    // end of italic fix dance

    str = str.replace( /\#\+RESULTS.*/g, "" );
    str = str.replace( /\r\n: .*/g, "" );
    str = str.replace( /\r\n\r\n\r\n/g, "\r\n\r\n" );
    str = str.replace( /\r\n\r\n\r\n/g, "\r\n\r\n" );
    str = str.replace( /\r\n\r\n\r\n/g, "\r\n\r\n" );
    str = str.replace( /\r\n\r\n\r\n/g, "\r\n\r\n" );
    str = str.replace( /```\r\n\r\n/g, "```\r\n" );
    str = str.replace( /```\r\n\r\n/g, "```\r\n" );
    str = str.replace( /```\r\n\r\n/g, "```\r\n" );
    str = str.replace( /\$\$\r\n\r\n/g, "$$$$\r\n" );
    str = str.replace( /\$\$\r\n\r\n/g, "$$$$\r\n" );
    return str;
  },
  htmlOf2( str ){
    str = str.split( /\r?\n/g);
    str = str.join( "\r\n");
    return this.htmlOf(str );
  },
  htmlOf( str ){
    str = str || "Polyglot!";
    str = "LEADER\r\n"+str;

    // very hacky - detect org mode on pages that say '#page'.
    if( str.includes('#page('))
      str = this.orgModeFixUpOf( str );

    // This is our complete tokenizer!
    // Our tokens are either the things matched here
    // OR they are the strings between.
    // We discard empty tokens.
    this.tokens = str.split( this.splitterPattern );

    // All start-of-line patterns gain a \r\n before them, to make up
    // for the one they gobble.
    const regexBlock = /\r\n./; 
    const regexIndent = /^\r\n\>$|^\r\n\<$/; 
    for (let i = 0; i < this.tokens.length; i++) {
      if (regexBlock.test( this.tokens[i])) {
        this.tokens.splice(i, 0, '\r\n');
        i++; // Skip the newly added 'X' to avoid infinite loop
      }
      if (i>2 && regexIndent.test(this.tokens[i-2])){
        if( this.fns["\r\n"+this.tokens[i]] ){
          //debugger;
          //this.tokens[i] = ">"+this.tokens[i];
        }
      }
    }

    this.tk = 1;
    this.html = [];

    //this.measureSubtree( ctx, null, ast);
    //this.positionSubtree( null, ast, v );
    //this.outSubtree( ctx, ast );

    while( this.tk < this.tokens.length )
    {
      this.handleToken();
    }

    //str = str.filter(word => word != "");
    //str = str.map( word => this.fns[word] || word);
    str = this.html.join("");
    if( str.startsWith("<br>"))
      str = str.slice( 4 );
    var html = `<div>${str}</div>\r\n\r\n`;
    html = html.replace( /<hr><br>/g, "<hr>");
    // Custom anchor processing (from Pimellos)
    if( typeof chapterVerseLink != 'undefined' )
      html = chapterVerseLink( html );
    return "<span class='chunk'>"+ html+"</span>";// end the chunks!
  },
}

PolyHelper   = new Polyglot_Fmt();
Polyglot_Fmt = new Polyglot_Fmt();
Registrar.register( Polyglot_Fmt );
RR.PolyHelper = PolyHelper;

Exports();


return metaData;
}( Registrar );// end of polyglot_fmt_js

