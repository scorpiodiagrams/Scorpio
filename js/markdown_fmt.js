// Markdown format allows all standard markdown processing
// Has nutshell extension.
function Markdown_Fmt(){
  return this;
}

var pageReplacements = {
  'vectors': 'Euclidean_vector',
  'differential_operators': 'Vector_operators',
  'maxwells_equations': 'maxwells_equations',
  'differentiation': 'Differential_calculus',
  'trigonometry': 'trigonometry',
  'complex_numbers': 'Complex_number',
  'immunology': 'Immunology',

  'scorpio_labels': '#scorpio_labels',
  'scorpio_link_styles': '#scorpio_link_styles',
  'scorpio_blocks': '#scorpio_blocks',
  'scorpio_connections': '#scorpio_connections',
  'index': '#index',
  'scorpio_diagram_types': '#scorpio_diagram_types',
  'scorpio_diagrams': '#scorpio_diagrams',
  'scorpio_example_diagrams': '#scorpio_example_diagrams',
  'more_examples': '#more_examples',
  'more_label_styles': '#more_label_styles',
  'scorpio_cards': '#scorpio_cards',
  'scorpio_connections': '#scorpio_connections',
  'scorpio_details_panel': '#scorpio_details_panel',
  'diagram_forge': '#diagram_forge',
  'smiles': '#smiles',
  'sankey_lines': '#sankey_lines',
  'gitwrapping': '#gitwrapping',
  'snippet': '#snippet',
  'downloads': '#downloads',
//  'scorpio_charts': '#scorpio_charts',
};

function linkReplacement( link ){
  if(!Registrar.useUrlChecklist)
    return link;
  if( !link.startsWith('#'))
    return link;
  return pageReplacements[ link.slice(1) ];
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
    return Markdown_Fmt.htmlOf(`#NoBack\r\n#${title}\r\n![Centaur](./images/centaur_public_domain.svg)\r\n\r\n#BackAgain`);
  },
  heading(match,date,title){
    DomUtils.setFavicon( './centaur.ico');
    return Markdown_Fmt.htmlOf(`#NoBack\r\n#${title}\r\n![Centaur](./images/centaur_public_domain.svg =250x)\r\n\r\n#BackAgain\r\n🕔 *${date}, by James Crook*`);
  },
  subsiteHeading(match,date,title){
    DomUtils.setFavicon( './scorpio.ico');
    Markdown_Fmt.hasBigLogo = true;
    // We're showing a big logo, so hide the small one.
    return Markdown_Fmt.htmlOf(`#NoBack\r\n#${title}\r\n![Scorpion](./images/Scorpion.svg =250x)\r\n\r\n#BackAgain`);
  },
  inlineKatex(match,formula){
    return Katex_Fmt.htmlInlineOf( "\\small "+formula );
  },
  moreLink(match,link){
    var newLink = linkReplacement( link );
    if( newLink == link )
      return `<a href='${newLink}'>More...</a>`;

    if( newLink )
      return `#Wiki(${newLink})`
    else
      return `<!--${link}-->`;
  },
  generalLink(match,name,link){
    var newLink = linkReplacement( link );
    if( newLink == link)
      return `<a href='${newLink}'>${name}</a>`;
    if( newLink)
      return `<a target='blank' href='https://en.wikipedia.org/wiki/${newLink}'>${name}</a>`;
    return ` MISSING_LINK ${name} `;
  },
  nutMaker(match, arg){
    var that = Markdown_Fmt;

    var result = `<span class="nutshell-button" onClick="DomUtils.toggleVisibility('nut${that.bubblesRequested++}')">${arg}</span>`;

    return result;
  },

  htmlOf( str ){
    str = str || "No text provided in this section";
    str = str.replace(/\r\n/g, "\n");
    var lines = str.split("\n");
    var html = "";
    var indent = 0;
    var bubble = 0;
    //this.bubblesMade = 0;
    //this.bubblesRequested =0;

    var state = {};
    state.heroHeading = this.heroHeading;
    state.heading = this.heading;
    state.subsiteHeading = this.subsiteHeading;
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
    showLittleLogo( !Markdown_Fmt.hasBigLogo );
  }

}

Markdown_Fmt = new Markdown_Fmt();
Registrar.register( Markdown_Fmt );