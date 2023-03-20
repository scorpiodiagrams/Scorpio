


function drawMolecule( A, obj, d ){
  return;
  // truly this function is obsolete!
  debugger;
//  if( d.stage !== kStageFillAndText ) return;
//
//  var i;
//  minEnergy(A, obj, d);
//  d.style = obj.atomLabelStyle;
//  for( i = 0; i < obj.atoms.length; i++ ){
//    drawAtom(A, obj.atoms[i], d);
//  }
//  d.style = obj.bondLineStyle;
//  for( i = 0; i < obj.bonds.length; i++ ){
//    drawBond(A, obj.bonds[i], d);
//  }
//  d.style = undefined;
}



function getSmileToken( toParse ){
  result = { tok:"", type:'none'};
  n= toParse.str.length;
  if( n===0 )
    return result;
  // extra padding to ensure tok[1] and tok[2] exist.
  var tok = toParse.str + "...";

  // b,c,n,o,p,s are aromatic atoms.
  // The SMILES standard requires two (and three) letter atom names
  // be in square brackets.
  // We relax that, except for:
  // Cs Co Hs Ho Pb Nb No Os Po Sc
  // They need square brackets, otherwise they will be taken as two-atom
  // combinations.


  n = 1;
  // Look for a capital possibly followed by a lower case that isn't
  // one of the lower case aromatics.
  if( ('A' <= tok[0] ) && (tok[0] <= 'Z') )
  {
    result.type = 'atom';
    // if followed by one of the other lower case letters, extend.
    if( ('a' <= tok[1]) && (tok[1] <= 'z') &&
      (Smiles.aromatics.indexOf( tok[1] ) === -1) ){
      n++;
      // and again extend if there's yet another...
      if( ('a' <= tok[2]) && (tok[2] <= 'z') &&
        (Smiles.aromatics.indexOf( tok[2] ) === -1) ){
        n++;
      }
    }
  }
  // Wasn't upper case?  Then if aromatic, it's still an atom.
  else if(Smiles.aromatics.indexOf( tok[0] ) !== -1){
    result.type = 'atom';
  }
  // Maybe it's a bond?
  else if( Smiles.multiplicity.hasOwnProperty( tok[0] ) ){
    result.type = 'bond';
    result.multiplicity = Smiles.multiplicity[ tok[0] ];
  } else if( !isNaN( tok[0] ) ){
    var m= Number( tok[0] );
    if( toParse.noted[m] ){
      // noted stores values+1, so we can test as a bool.
      var ix = toParse.noted[m]-1;
      result.type = 'abond';
      result.multiplicity = 1;//Smiles.multiplicity[ tok[0] ];
      toParse.toAtom = ix;
      toParse.noted[m]=0;
    }
    else {
      toParse.noted[m] = toParse.fromAtom+1;
    }
  }

  // add bond implied by adjacency.
  if( (toParse.was === 'atom' ) && (result.type=== 'atom')){
    result.tok = '-';
    result.type = 'bond';
    result.multiplicity = 1;
  }
  else {
    // We know how many letters.  Take them.
    result.tok = toParse.str.slice(0,n);
    toParse.str = toParse.str.slice( n );
  }

  if( tok[0]==='(' ){
    toParse.stack.push( toParse.fromAtom);
    //console.log( "pushed atom"+(toParse.fromAtom) );
  }

  // for aromatic bond, we're still in 'was atom'.
  if( result.type === 'abond' ){
    result.type = 'bond';
  }
  else if( result.type !== 'none')
    toParse.was = result.type;
  if( result.type === 'atom' ){
    toParse.fromAtom = toParse.nAtoms++;
  }
  if( tok[0]===')' ){
    toParse.fromAtom = toParse.stack.pop();
    //console.log( "popped atom"+toParse.fromAtom );
  }


  return result;
}

var Smiles = {};

