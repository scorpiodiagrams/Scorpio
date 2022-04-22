
// utility functions, adjunct ot reading.


const codeForA = + ("A".charCodeAt(0));

function monikerOfIndex( i ){
  var str = "";
  i= +i;// in case it was a string!
  if( i>=26 ){
    str = String.fromCharCode(
      codeForA + Math.floor( i/26)-1);
    i = i % 26;
  }
  str += String.fromCharCode( codeForA +i);
  return str;
}

function existingIndexOfMoniker( state, str ){
  if( state.atomRenamer[str])
    return state.atomRenamer[str];
  return -1;  
}

function indexOfMoniker( state, str ){
  if( str.charAt(0) == '*')
    return '*';
  if( isDefined(state.atomRenamer[str]))
    return state.atomRenamer[str];

  var result = str.charCodeAt(0)-codeForA;
  if( str.length > 1){
    result = (result+1)*26;
    result += str.charCodeAt(1)-codeForA;
  }
  // result is now the unadjusted index.
  return result;
}

function requestNewNamedAtom( state, str ){
  state.atomRenamer[str] = state.atomCounter;
  return state.atomCounter++;
}

function requestNewAnonymousAtom( state ){
  return state.atomCounter++;
}


function pointsMatch( i, j){
  if( i=='*')
    return true;
  return( i==j );
}

function isWild( obj ){
  for( point of obj.points )
    if( point == '*')
      return true;
  return false;
}

function joinableTip( card ){
  return card;//card.split(/\r?\n/).join('~\r\n');
}


function removeTips( star ){
  var atoms = star.atoms;
  for( atom of atoms)  {
    atom.card = "";
  }
}

function init_angle( angle, obj, state){
  return true;
}

function init_bond( bond, obj, state){
  var linkWidth = obj.bondLineStyle.linkWidth;
  var fontSize = 12;
  bond.linkWidth = linkWidth;
  bond.l1 = 1;
  var atomTo = obj.atoms[bond.points[1]];
  // The whole parsing process needs to become
  // more robust to user error.
  // This is just one example of a sanity test.
  if( !atomTo )
    return false;
  bond.l1 = atomTo.level;      
  bond.endShape2= "=>";
  if( state.defaultBend )
    bond.bend = state.defaultBend;
  if( obj.style.multiplicity ){
    bond.multiplicity = obj.style.multiplicity;
  }
  return true;
}

function init_quad( quad, obj, state ){
  return true;
}




function removeEscapes( str ){
  str = str.replace(/(?<!\\)\\n/g,"<br>" );
  str = str.replace(/(?<!\\)\\"/g,"\"" );
  str = str.replace(/\\\\/g,"\\");
  return str;
}

function defaultInfoTip( caption ){
  return "<h3>"+caption+"</h3><b>Credits:</b> <em>©2022 CC-BY-SA-4.0</em>";
}

function metaInfoObject( caption, infoTip, boxed, options)
{
  obj = 
  {"Prog":"Setup",
   "code":[
     "setCaption",""+caption,
     "setCreditsTip", infoTip || defaultInfoTip( caption ) ]    
  };
  if( boxed)
    obj.boxed = boxed;
  if( options )
    obj.options = options;
  return obj;
}



function setColourScheme( ctx, style, obj, v0, v1 ){
  setSolid( ctx, style, obj, v0, v1, style.colourScheme );
}




function setStandardStyles( obj, stylename ){
  obj.value = obj.value || stylename;
  obj.atomLabelStyle = obj.atomLabelStyle || {foo:true};
  obj.bondLineStyle  = obj.bondLineStyle  || {foo:true};
  obj.angleStyle = obj.angleStyle || {foo:true};
}





// 1 - pastel labels (opaque)        'pastel:border'
// 2 - pastel labels (translucent)   'pastel:translucent:border'
// 3 - dark black line               'plain:black'
// 4 - geometry link                 'plain:standard'
// 5 - molecular link                'plain:grey'
// 6 - pale shield                   'plain:white:translucent'

// use standard+3 to add 3 colour stops on
// use rainbow to use the rainbow colour scheme.



//----- Only relevant to links ------
// defaultLinkType : "Narrow" - can be styled wavy, double, 
// but it is fixed width.  No outline.

