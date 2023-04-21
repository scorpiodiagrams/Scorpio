
Getters = {};

Getters.handleIfKeyword = function( obj, tok ){
  var matches;

  matches = tok.match( /^Height([0-9\.\-]*)$/ );
  if( matches ){
    obj.height = firstValid( +(matches[1]), 1);
    return true;
  }
  matches = tok.match( /^Width([0-9\.\-]*)$/ );
  if( matches ){
    obj.width = firstValid( +(matches[1]), 1);
    return true;
  }
  matches = tok.match( /^Pad([0-9\.\-]*)$/ );
  if( matches ){
    obj.pad = firstValid( +(matches[1]), 1);
    return true;
  }
  matches = tok.match( /^InStem([0-9\.\-]*)$/ );
  if( matches ){
    obj.inStem = +matches[1] || 1;
    return true;
  }
  matches = tok.match( /^OutStem([0-9\.\-]*)$/ );
  if( matches ){
    obj.outStem = +matches[1] || 1;
    return true;
  }
  matches = tok.match( /^InPip([0-9\.\-]*)$/ );
  if( matches ){
    obj.inPip = +matches[1] || 1;
    return true;
  }
  matches = tok.match( /^OutPip([0-9\.\-]*)$/ );
  if( matches ){
    obj.outPip = +matches[1] || 1;
    return true;
  }

  return false;
}