// A look up table of colours;
function initSmiles(){
  var mol = "B C N O P S F Cl Br I H";
  mol = mol.split(" ");

  var colours = [
    "rgba(255,181,181,1.0)", //Br
    "rgba(60,60,60,1.0)",  //C
    "rgba(48,80,248,1.0)", //N
    "rgba(255,14,14,1.0)", //O
    "rgba(255,128,0,1.0)", //P
    "rgba(255,255,48,1.0)",//S
    "rgba(144,224,80,1.0)",//F
    "rgba(31,240,31,1.0)", //Cl
    "rgba(166,41,41,1.0)", //Br
    "rgba(148,0,148,1.0)", //I
    "rgba(255,255,255,1.0)", //H
  ];
  Smiles.colours = [];
  for(i=0;i<mol.length;i++){
    Smiles.colours[ mol[i] ] = colours[i];
  }

  var bonds = ". - = # $ : / \\";
  bonds = bonds.split(" ");

  var multiplicity = [
    0, 1, 2, 3, 4, 1.5, 1, 1 ];

  Smiles.multiplicity = [];
  for(i=0;i<bonds.length;i++){
    Smiles.multiplicity[ bonds[i] ] = multiplicity[i];
  }

  Smiles.aromatics = "bcnops";
}

initSmiles();

function rgbOfAtom( at ){
  at = at.replace(" ","");
  at = at.replace("\n","");
  return Smiles.colours[ at ] || "rgba(60,60,60,1.0)";
}

function TreeParser(obj){
  this.l = obj.layout;
  this.x = obj.pos.x+40;
  this.y = obj.pos.y;
  this.xw = obj.rect.x;
  this.yh = obj.rect.y;

  this.state = "empty";
  this.stack = [];
  this.noted = [];
  this.nAtoms = 0;
  this.fromAtom = -1;
  this.toAtom = -1;
  return this;
}

function makeAtom( parser, type){
  var atom = {};

  atom.r = 10;
  atom.value = type || "P";
  // Allow jatex in the label.
  if( atom.value.startsWith("$$")){
    atom.jatex = atom.value.substring( 2 );
    if( atom.jatex.endsWith("$$") )
      atom.jatex.slice(0,-2);
  }
  atom.colour = rgbOfAtom( atom.value );
  atom.level=0; // the default.
  atom.x=parser.x;
  atom.y=parser.y + parser.yh/2;

  parser.x+= 40;
  //atom.card="<h2>"+atom.value+"</h2>";
  return atom;
}


function makeBond( parser, atoms){
  var bond = {};

  bond.points = [];
  bond.points[0] = parser.fromAtom;
  var atom = atoms[ parser.fromAtom];

  if( parser.toAtom >=0 )
  {
    bond.points[1] = parser.toAtom;
    atom = atoms[ parser.toAtom];
    parser.toAtom = -1;
  }
  // Special case for atom does not exist yet!
  else
  {
    bond.points[1] = atoms.length;
  }
//  bond.multiplicity = 1;
  return bond;
}

function layoutMindMap( A, obj, S)
{
  var atoms = obj.atoms;

  for( var atom of atoms ){
    createDraggable( A, atom, null );
    addObjectToDictionary(A, atom);
    var card = atom.card;// || "<h3>Atom</h3>Number "+atom.id;
    var c = A.nextAutoColour(card);
    A.addDown(["clickObject",atom.id]);
    atom.hotspotColour = c;
    atom.colour = "rgb(40,150,40)";
  }

  var bonds = obj.bonds; 
  for( var bond of bonds ){
    if( bond.isEnd ){
      atoms[ bond.points[1] ].isEnd = true;
    }
  }
}


function atomSizeFromLevel( level ){
   return Math.max( 4, (20 - 5*level));
}