// defaultLinkType : "Wide" - can have width that changes 
// between left and right ends. Can have an outline.
// Cannot currently have a label on it.
// both kinds support 'bend'
//----- Colour
// 
// A 'shield' is the colour expanse that text is drawn on.
// ===== This is actually drawn using drawTaper()
// A 'line' is a possibly elaborate line that may have
// a shield on it.
// ===== This is actually drawn using drawStyledLine()

// A label consists of a shield plus a line.
// There is a style for each of 
//   labels (optionally have lines)
//   links  (optionally have shields)
//   angles (optionally have lines)
// Each style has two colourSchemes, one for 
//   any label part (text will be against this, typically)
//   any line part
// Thus labels on links do not have to have the same colour
// as labels.
//
// The colour schemes support fixed colours, and also
// colours indexed via a label, 


function readMolecule( obj, str ){
  setStandardStyles( obj, "Molecule");

  obj.atomLineStyle = {
    defaultLinkType : "Narrow",
    colourScheme : 'plain:grey',
    linkWidth : 2,
    fontSize : 12,
    lineExtend : -25,    
  }
  obj.atomLabelStyle = {
    colourScheme : 'border:standard+2:pastel:atoms',
    fixedRadius : 8,
    xMagnify: 0,
    yMagnify: 0.8,
    pad: -1,
    fontSize : 13,
    fontYAdjust : -1,
    lineWidth : 0.5,
  };
  obj.bondLineStyle = {
    defaultLinkType : "Narrow",
    colourScheme : 'plain:grey',
    linkWidth : 2,
    fontSize : 10,
    lineExtend : -25,  
    idealDistance: 40, // for energy minimisation.  
  }
  var map = readStandardStyle( obj, str );
  return map;
}

function readGeometry( obj, str ){
  setStandardStyles( obj, "Geometry");

  obj.atomLabelStyle = {
    colourScheme : 'border:standard',
    fontSize : 15,
    lineWidth : 1,
  };
  obj.bondLabelStyle = {
    colourScheme : 'border:standard+2:pastel',
    fontSize : 12,
    fontYAdjust : -2,    
    lineWidth : 0.5,
  };
  obj.bondLineStyle = {
    defaultLinkType : "Wide",
    colourScheme : 'border:standard+2',
    lineWidth : 1,
    linkWidth : 3,
    fontSize : 15,
  }
  var map = readStandardStyle( obj, str );
  return map;
}

function readLineArt( obj, str ){
  setStandardStyles( obj, "LineArt");

  obj.atomLabelStyle = {
    lineWidth : 2,
    fontSize : 12,
    fontYAdjust : -2,    
    colourScheme : 'plain:white:translucent',
    rgbText : '#000',
  };
  obj.bondLabelStyle = {
    colourScheme : 'plain:black:translucent',
    linkWidth : 2,
    fontSize : 10,
    fontYAdjust : -3,    
  }
  obj.bondLineStyle = {
    defaultLinkType : "Narrow",
    colourScheme : 'plain:black',
    linkWidth : 2,
    fontSize : 12,
    fontYAdjust : -1,    
    lineExtend : -35,    
    endSize : 7,
  }

  var map = readStandardStyle( obj, str );
  return map;
}


function readAnnotated( obj, str ){
  setStandardStyles( obj, "Annotated");

  obj.atomLabelStyle = {
    lineWidth : 2,
    fontSize : 12,
    fontYAdjust : -2,    
    colourScheme : 'plain:black:translevel',
    rgbText : '#fff',
  };
  obj.bondLabelStyle = {
    colourScheme : 'plain:black:translucent',
    linkWidth : 2,
    fontSize : 12,
    fontYAdjust : -1,    
  }
  obj.bondLineStyle = {
    colourScheme : 'plain:black',
    defaultLinkType : "Narrow",
    linkWidth : 2,
    lineWidth : 2,
    fontSize : 12,
    fontYAdjust : -1,    
    lineExtend : -20,    
    endSize : 7,
  }

  var map = readStandardStyle( obj, str );
  return map;
}


function readSceneGraph( obj, str ){
  setStandardStyles( obj, "SceneGraph");
  obj.atomLabelStyle = {
    lineWidth : 2,
    sizeGranularity : 0.5,
    xGranularity : 90,
    colourScheme : '3d:blueblack',
    fontSize : 17,
    bevel: 4,
  };
  obj.bondLabelStyle = {
    lineWidth : 2,
    colourScheme : 'plain:black:soften',
    fontSize : 10,
  };
  obj.bondLineStyle = {
    defaultLinkType : "Narrow",
    colourScheme : 'plain:black',
    linkWidth : 2,
    lineExtend : -27,
  };


  var map = readStandardStyle( obj, str );
  var star = map[1];
  star.value = "Flowchart";
  return map;
}