Getters.handleIfGraphKeyword = function( obj, line, state ){
  var matches;

  matches = line.match( /^:([A-Z][A-Z]?(:[A-Z][A-Z]?)*):$/);
  if( matches ){
    var compound = matches[1];
    compound = compound.split( /:/);
    //console.log( "Split "+compound);
    var m;
    state.atoms=[];
    for( m of compound ){
      var ix = indexOfMoniker( state, m );
      var iy;
      for( iy in obj.atoms){
        if( pointsMatch( ix , iy) ){
          atom = obj.atoms[iy];        
          state.atoms.push( atom );
        }
      }
    }
    state.latestList = state.atoms;
    return true;
  }

//  // atom with format COMMAND,id,text:
//  matches = line.match( /^atom:\s*([A-z][A-z]?|\*)\s+(.+?)\s*$/);
//  if( matches){
//    var wild_atom = {};
//    wild_atom.points = [ indexOfMoniker( state, matches[1] ) ];
//    var some_atom;
//    state.atoms = [];
//    for( some_atom of obj.atoms){
//      if( pointsMatch( wild_atom.points[0], some_atom.points[0]) ){
//        atom = some_atom;        
//        state.atoms.push( atom );
//      }
//    }
//    if( !state.atoms.length && !isWild(wild_atom)){
//      atom = wild_atom;
//      if( !init_atom( atom, obj, state ) )
//        return true;
//      atom.value = matches[2]; 
//      obj.atoms.push( atom );
//      state.atoms.push( atom );
//    }
//    state.latestList = state.atoms;
//    return true;
//  }

  // bond with format COMMAND,id,id,text:
  matches = line.match( /^link:\s*([A-z][A-z]?|\*)\s+([A-z][A-z]?|\*)\s*(.*?)\s*$/);
  if( matches){
    var wild_bond = {};
    wild_bond.points = [ indexOfMoniker( state, matches[1] ),
      indexOfMoniker( state, matches[2] ) ];
    var some_bond;
    state.bonds = [];
    for( some_bond of obj.bonds){
      if( pointsMatch( wild_bond.points[0], some_bond.points[0]) &&
        pointsMatch( wild_bond.points[1], some_bond.points[1]) ){
        bond = some_bond;        
        state.bonds.push( bond );
      }
    }
    if( !state.bonds.length && !isWild(wild_bond)){
      bond = wild_bond;
      if( !init_bond( bond, obj, state ) )
        return true;
      bond.value = matches[3]; 
      obj.bonds.push( bond );
      state.bonds.push( bond );
    } else if ( matches[3]!=""){
      state.bonds[0].value = matches[3];
    }
    state.latestList = state.bonds;
    return true;
  }

  // link with format COMMAND,id,id,text:
  matches = line.match( /^link:\s*([A-z][A-z]?|\*)\s*([A-z][A-z]?|\*)\s*(.*?)\s*$/);
  if( matches){
    var wild_link = {};
    wild_link.points = [ indexOfMoniker( state, matches[1] ),
      indexOfMoniker( state, matches[2] ) ];
    var some_link;
    state.links = [];
    for( some_link of obj.links){
      if( pointsMatch( wild_link.points[0], some_link.points[0]) &&
        pointsMatch( wild_link.points[1], some_link.points[1]) ){
        link = some_link;        
        state.links.push( link );
      }
    }
    if( !state.links.length && !isWild(wild_link)){
      link = wild_link;
      if( !init_link( link, obj, state ) )
        return true;
      link.value = matches[3]; 
      obj.links.push( link );
      state.links.push( link );
    }
    state.latestList = state.links;
    return true;
  }

  // angle with format COMMAND,id,id,id,text:
  matches = line.match( /^angle:\s*([A-z][A-z]?|\*)\s+([A-z][A-z]?|\*)\s+([A-z][A-z]?|\*)\s*(.*?)\s*$/);
  if( matches){
    var wild_angle = {};
    wild_angle.points = [ indexOfMoniker( state, matches[1] ),
      indexOfMoniker( state, matches[2] ),
      indexOfMoniker( state, matches[3] ) ];
    var some_angle;
    state.angles = [];
    for( some_angle of obj.angles){
      if( pointsMatch( wild_angle.points[0], some_angle.points[0]) &&
        pointsMatch( wild_angle.points[1], some_angle.points[1]) &&
        pointsMatch( wild_angle.points[2], some_angle.points[2]) ){
        angle = some_angle;        
        state.angles.push( angle );
      }
    }
    if( !state.angles.length && !isWild(wild_angle)){
      angle = wild_angle;
      if( !init_angle( angle, obj, state ) )
        return true;
      angle.value = matches[4]; 
      obj.angles.push( angle );
      state.angles.push( angle );
    }
    state.latestList = state.angles;
    return true;
  }

  // quad with format COMMAND,id,id,id,id,text:
  matches = line.match( /^quad:\s*([A-z][A-z]?|\*)\s*([A-z][A-z]?|\*)\s*([A-z][A-z]?|\*)\s*([A-z][A-z]?|\*)\s*(.*?)\s*$/);
  if( matches){
    var wild_quad = {};
    wild_quad.points = [ indexOfMoniker( state, matches[1] ),
      indexOfMoniker( state, matches[2] ),
      indexOfMoniker( state, matches[3] ),
      indexOfMoniker( state, matches[4] ) ];
    var some_quad;
    state.quads = [];
    for( some_quad of obj.quads){
      if( pointsMatch( wild_quad.points[0], some_quad.points[0]) &&
        pointsMatch( wild_quad.points[1], some_quad.points[1]) &&
        pointsMatch( wild_quad.points[2], some_quad.points[2]) &&
        pointsMatch( wild_quad.points[3], some_quad.points[3]) ){
        quad = some_quad;        
        state.quads.push( quad );
      }
    }
    if( !state.quads.length && !isWild(wild_quad)){
      quad = wild_quad;
      if( !init_quad( quad, obj, state ) )
        return true;
      quad.value = matches[5]; 
      obj.quads.push( quad );
      state.quads.push( quad );
    }
    state.latestList = state.quads;
    return true;
  }

  matches = line.match( /^boxed:\s*(.*)$/ );
  if( matches ){
    obj.boxed = matches[1];
    return true;
  }
  matches = line.match( /^caption:\s*(.*)$/ );
  if( matches ){
    obj.caption = matches[1];
    return true;
  }
  matches = line.match( /^object:\s*(.*)$/ );
  if( matches ){
    obj.object = matches[1];
    return true;
  }

  return false;
}