function addMMAtom( P, obj, matches){
  P.newLength = matches[1].length;
    
  while( P.newLength > P.indent){
    P.indent++;
    P.stack.push( P.fromAtom);      
    P.fromAtom = P.toAtom;
    var bondCount = obj.bonds.length;
    if( bondCount > 0){
      var bond = obj.bonds[bondCount-1];
      bond.endShape2 = ">";// No arrow.
      bond.isEnd = false;
    }
  }

  while( P.newLength < P.indent){
    P.indent--;
    P.fromAtom = P.stack.pop();      
  }
  P.indent = P.newLength;

  // set initial position...
  const initialRadius = 160;
  var i = obj.atoms.length;
  P.x = 350 + Math.cos( i * P.theta )*initialRadius;
  P.y = 0 + Math.sin( i * P.theta )*initialRadius;

  var atom = makeAtom( P, matches[3] );

  atom.level = P.indent;
  atom.x = 200;
  atom.y = 70;
  atom.id = "Aatom"+(obj.atoms.length);
  atom.r = obj.atomLabelStyle.fixedRadius || 
    atomSizeFromLevel( atom.level );

  P.index[ atom.id ] = atom;

//  if( matches[3].length > 3)
//     atom.card = "##"+matches[3]+"\r\nplaceholder...\r\n";
  atom.card = "";
  obj.atoms.push( atom );

  P.toAtom = obj.atoms.length -1;

  if( P.fromAtom >= 0 ){
    var bond = makeBond( P, obj.atoms );
//  bond.multiplicity = 1;
    bond.endShape2 = "=>";
    bond.isEnd = true;
    bond.tree = true;
    bond.level = P.indent;
    obj.bonds.push( bond );
  }
  P.toAtom = obj.atoms.length -1;
  return atom;
}

function deltaOfStar( star, maxSize ){
  var bonds = star.bonds;
  var atoms = star.atoms;
  var starts = {};
  var i=0;
  for( bond of bonds ){
    bond.isEnd = false;
    item = bond.points[0];
    if( (i%maxSize)==0){
      starts = {};
    }
    i++;
    if( item in starts){
      bond.points[0] = starts[item].points[0];
      starts[item].points[0] = bond.points[1];
    }
    else
    {
      bond.points[0] = bond.points[1];
      starts[item] = bond;
      // show last bond for shorties.
      bond.last = (maxSize > 100);
    }
  }
  // Hack to hide the last link.
  for( bond of bonds ){
    if( bond.last)
      bond.points[0] = bond.points[1];
  }

  // skip first atom!
  var quad = {};
  quad.atomIx = [];
  for( atom =1; atom < atoms.length; atom++){
    quad.atomIx.push( atom);
    if( (atom % maxSize) == 0 ){
      star.quads.push( quad );
      quad = {};
      quad.atomIx = [];
    }
  }
  return star;
}

// This essentially wipes away obj and makes a 
// zig zag linear molecule (for testing).
function layoutTree2( A, obj, d ){

  obj.atoms = [];
  obj.bonds = [];

  var P = new TreeParser( obj );
  var result;

  var count = obj.count || 10;

  do{
    var atom = makeAtom( P, "C");
    atom.colour = "rgba(100,200,100,1.0)";
    obj.atoms.push( atom );
    P.toAtom = obj.atoms.length -1;

    if( P.fromAtom >= 0 ){
      var bond = makeBond( P, obj.atoms );
      bond.multiplicity = 1;
      obj.bonds.push( bond );
    }
    P.fromAtom = obj.atoms.length -1;

    if( P.x > (P.xw -40) ){
      P.y+=40;
      P.x=40;
    }
    count--;
  }
  while( count > 0 );

}


function layoutMolecule( A, obj, d ){
  obj.atoms = [];
  obj.bonds = [];

  var P = new TreeParser( obj );
  var result;

  var count = obj.count || 10;

  // "O=Cc1ccc(O)c(OC)c1";//Vanillin
  // "HC(H)(H)H";// Methane
  // "CC(=O)NCCC1=CNC2=C1C=C(OC)C=C2"; //melatonin
  P.str = obj.structure;//"CClHc-B=Br";

  do{
    result = getSmileToken( P );
    if( result.type === 'atom' ){
      var atom = makeAtom( P, result.tok);
      obj.atoms.push( atom );
    }
    if( (result.type === 'bond' ) && ( P.fromAtom >= 0 )){
      var bond = makeBond( P, obj.atoms );
      bond.multiplicity = result.multiplicity;
      obj.bonds.push( bond );
      
    }
    if( P.x > (P.xw -40) ){
      P.y+=40;
      P.x=40;
    }
  }
  while( result.tok !== "" );
}


function layoutAtom( A, obj, d ){
  return;
}

function layoutBond( A, obj, d ){
  return;
}