function readCodeTiles( obj, str ){
  setStandardStyles( obj, "CodeTiles");
  obj.atomLabelStyle = {
    lineWidth : 2,
    sizeGranularity : 0.5,
    colourScheme : '3d:darken:soften',
    fontSize : 17,
    bevel: 4,
  };
  obj.bondLabelStyle = {
    lineWidth : 2,
    colourScheme : 'plain:black:soften',
    fontSize : 10,
  };
  obj.bondLineStyle = {
    defaultLinkType : "Narrow",
    colourScheme : 'plain:black',
    linkWidth : 4,
    lineExtend : -27,
  };

  var map = readStandardStyle( obj, str );
  var star = map[1];
  star.value = "Flowchart";
  return map;
}



function readGenericDiagram( obj, str ){
  setStandardStyles( obj, "GenericDiagram");
  obj.atomLabelStyle = {
    lineWidth : 2,
    fontSize : 16,
    fontYAdjust : 0,    
    colourScheme : 'plain:standard+2',
    lineExtend : 100,
  };
  obj.bondLabelStyle = {
    lineWidth : 2,
    fontSize : 10,
    fontYAdjust : -3,    
    colourScheme : 'plain:standard+3:lighten',
    lineExtend : 100,
  };
  obj.bondLineStyle = {
    defaultLinkType : "Narrow",
    colourScheme : 'plain:black',
    linkWidth : 2,
    lineExtend : -40,
    endSize : 7,
  }

  var map = readStandardStyle( obj, str );
  return map;
}


function readFlowchart( obj, str ){
  setStandardStyles( obj, "FlowChart");
  obj.atomLabelStyle = {
    lineWidth : 3,
    sizeGranularity : 50,
    colourScheme : 'pastel:border:soften',
    fontSize : 17,
    bevel: 4,
    rgbText : '#000',
  };
  obj.bondLineStyle = {
    defaultLinkType : "Wide",
    colourScheme : 'rainbow',
    lineWidth:1,
    linkWidth : 4,
    lineExtend : -60,    
  };


  var map = readStandardStyle( obj, str );
  var star = map[1];
  star.value = "Flowchart";
  return map;
}

function readRainbow( obj, str ){
  setStandardStyles( obj, "Rainbow");
  obj.atomLabelStyle = {
    lineWidth : 3,
    colourScheme : '3d:rainbow',
    fontSize : 17,
    bevel: 4,
  };
  obj.bondLineStyle = {
    defaultLinkType : "Wide",
    colourScheme : '3d:rainbow',
    lineWidth: 1,
    linkWidth: 4,
    lineExtend: -60,    
  };


  var map = readStandardStyle( obj, str );
  var star = map[1];
  star.value = "Flowchart";
  return map;
}



function readStarMap( obj, str ){
  setStandardStyles( obj, "StarMap");

  obj.atomLabelStyle = {
    lineWidth : 2,
    fontSize : 12,
    fontYAdjust : -2,    
    colourScheme : 'plain:white:translevel',
    rgbText : '#fff',
  };
  obj.bondLabelStyle = {
    colourScheme : 'plain:white:translucent',
    linkWidth : 2,
    fontSize : 12,
    fontYAdjust : -1,    
    rgbText : '#fff',
  }
  obj.bondLineStyle = {
    colourScheme : 'plain:white',
    defaultLinkType : "Narrow",
    linkWidth : 2,
    lineWidth : 2,
    fontSize : 12,
    fontYAdjust : -1,    
    lineExtend : -25,    
  }

  var map = readStandardStyle( obj, str );
  return map;
}


function readSnake( obj, str ){
  console.log( "Snake Read");
  var map = readStandardStyle( obj, str );
  var star = map[1];
  map[1] = deltaOfStar( star, 99 );
  return map;
}

function readQuads( obj, str ){
  console.log( "Quad Read");
  var map = readStandardStyle( obj, str );
  var star = map[1];
  map[1] = deltaOfStar( star, 4 );
  //removeTips( star );
  return map;
}