Getters.handleMarkdown = function( obj, line, state ){

// Our markdown rules are highly trusting of the input!
// WARNING: No sanitization whatsoever.
// Every $1 is a potential exploit.

// for #Wiki: Systemic HACK.  We are parsing using regex, 
// and need to deal with a specific kind of () inside 
// our () delimitted segment. The negative lookahead ) allows 
// us to use ')' at the end of a link, which happens 
// with wikipedia disambiguation links.

  line = line.replace(/\*\*(.*?)\*\*/gi, '<b>$1</b>');
  line = line.replace(/\*(.*?)\*/gi, '<i>$1</i>');
  line = line.replace(/!\+\[(.*?)\]\((.*?) =(.*?)x(.*?)\)/gi, "<img alt='$1' class='coloured' src='$2' width='$3' height='$4'/>");
  line = line.replace(/!\+\[(.*?)\]\((.*?) =(.*?)x\)/gi, "<img alt='$1' class='coloured' src='$2' width='$3' />");
  line = line.replace(/!\+\[(.*?)\]\((.*?) =x(.*?)\)/gi, "<img alt='$1' class='coloured' src='$2' height='$3' />");
  line = line.replace(/!\+\[(.*?)\]\((.*?)\)/gi, "<img alt='$1' class='coloured' src='$2' />");
  line = line.replace(/!\[(.*?)\]\((.*?) =(.*?)x(.*?)\)/gi, "<img alt='$1' src='$2' width='$3' height='$4'/>");
  line = line.replace(/!\[(.*?)\]\((.*?) =(.*?)x\)/gi, "<img alt='$1' src='$2' width='$3' />");
  line = line.replace(/!\[(.*?)\]\((.*?) =x(.*?)\)/gi, "<img alt='$1' src='$2' height='$3' />");
  line = line.replace(/!\[(.*?)\]\((.*?)\)/gi, "<img alt='$1' src='$2' />");
  line = line.replace(/\[(.*?)\]\((.*?)\)/gi, state.generalLink );

  line = line.replace(/src='\.\/images\//gi, `src='${Registrar.imageSrc}`);

  if( state.moreLink )
    line = line.replace(/#More\((.*?)\)/gi, state.moreLink );
  line = line.replace(/#Wiki\((.*?)\)(?!\))/gi, "<a href='https://en.wikipedia.org/wiki/$1' target='blank'>On Wikipedia...</a>");
  line = line.replace(/#DropCap\((.*?)\)/gi, "<span class='bigLeft'>$1</span>");
  line = line.replace(/#DropCapRight\((.*?)\)/gi, "<span class='bigRight'>$1</span>");
  line = line.replace(/#ButtonWide\((.*?),(.*?)\)/gi, "<button class='wide' onclick=\"location.href='#$1';\"><a '><a href='#$1'>$2</a></button>");
  line = line.replace(/#Button\((.*?),(.*?)\)/gi, "<button onclick=\"location.href='#$1';\"><a '><a href='#$1'>$2</a></button>");
  line = line.replace(/#Repo\((.*?),(.*?)\)/gi, "<button onclick=\"setLocalRepo('$1');\"><a '><a href='#index'>$2</a></button>");
  
//  line=line.replace( /\> \[!info\]/gi,  

  if( state.heroHeading )
    line = line.replace(/^#HeroHead\((.*?),(.*?)\)/gi, state.heroHeading );
  if( state.heading )
    line = line.replace(/^#BlogHead\((.*?),(.*?)\)/gi, state.heading );
  if( state.subsiteHeading )
    line = line.replace(/^#ScorpioHead\((.*?),(.*?)\)/gi, state.subsiteHeading );
  line = line.replace(/^#NoBack/gi, "<div class='banners'>");
  line = line.replace(/^#BackAgain/gi, "</div>");
  line = line.replace(/^#Right\((.*)\)$/gi, "<div class='right'>$1</div>");
  line = line.replace(/#Code\((.*?)\)/g, "<span class='example'>$1</span>");

  line = line.replace(/^#Example\(/gi, "<div class='example'>");
  line = line.replace(/\)End#/gi, "</div>");

  line = line.replace(/#CloseBrace/gi, ")" );
  line = line.replace(/#UFO\((.*?)\)/g, "<span class='tooltip'>🛸 $1<span class='tooltiptext'>A plan for the far future</span></span>" );
  line = line.replace(/#Rock\((.*?)\)/g, "<span class='tooltip'>🚀 $1<span class='tooltiptext'>A plan for the near future</span></span>" );
  line = line.replace(/#Boat\((.*?)\)/g, "<span class='tooltip'>⛵ $1<span class='tooltiptext'>Code from the past needs updating</span></span>" );
  line = line.replace(/#Caption\((.*?)\)/g, "<div class='caption'><em>$1</em></div>" );






//  if( state.inlineJatex )
//    line = line.replace( /\$\$(.*?)\$\$/gi, state.inlineJatex );
  if( state.inlineKatex )
    line = line.replace( /\$\$(.*?)\$\$/gi, state.inlineKatex );

  line = line        
    .replace(/^(\[\])(.*)/, '<span class="highlight"><input type="checkbox" class="anki" id="item'+state.i+'"><label for="item'+state.i+'">$2</label></span>');
  line = line  
    .replace(/^(\[X\])(.*)/, '<span class="highlight"><input type="checkbox" checked="checked" class="anki" id="item'+state.i+'"><label for="item'+state.i+'">$2</label></span>');

  line = DomUtils.escapeEmoji( line );
  state.fragment = line;

  if( typeof Katex_Fmt )
    line = line.replace(/^#!!Katex:(.*$)/gim, function( match, capture ){ return Katex_Fmt.htmlOf( capture );});

  line = line.replace(/^####(.*$)/gim, '<h4>$1</h4>');
  line = line.replace(/^###(.*$)/gim, '<h3>$1</h3>');
  line = line.replace(/^##(.*$)/gim, '<h2>$1</h2>');
  line = line.replace(/^#(.*$)/gim, '<h1>$1</h1>');
  line = line.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');
  line = line.replace(/^\< (.*$)/gim, '<blockquote class="right">$1</blockquote>');
  line = line.replace(/^----*$/gim, '<hr>');
  line = line.replace(/^-( -)*$/gim, '<hr>');

  obj.line = line;

}


// this is no longer actively used.
function htmlOfMediaWiki( str )
{
  str = str.replace( /__NOTOC__/g, "" );
  str = str.replace( /^----*/gm, "<hr>");
  str = str.replace( /\[http(\S*)\s([^\]]*)\]/g,"<a" +
    " href='http$1'>$2</a>");
  str = str.replace( /\[\[File:([^\]]*)\]\]/g, "<img" +
    " style='width:700px;border:solid black 1px' src='./images/$1'>");
  str = str.replace( /https:\/\/wit.audacityteam.org\//g, '' );
  str = str.replace( /\[\[Toolbox\/([^\|\]]*)\|([^\[]*)\]\]/g, "<a" +
    " href='raw/raw_spec_$1.txt'>$2</a>");
  str = str.replace( /\[\[Toolbox\/([^\]]*)\]\]/g, "<a" +
    " href='raw/raw_spec_$1.txt'>$1</a>");
  str = str.replace( /#.\.txt/g, ".txt" );

  str=str.replace( /{{ATK_Header}}/g,
    "<div style='margin:0 auto;background:#EEEEFF;padding:10px;border:1px solid" +
    " #999999;width:90%;align:center;margin-top:30px;margin-bottom:30px'" +
    ">This is an example interactive" +
    " diagram created with " +
    "<a href='https://wikidiagrams.com'>Wikidiagrams" +
    "</a>.  The aim of the Wikidiagrams" +
    " project is to provide interactive diagrams for Wikipedia. "+
    " Before it is ready for that, it will be used for biochemical pathways and" +
    " other interactive diagrams.</div>");

  str = str.replace( /^======(.*)======/gm, "<h2>$1</h2>" );
  str = str.replace( /^=====(.*)=====/gm, "<h3>$1</h3>" );
  str = str.replace( /\*\*(.*)\*\*/gm, "<b>$1</b>" );
  str = str.replace( /~~(.*)~~/gm, "<s>$1</s>" );
  str = str.replace( /\n'''\n([\s\S]*?)\n'''\n/g, "<pre><xmp>$1</xmp></pre>" );
  str = str.replace( /(\s)http(\S*)(\.\s)/gm, "$1<a href='http$2'>http$2</a>$3" );
  str = str.replace( /(\s)http(\S*)(\s)/gm, "$1<a href='http$2'>http$2</a>$3" );

  str = str.replace( /^\*/gm, "<br> • " );
  str = str.replace( /\n\n([^<])/gm, "<br><br>$1" );
  str = str.replace( /\{\{#widget:WikiDiagram\|page=([_A-Z0-9a-z\u00C0-\u017F]*).*?\}\}/gm, '        <div id="content_here1" class="atkContentDiv2" data-page="$1">\n' +
    '        </div>' );
  return str;
}