// >>>>>>>>>>>>>>>>>>> Draw Functions >>>>>>>>>>>>>>>>>>>>>>>>>>


// <<<<<<<<<<<<<<<<<<<< Draw Functions <<<<<<<<<<<<<<<<<<<<<<<<


function minEnergy2( A, obj, d){
  var i;
  var j;
  var k;

  var ideal = d.lineStyle && d.lineStyle.idealDistance;
  ideal = firstValid( ideal, obj.idealDistance)
  ideal = firstValid( ideal, 80);

  var len;
  var maxX = A.Porthole.width;
  var maxY = A.Porthole.height;
  var n = obj.atoms.length;
  var kSamples = 10;
  var bondForce = 0.1;
  var repelForce = 0.05;
  // for each atom in turn we take a random other
  // atom kSamples times.
  // Then repel, if less than ideal length away.
  // Repulsion is as if with springs, rather than 
  // inverse square.
  for(i=1;i<n;i++)
  {
    var atom1 = obj.atoms[i];
    if( atom1.placed )
      continue;
    // jitter to deal with 'everything in a line'.
    var v1 = Vector2d( 
      atom1.x+Math.random()-0.5, 
      atom1.y+Math.random()-0.5);
    for(k=0;k<kSamples;k++){
      j = Math.floor( Math.random()*(n-1))+1;
      if( j <= i)
        j--;
      var atom2 = obj.atoms[j];
      var v2 = Vector2d( atom2.x,atom2.y);
      var v = v2.sub( v1 );
      len = v.length()+0.00001;
      if( len >= ideal)
        continue;
      v = v.mul( (len - ideal)*repelForce/len );
      v2 = v2.sub( v );
      v1 = v1.add( v );
      atom1.x = constrain( 0, v1.x, maxX );
      atom1.y = constrain( 0, v1.y, maxY );
      if( atom2.placed )
        continue;
      atom2.x = constrain( 0, v2.x, maxX );
      atom2.y = constrain( 0, v2.y, maxY );
    }
  }

  // each bond is treated as a spring.
  var n = obj.bonds.length;
  for(k=0;k<n;k++)
  {
    var bond = obj.bonds[k];
    i = bond.points[0];
    j = bond.points[1];

    var atom1 = obj.atoms[i];
    var atom2 = obj.atoms[j];
    if( atom1.placed && atom2.placed)
      continue;
    var v1 = Vector2d( atom1.x, atom1.y);
    var v2 = Vector2d( atom2.x, atom2.y);
    var v = v2.sub( v1 );
    len = v.length()+0.00001;
    v = v.mul( (len - ideal)*bondForce/len );
    if( !atom2.placed ){
      v2 = v2.sub( v );
      atom2.x = constrain( 0, v2.x, maxX );
      atom2.y = constrain( 0, v2.y, maxY );
    }
    if( !atom1.placed ){
      v1 = v1.add( v );
      atom1.x = constrain( 0, v1.x, maxX );
      atom1.y = constrain( 0, v1.y, maxY );
    }
  }

}