function readMindMap( obj, str ){

  var map = readStandardStyle( obj, str );
  obj.value = "MindMap";
//  setStandardStyles( obj, "MindMap");
  return map;
}

function readSankey( obj, str ){

  obj.value = "Sankey";
  obj.atomLabelStyle = 
    {
      lineWidth:2,
      colourScheme : 'white:ghost:plain',
      fontSize : 16,
      rgbText : '#00000020',
    };

  var map = readStandardStyle( obj, str );
  return map;
}


function setItems( name, matches, state ){
  if( matches ){
    if( state && state.latestList)
      for( elt of state.latestList){
        elt[name] = matches[1] || " ";
      }
      return true;
  }
  return false;
}

function setNums( name, matches, state ){
  if( matches ){
    if( state && state.latestList)
      for( elt of state.latestList){
        elt[name] = +(matches[1]);
      }
      return true;
  }
  return false;
}

function setBools( name, matches, state ){
  if( matches ){
    if( state && state.latestList)
      for( elt of state.latestList){
        elt[name] = true;
      }
      return true;
  }
  return false;
}



function readStandardStyle( obj, str ){
  obj.atoms = [];
  obj.bonds = [];
  obj.quads = [];
  obj.angles = [];
  obj.style = obj.style ||  {  };

// thingLabelStyle 
//    - can have a font size.
//    - a fontYAdjust
//    - x,y any Granularity.

// thingLineStyle
//    - can have lineExtend (often negative)
//    - defaultLinkType Wide or Narrow.

  obj.atomLabelStyle = obj.atomLabelStyle ||
    {
      lineWidth:2,
      colourScheme : '3d',
      fontSize : 16,
      rgbText : '#fff',
    };
  obj.atomLineStyle = obj.atomLineStyle ||
    {
      lineWidth:1.5,
      colourScheme : 'plain:black',
      fontSize : 16,
      rgbText : '#fff',
      lineExtend:35,
    };
  obj.bondLabelStyle = obj.bondLabelStyle ||
    {
      lineWidth: 1,
      colourScheme : 'rainbow:border',
      fontSize : 16,
      rgbText : '#fff',

      defaultLinkType : "Wide",
      // don't define linkWidth
      // that's the way to get tapers.
      linkWidth : undefined,
    };
  obj.bondLineStyle = obj.bondLineStyle ||
    {
      lineWidth: 1,
      colourScheme : 'rainbow:plain',
      defaultLinkType : "Wide",
      // don't define linkWidth
      // that's the way to get tapers.
      linkWidth : undefined,
    };
  obj.angleStyle = obj.angleStyle ||
    {

    };
  setStandardStyles( obj, "StandardStyle");

  obj.pos = {'x':0,'y':0};
  obj.rect = {'x':700,'y':400};


  var lines = str.split(/\r?\n/);

  var obj2;

  var P = new TreeParser( obj );
  P.toAtom = -1;
  P.theta = 2 * 3.141 / lines.length; 
  P.index = [];
  P.indent = 0;
  P.defaultBend = undefined;

  var atom;
  var bond;
  var bonds = [];
  var angle;
  var angles = [];
  var elt;

  var state = {};
  state.P = P;
  state.atomRenamer = {};
  state.atomCounter = 0;
  for( var i=0;i<lines.length;i++){
    var line = lines[i];

    if( state.bonds )
      bonds = state.bonds;
    if( state.angles )
      angles = state.angles;

    if( line.startsWith("##"))
      continue;
    var matches; 
    matches = line.match( /^card:/);
    if( matches ){
      if( state.atoms.length<1)
        continue;
      var card = "";
      while( (i<lines.length-1) && matches  )
      {
        line = lines[i+1]+"\r\n";
        matches = !line.match( /^\S*:/);
        if( matches) {
           card += line;
           i++;
        }
      }
      for( atom of state.atoms)
        atom.card = card;
      continue; 
    }

    // for an 'at' line, the atom must exist already.
    matches = line.match( /^:([A-Z][A-Z]?):\s+at:\s*([0-9\.\-]*),([0-9\.\-]*)/u );
    if( matches){
      atom=obj.atoms[indexOfMoniker(state,matches[1])];
      // silently ignore if we don't recognise the atom..
      if( atom ){
        atom.x = +matches[2];
        atom.y = +matches[3];
        atom.placed = true;
        state.atoms=[atom];
        state.latestList = state.atoms;
      }
      continue;
    }
    matches = line.match( /^(\**):([A-Z][A-Z]?):\s+(.*?)\s*$/u );
    if( matches){
      // we use the 'does it exist? version' ,
      // because we do not want to use fallbacks.
      atom=obj.atoms[existingIndexOfMoniker(state,matches[2])];
      // Tree items must not exist already...
      // So if we matched this line, it's new.
      if( !atom )
      {
        requestNewNamedAtom( state, matches[2]);
        state.atoms = [ addMMAtom( P, obj, matches) ];
        state.latestList = state.atoms;
        continue; // the for loop.
      }
      // this is silently ignoring a request to 
      // update an atom using creation format.
      state.atoms=[atom];
      state.latestList = state.atoms;
      continue;
    }

    // don't want things that look like a keyword
    matches = line.match( /^[a-z]*:/u );
    if( !matches && line ){
      // do want things that look like a label
      matches = line.match( /^(\**)\s?(.*?)\s*$/u );
      if( matches){
        // fill in a dummy missing item.
        requestNewAnonymousAtom( state);
        matches.splice(2, 0, {});
        state.atoms = [ addMMAtom( P, obj, matches) ];
        state.latestList = state.atoms;
        continue; // the for loop.
      }
    }

    // used for example to inject an image into the
    // structure, when using hitboxes.
    matches = line.match( /^object:\s*(.*?)\s*/);
    if( matches ){
      obj.extra = JSON.parse( matches[1]);
      continue;
    }

// Multi version handled in getters.
//    // :A: at: 293,184
//    matches = line.match( /^:([A-Z][A-Z]?):$/u );
//    if( matches){
//      atom=obj.atoms[indexOfMoniker(state,matches[1])];
//      state.atoms = [ atom ];
//      state.latestList = state.atoms;
//      continue;
//    }

    matches = line.match( /^:info:/);
    if( matches ){
      // treat the whole object as an atom!!
      state.atoms = [ obj ];
      state.latestList = state.atoms;
      continue;
    }

    matches = line.match( /^multiplicity:\s*(\S+)$/);
    if( matches ){
      for( bond of state.bonds)
        bond.multiplicity = +(matches[1]);
      continue;
    }

    matches = line.match( /^size:\s*([0-9\.\-]+)\s*$/)
    if( setNums( 'size', matches, state ))
      continue;
    matches = line.match( /^level:\s*([0-9\.\-]+)\s*$/)
    if( setNums( 'level', matches, state ))
      continue;
    matches = line.match( /^label:\s*(.*)\s*$/)
    if( setItems( 'value', matches, state ))
      continue;
    matches = line.match( /^hide:\s*$/)
    if( setBools( 'hide', matches, state ))
      continue;

    matches = line.match( /^subdiagram:\s*(.*?)\s*$/ );
    if( setItems( 'subdiagram', matches, state ))
      continue;

    matches = line.match( /^image:\s*(.*?)\s*$/ );
    if( setItems( 'src', matches, state ))
      continue;

    matches = line.match( /^hmul:\s*([0-9\.\-]+)\s*$/)
    if( setNums( 'hmul', matches, state ))
      continue;
    matches = line.match( /^vmul:\s*([0-9\.\-]+)\s*$/)
    if( setNums( 'vmul', matches, state ))
      continue;

    matches = line.match( /^cloze:\s*(.*)$/ );
    if( matches ){
      if( state && state.latestList)
        for( elt of state.latestList){
          elt.oldValue = elt.oldValue || elt.value;
          elt.value = matches[1] || " ";
          elt.styled = elt.value;
        }
        continue;
    }


    matches = line.match( /^bend:\s*(\S+)$/);
    if( matches && state.bonds){
      for( bond of state.bonds)
        bond.bend = +(matches[1]);
      if( !isDefined( P.defaultBend ))
        P.defaultBend = +(matches[1]);
      continue;
    }
    matches = line.match( /^magnify:\s*(\S+)$/);
    if( matches ){
      obj.size = +(matches[1]);
      continue;
    }    
    matches = line.match( /^rotate:\s*(\S+)$/);
    if( matches ){
      obj.rotate = +(matches[1]);
      continue;
    }    

    matches = line.match( /^background:\s*(\S+)$/);
    if( matches ){
      obj.background = (matches[1]);
      continue;
    }    
    matches = line.match( /^options:\s*(.*)\s*$/)
    if( matches ){
      obj.options = (matches[1]);
      continue;
    }    

    // work in progress on SMILES format.
    // this will unwrap a SMILES spec.
    matches = line.match( /^compound: (.*)/);
    if( matches ){

      obj.style.compound=true;
      //obj.style.fixedRadius = 10;
      obj.style.multiplicty = 1;

      obj.caption=matches[1];
      obj.structure=matches[1];
      obj.idealDistance = 40;
      layoutMolecule( null, obj, null );
      for(var j in obj.atoms){
        obj.atoms[j].id = "Atom"+j;
        var ch = monikerOfIndex(j);
        P.index[ch]=obj.atoms[j];
      }
      continue;
    }

    matches = line.match( /^nobond:\s*/);
    if( matches && state.bonds){
      for( bond of state.bonds){
        var ix;
        for( ix in obj.bonds){
          var bond2 = obj.bonds[ix];
          if( (bond2.points[0] == bond.points[0]) &&
            (bond2.points[1] == bond.points[1]))
          {
            obj.bonds.splice( ix, 1 );
            break;
          }
        }
      }

      continue;
    }

    // currently usefully doing 
    // bond
    // angle
    //
    // boxed
    // title
    // object
    if(Getters.handleIfGraphKeyword( obj, line, state ))
      continue;

    // ignore the nobond.
    continue;

  }

  setEditorTitle( obj.caption ||'Untitled');

  if( obj.boxed ){
    var matches = obj.boxed.match( /^plain|^\d*\s*$/);
//    if( matches )
//      removeTips( obj );
    obj.boxed=obj.boxed.replace(/ with cards/,'');
  }
  anglesFromAtoms( obj );
  
  // Add in the caption and credits info.
  // promote three obj fields up to metadat.
  var obj1 = [ metaInfoObject( obj.caption || 'Example', obj.card, obj.boxed, obj.options) ];
  obj.card = null;

  // request hotspot colours, using a placeholder.
  for( atom of obj.atoms )
    atom.hotspotColour = 1;

  // adds an object onto the end of the obj.
  if( obj.extra )
    obj1.push( obj.extra );
  obj1.push( obj );

  return obj1;
}


