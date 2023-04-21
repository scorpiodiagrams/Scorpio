// Markdown format allows all standard markdown processing
// Has nutshell extension.
function Markdown_Fmt(){
  return this;
}

Markdown_Fmt.prototype ={
  name : "Markdown",
  bubblesMade : 0,
  bubblesRequested : 0,
  hasBigLogo : false,

  debug(A,url,text){
    alert( url );
  },
  heroHeading(match,date,title){
    DomUtils.setFavicon( './centaur.ico');
    return Markdown_Fmt.htmlOf(`#NoBack\r\n#${title}\r\n![Centaur](${Registrar.imageSrc}centaur_public_domain.svg)\r\n\r\n#BackAgain`);
  },
  heading(match,date,title){
    DomUtils.setFavicon( './centaur.ico');
    return Markdown_Fmt.htmlOf(`#NoBack\r\n#${title}\r\n![Centaur](${Registrar.imageSrc}centaur_public_domain.svg =250x)\r\n\r\n#BackAgain\r\n🕔 *${date}, by James Crook*`);
  },
  subsiteHeading(match,date,title){
    //DomUtils.setFavicon( './scorpio.ico');
    Markdown_Fmt.hasBigLogo = true;
    // We're showing a big logo, so hide the small one.
    return Markdown_Fmt.htmlOf(`#NoBack\r\n#${title}\r\n![Scorpion](${Registrar.imageSrc}Scorpion.svg =250x)\r\n\r\n#BackAgain`);
  },
  inlineKatex(match,formula){
    return Katex_Fmt.htmlInlineOf( "\\small "+formula );
  },
  inlineJatex(match,formula){
    return Jatex_Fmt.htmlInlineOf( formula );
  },
  moreLink(match,link){
    return `<a href='${link}'>More...</a>`;
  },
  generalLink(match,name,link){
    if( link.includes("http")){
      ;
    } else if( !link.includes(";") ){
      link = "#"+Registrar.repo + ";"+link;
    }
    return `<a href='${link}'>${name}</a>`;
//  return `<a target='blank' href='https://en.wikipedia.org/wiki/${newLink}'>${name}</a>`;
  },
  nutMaker(match, arg){
    var that = Markdown_Fmt;

    var result = `<span class="nutshell-button" onClick="DomUtils.toggleVisibility('nut${that.bubblesRequested++}')">${arg}</span>`;

    return result;
  },

  htmlOf( str ){
    //str = str || "No text provided in this section";
    str = str.replace(/\r\n/g, "\n");
    var lines = str.split("\n");
    var html = "";
    var indent = 0;
    var bubble = 0;
    //this.bubblesMade = 0;
    //this.bubblesRequested =0;
    var that = Markdown_Fmt;
    that.bubblesRequested = 0;
    this.bubblesMade = 0;

    var state = {};
    state.heroHeading = this.heroHeading;
    state.heading = this.heading;
    state.subsiteHeading = this.subsiteHeading;
    if( typeof Jatex_Fmt )
      state.inlineJatex = this.inlineJatex;
    if( typeof Katex_Fmt )
      state.inlineKatex = this.inlineKatex;
    state.moreLink = this.moreLink;
    state.nutMaker = this.nutMaker;
    state.generalLink = this.generalLink;


    for( i in lines){
      var line = lines[i];

      if( line.match( /#\[/)){
        var style = 'style="display:none" ';
        var nutStart = `<div class="nutshell-bubble" ${style}id="nut${this.bubblesMade++}">`;
        line = line.replace(  /#\[/g, nutStart); 
      }
      if( line.match( /#\]/)){
        line = line.replace(  /#\]/g, '</div>'); 
      }

      if( line.match( /#NUT\(.*?\)/)){
        line = line.replace(  /#NUT\((.*?)\)/g, state.nutMaker);
      }
      if( line.match( /#NUTC\(.*?\)/)){
        line = line.replace(  /#NUTC\((.*?)\)/g, state.nutMaker);
      }

      // Stuff at start of line for bulleted list
      new_bullets = line.match( /^(\**)/ )[0];
      new_length = new_bullets.length;
      // remove extra space, if present.
      line = line.replace( /^\*\** /gi, '<li>' );
      line = line.replace( /^\*\**/gi, '<li>' );
      while( new_length > indent){
        line = "<ul>\n" +line;
        indent++;
      }

      while( new_length < indent){
        line = "</ul>\n" + line;
        indent--;
      }
      indent = new_length;

      var obj = {};
      Getters.handleMarkdown( obj, line, state );
      line = obj.line;


      if( (new_length == 0) && (state.fragment==line)){
        if( line == "")
        {
          if( (i>0 ) && (lines[i-1]=="" ))
            line = "<br/><!--bip-->";
        }
        else if( i != 0 )
          line = "<p>"+line+"</p>";
      }
      html += line + "\r\n";
    }
    return html;// + "<br/>";
  },
  afterLoading(){
    // Show little logo?
    var show = !Markdown_Fmt.hasBigLogo;
    DomUtils.setVisibility( "little_logo", show );
  }

}

Markdown_Fmt = new Markdown_Fmt();
Registrar.register( Markdown_Fmt );