// Each bond is a spring of length 40, and attempts to set its length.
// Around each atom, the bonds 'try' to form a circle.
// We randomly repel non-carbon atoms that are 'sufficiently far away'
// from each other (by an overly crude metric).
function minEnergy( A, obj, d ){
  // deactivated for now...
  return;
  var atoms = [];
  var i;
  var j;
  var f;
  var m;
  var n;


  var atomFrom;
  var atomTo;

  if( A.iter <= 0 )
    return;
  A.iter--;

  var bondLength = obj.bondLength || 40;
  var jiggle = bondLength/40;

  // all atoms move by their dx,dy and jiggle a little.
  // and we populate an empty array of atoms.
  for(i=0;i<obj.atoms.length;i++){
    obj.atoms[i].x = obj.atoms[i].cx + obj.atoms[i].dx +(Math.random()-0.5)*jiggle;
    obj.atoms[i].y = obj.atoms[i].cy + obj.atoms[i].dy +(Math.random()-0.5)*jiggle;
    atoms.push( [] ); // each joined to nothing.
  }

  // bonds are springs.
  // each actual bond is expected to have a length of 40.
  for( j=0;j<obj.bonds.length; j++){
    var from = obj.bonds[j].points[0];
    var to = obj.bonds[j].points[1];

    // Build list of 2 way links.
    atoms[from].push( to );
    atoms[to].push( from );

    atomFrom = obj.atoms[from];
    atomTo = obj.atoms[to];


    // use the bond forces (as springs of length bondLength).
    f = { x: atomFrom.x-atomTo.x,
          y: atomFrom.y-atomTo.y};
    m = (f.x*f.x + f.y*f.y);
    m = Math.sqrt( m );
    n = (m-bondLength)*0.25/(m+0.1);
    f.x = f.x *n;
    f.y = f.y *n;
    if( A.iter === 0 ){
      console.log( "LINK from "+atomFrom.value + " to " + atomTo.value +" force" +
        " "+f.x + "," + f.y );
    }
    atomFrom.dx -= f.x;
    atomFrom.dy -= f.y;
    atomTo.dx += f.x;
    atomTo.dy += f.y;
  }

  // Assume atoms around one atom will be equally spaced on a circle.
  // Set their lengths and do.
  for(i=0;i<atoms.length;i++){
    if( A.iter === 0 ){
      var atom = obj.atoms[i];
      console.log( "Atom "+atom.value + " at " + atom.x + "," + atom.y );
    }
    var links = atoms[i].length;
    if( links > 1 ) for( j=0;j<links;j++){
      // Sequential atoms around this atom.
      atomFrom = obj.atoms[atoms[i][j]];
      atomTo = obj.atoms[atoms[i][(j+1)%links]];
      f = { x: atomFrom.x-atomTo.x,
            y: atomFrom.y-atomTo.y};
      m = (f.x*f.x + f.y*f.y);
      m = Math.sqrt( m );
      var vLinks = Math.max( 2, links );
      var idealLength;
      idealLength = bondLength * Math.sin( Math.PI / vLinks ) *2;
      n = (m-idealLength)*0.1/(m+0.1);

      // n>0 implies we are too long.
      // only shorten weakly (at 1/10th amount).
      //if( n>0 )
      //  n=n*0.8;

      f.x = f.x * n;
      f.y = f.y * n;
      if( A.iter === 0 ){
        console.log(
          "REP from " + atomFrom.value + " to " + atomTo.value + " force" +
          " " + f.x + "," + f.y);
      }
      atomFrom.dx -= f.x;
      atomFrom.dy -= f.y;
      atomTo.dx += f.x;
      atomTo.dy += f.y;
    }
  }


  // list the non-carbon atoms.
  var nonC = [];
  for( i=0;i<obj.atoms.length;i++){
    if( obj.atoms[i].value !== "C" ){
      nonC.push( i );
    }
  }


  // pick two non carbon atoms.
  var first = 5;
  var final = nonC.length;
  if( final > 1) {
    first = Math.floor(Math.random() * final);
    var last = Math.floor(Math.random() * final);
    if( Math.abs( first - last ) < 1){
      first = (first + 1) % final;
    }
    first = nonC[first];
    last  = nonC[last];

    // repel them.
    var vx = obj.atoms[first].x - obj.atoms[last].x;
    var vy = obj.atoms[first].y - obj.atoms[last].y;
    var pull = 0.05*final*Math.max( 0, A.iter/2-3);
    // reduce the repulsion for small molecules.
    pull *= (final > 20)?1:0.05;
    console.log( "Iter: " + A.iter + " Pull: "+pull);
    d = pull/(Math.sqrt( vx * vx + vy * vy ) +0.1);
    vx *= d;
    vy *= d;
    //vx = d;
    //vy = 0;
    obj.atoms[first].dx += vx;
    obj.atoms[first].dy += vy;
    obj.atoms[last].dx -= vx;
    obj.atoms[last].dy -= vy;
  }

  // update x, based on dx, y on dy.
  for(i=0;i<obj.atoms.length;i++){
    obj.atoms[i].x = obj.atoms[i].cx + obj.atoms[i].dx;
    obj.atoms[i].y = obj.atoms[i].cy + obj.atoms[i].dy;
  }
  bondsFromAtoms(obj);
}