function parseLabelString( str ){
  taper = {};
  taper.str = str;
  taper.endShape1 = "("
  taper.endShape2 = "(";
  //taper.height = 1;


  taper.tokens1 = [];
  taper.tokens2 = [];

// As well to have a reminder of Javascript regex look ahead
// operators!
// What's in the bracket does not appear in the 'matches' result.
// However it does put a constraint on the 'xyz'.
// 
// abc(?!xyz)  - negative lookahead  - rejects abcxyz
// abc(?=xyz)  - positive lookahead  - only abcxyz
// (?<!xyz)abc - negative lookbehind - rejects xyzabc
// (?<=xyz)abc - positive lookbehind - only xyzabc
// 
// Also if we look for (a|b) regex will take the first matching.
// Because of our 'crazy tokenization' rules we want to split these
// as follows 
// <x     < x
// <=x    <= x
// <==x   < == x
// <===x  <= == x


  var tok1 = '::';
  var tok2 = '::';
  while(tok1 || tok2){
    // peel tokens off the start...
    if(tok1 && (matches = str.match(/^(:([A-Za-z0-9_\.\-]+)(?=:)|(:|--|==|~~|\.|=>|<=|<=|>=|=<|\(\+\)|\)\+\(|\\\+\/\+\\|\/\+\\\+\/|\[|\]|\||\(|\)|\\|\/|>|<))(.*?)$/)))
    {
      str = matches[4];
      tok1 = matches[2]||matches[3];
      taper.tokens1.push( tok1 );
    }
    else
      tok1 = null;
    // peel tokens off the end...
    if(tok2 && (matches = str.match(/^(.*?)((?<=:)([A-Za-z0-9_\.\-]+):|(:|--|==|~~|\.|=>|<=|>=|=<|\(\+\)|\)\+\(|\\\+\/\+\\|\/\+\\\+\/|\[|\]|\||\(|\)|\\|\/|>|<|))$/)))
    {
      str = matches[1];
      tok2 = matches[3]||rotatedCode(matches[4]);
      taper.tokens2.push( tok2 );
    }
    else
      tok2 = null;
  }

  // The ?: is for a non capturing group
  // we don't capture (and treat as optional) spaces and ".
  matches = str.match( /^(?:\s*\")?(.*?)(?:\"\s*)?$/ );
  taper.str = matches[1];
  taper.str = removeEscapes( taper.str);

  var i;
  var shape;
  var tok;
  taper.tokens1 = taper.tokens1.reverse();
  taper.tokens2 = taper.tokens2.reverse();
  taper.lineEndShape1 = [];
  for( i in taper.tokens1 ){
    tok = taper.tokens1[i];

    // keywords like height and pad.
    if( Getters.handleIfKeyword( taper, tok))
      continue;

    matches = tok.match( /^(--|~~|==)$/ );
    if( matches ){
      taper.lineType1 = matches[1];
      continue;
    }
    matches = tok.match( /^(([\[\]\|\(\)\\\/>=<)\+]+)|([A-Za-z0-9_\.\-]+))$/ );
    if( matches ){
      shape = matches[1];
      if( !ShapeData.LeftEdges[ shape ] ){
        if( !matches[2] )
          continue;
        shape = ')+(';// indicate invalid code...
      }
      if( taper.lineType1 )
        taper.lineEndShape1.push( shape );
// Systemic HACK.  We don't yet distinguish line end types
// from label end types ("." is a problem with labels) and
// so fix-up the use of '.' by dropping it.
// However, it should instead be treated as part of the 
// string, not just dropped.
      else if( shape != '.' )
        taper.endShape1 = shape;
    }
  }

  // if there is no label, the end type carries through...
  if( taper.str == "")  
    taper.lineType2 = taper.lineType1;

  taper.lineEndShape2 = [];
  for( i=0; i< taper.tokens2.length;i++ ){
    tok = taper.tokens2[i];
    // keywords like height and pad.
    if( Getters.handleIfKeyword( taper, tok))
      continue;

    matches = tok.match( /^(--|~~|==)$/ );
    if( matches ){
      taper.lineType2 = matches[1];
      continue;
    }
    matches = tok.match( /^(([\[\]\|\(\)\\\/>=<)\+]+)|([A-Za-z0-9_\.\-]+))$/ );
    if( matches ){
      shape = matches[1];
      if( !ShapeData.LeftEdges[ shape ] ){
        if( !matches[2])
          continue;
        shape = ')+(';// indicate invalid code...
      }
      if( taper.lineType2 )
        taper.lineEndShape2.push( shape);
// Same comment as for left edge tokens.      
      else if( shape != '.' )
        taper.endShape2 = shape;
    }
  }



  // line type to draw
  // currently no left/right difference.
  taper.lineType1 = taper.lineType1 || taper.lineType2; 
  // whether to draw
  taper.drawLine = taper.lineType1 || taper.lineType2;
  taper.drawLabel = taper.str;
  taper.drawText = taper.str;

  return taper;
}



function setGradient(  ctx, style, l1, l2, v0,v1 ){
  if( !isDefined( l1 ) )
    return;
  if( !isDefined( l2 ) )
    return;

  var colours = ["#0a0","#ff0","#e60","#b0b","#00b","#0cc"];
  var colourCount = colours.length;
  var l1 = l1+colourCount;
  var l2 = l2+colourCount;
  style.gradient=[ colours[l1%colourCount],colours[l2%colourCount]];

  var len = Math.max( 80, v1.sub(v0).length()*1.1);

  var grd = ctx.createRadialGradient(v0.x, v0.y, 0, v0.x, v0.y, len);
  var stops = style.gradient;
  grd.addColorStop(0, stops[0]);
  grd.addColorStop(0.9, stops[1]);
  grd.addColorStop(1, stops[1]);
  ctx.fillStyle = grd;
  ctx.lineStyle = grd;
}

function setOpacity( style, opacity ){
  if( style.fill )
    style.fill = style.fill + opacity;
  if( style.outline )
    style.outline = style.outline + opacity;
  if( style.sheen )
    style.sheen = style.sheen + opacity;
}


function setSolid( ctx, style, obj, v0, v1, scheme )
{
  var colours1 = ["#0a0","#eb1","#e60","#b09","#42c","#18b"];
  var colours2 = ["#070","#c82","#b40","#808","#008","#058"];
  var colours3 = ["#8c8","#ee8","#fd8","#eae","#aaf","#7bf"];
  var colourCount = colours1.length;
  scheme = scheme || "standard+4";

  var incr = 0;
  if( matches = scheme.match( /standard\+(\d+)/ )){
    incr = +(matches[1]);
  }

  var level = firstValid( obj.l1, 1);
  var l = level-1+(incr+colourCount)%colourCount;
  //style.gradient = []; //LIES!
  //ctx.fillStyle = 

  var isLabel = false;
  style.gradient = false;
  style.fill     = colours1[(l+colourCount)%colourCount];
  style.outline  = colours2[(l+colourCount)%colourCount];
  style.sheen    = colours3[(l+colourCount)%colourCount];

  // colour blend will get it to 6 letter format
  style.fill     = colourBlend( style.fill,    "#000", 0);
  style.outline  = colourBlend( style.outline, "#000", 0);
  style.sheen    = colourBlend( style.sheen,   "#000", 0);


// 1 - pastel labels (opaque)        'pastel:border'
// 2 - pastel labels (translucent)   'pastel:translucent:border'
// 3 - dark black line               'plain:black'
// 4 - geometry link                 'plain:standard'
// 5 - molecular link                'plain:grey'
// 6 - pale shield                   'plain:white:translucent'

  var matches;
  scheme = scheme || "";
  var rgbText = '#fff';
  grd = null;




  // the colour setting group...
  if( matches = scheme.match( /rainbow/ )){
    setGradient( ctx, style, obj.l1, obj.l2, v0, v1);
    rgbText = '#fff';
  }
  else if( matches = scheme.match( /blueblack/ )){
    style.fill = ((l%2) ? '#303030':'#5050a0');// nearly black.
    style.outline = '#808080';
    style.sheen = undefined;
    rgbText = '#fff';
  }
  else if( matches = scheme.match( /black/ )){
    if( l< 2 )
      style.fill = ((l%2) ? '#303030':'#505050');// nearly black.
    style.outline = '#808080';
    style.sheen = undefined;
    rgbText = '#fff';
  }
  else if( matches = scheme.match( /grey/ )){
    if( l< 2 )
      style.fill = ((l%2)?'#6e6e6e':'#8e8e8e');// grey colour for bonds...
    rgbText = '#fff';
  }
  else if( matches = scheme.match( /white/ )){
    if( l< 2 )
      style.fill = ((l%2)?'#e0e0e0':'#d0d0d0');// almost white.
    rgbText = '#000';
  }

  // maybe no sheen, maybe no border at all...
  if( matches = scheme.match( /3d/ )){
    //nothing to do.  This style is already there.
  }
  else if( matches = scheme.match( /border/ )){
    style.sheen = undefined;
  }
  else if( matches = scheme.match( /plain/ )){
    style.outline = undefined;
    style.sheen = undefined;
  }

  // adjust light/dark balance...
  if( matches = scheme.match( /pastel/ )){
    style.fill = colourBlend( style.fill, "#f0e0d0", 0.8);
    rgbText = '#000';
  }
  if( matches = scheme.match( /lighten/ )){
    style.fill = colourBlend( style.fill, "#f0e0d0", 0.5);
    rgbText = '#000';
  }
  if( matches = scheme.match( /darken/ )){
    style.fill = colourBlend( style.fill, "#000000", 0.05);
    style.outline = colourBlend( style.fill, "#000000", 0.3);
    rgbText = '#fff';
  }
  if( matches = scheme.match( /atoms/ )){
    if( obj.value.length <= 3){
      style.fill = rgbOfAtom( obj.value );
      style.outline = '#000000';
      rgbText = textColourToContrastWithRgb( style.fill );
      style.sheen = undefined;
    }
  }


  // and finally add translucency
  // (does not work with rainbow)
  if( matches = scheme.match( /translevel/ )){
    setOpacity( style, (l%2)?"30":"a0" );
  }
  else if( matches = scheme.match( /translucent/ )){
    setOpacity( style, "a0" );
  }
  else if( matches = scheme.match( /ghost/ )){
    setOpacity( style, "40" );
  }
  else if( matches = scheme.match( /soften/ )){
    setOpacity( style, "e0" );
  }

  style.rgbCurrentText = style.rgbText || rgbText;
}
