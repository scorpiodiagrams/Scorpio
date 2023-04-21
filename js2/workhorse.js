Registrar.js.workhorse_js = function( Registrar ){


var metaData = 
{ 
  version: "2023-02",
  docString: "Scorpio's mind-map related code (this file is called 'workhorse' because it does most of the heavy lifting)",
};

// Imports
var Box = Registrar.classes.Box;

function Exports(){
  // Namespaced  formats classes and verbs
  // These are all for export.
//  Registrar.registerTextFormat( Jatex_Fmt );
//  Registrar.registerClass( Box );
  // Global Exports
  // These pollute the main namespace
  window.Ruler = Ruler;

  window.transformXy = transformXy;
  window.antiTransformXy = antiTransformXy;
  window.drawLineLabelAndText = drawLineLabelAndText;
  window.drawWigglyLine = drawWigglyLine;
  window.drawScorpioLabel = drawScorpioLabel;
  // for ruler.
  window.drawRulerMark = drawRulerMark;
  //window.drawDraggers = drawDraggers;
}

function drawBackground( A,obj,d){
  var ctx = getCtx( A, obj, d );

  if( !obj.background )
    return;

  var img = document.getElementById(`internalImg${A.index}`);

  if( img && ( A.receivedBackground == obj.background ) ){
    img = A.backgroundImg || img;
    // centred x (if smaller) and up to 40px margin at top.
    var xExtra = constrain(0,A.Porthole.width - img.width,A.Porthole.width); 
    var yExtra = constrain(0,A.Porthole.height - img.height,80); 
    ctx.drawImage( img, xExtra/2, yExtra/2 );
    return;
  }

  // waiting on requested result....
  if( A.requestedBackground == obj.background )
    return;

  // TRUSTED input assumed!!
  // These next lines are an anti-flicker feature.
  // They test whether the colour is valid.
  // if not, then don't attempt to set the canvas
  // background colour.
  var image = document.createElement("img");
  image.style.color = "rgb(10, 10, 11)";
  image.style.color = obj.background;

  // Not a valid colour??
  // Maybe it's an image? Request it!
  if (image.style.color == "rgb(10, 10, 11)"){
    A.requestedBackground = obj.background
    console.log("Setting background to: "+obj.background);
    img.src = Registrar.imageSrc+obj.background;
    return;
  }

  // It WAS a valid colour.  Apply it.
  ctx.beginPath();
  ctx.fillStyle = obj.background;
  ctx.rect( 0, 0, A.Porthole.width, A.Porthole.height);
  ctx.fill();
};

function drawMindMap( A, obj, d ){
  if( (d.stage !== kStageFillAndText ) && 
      (d.stage !== kStageHots ) &&
      (d.stage !== kStageDragging)
      )
    return;

  var i;
  var j;
  var e ={};

  // justDraw => no hotspot drawing.
  var justDraw = (d.stage === kStageFillAndText );
  var draw = (d.stage === kStageFillAndText );
  var justMove = (d.stage === kStageDragging)

  // done this way for ease of breakpoint setting...
  if( d.stage === kStageHots){
    d.isHotspot = true;
    draw = true;
  }

  var drawLabels = draw;
  var drawMoleculeAtoms = false;//draw && obj.style.compound;

  d.transform = {};
  d.transform.size = firstValid( obj.size, 100 )/100;
  d.transform.rotate = firstValid( obj.rotate, 0 ) * Math.PI/180;
  d.style = obj.angleStyle;

  if( justDraw ){
    drawBackground( A, obj, d);
  }


  if( justDraw ){
    var angles = obj.angles;
    anglesFromAtoms( obj,d );
    for( angle of angles){
      e.stage = kStageFillAndTextEarly;
      e.transform = d.transform;
      drawAngle(A, angle, e);
    }
  }

  d.lineStyle = obj.bondLineStyle;
  d.labelStyle = obj.bondLabelStyle;

  d.style = null;//obj.bondLineStyle;
  if( justDraw ){
    minEnergy2(A, obj, d);
    bondsFromAtoms( obj,d );
    for( i = 0; i < obj.bonds.length; i++ ){
      drawBond( A, obj.bonds[i], d);
    }
  }

  d.style = obj.atomLabelStyle;
  // For now quads are not hotspot drawn.
  // They cost enough CPU to draw that we only 
  // do hotspots for their corners.
  if( justDraw  ){
    quadsFromAtoms( obj );
    for(quad of obj.quads){
      var S={};
      if( d.stage === kStageFillAndText ){
        //quad.src = quad.src || 'braid.png';
        quad.type = 'Quad';
        mayRequestDisplayableImage( A, quad );
        S.isHotspot = false;
        S.stage = kStageFillAndText;
        if( quad.status == 'arrived' )
          S.imageSource = getImageSource(A,quad,S);
        RR.drawTexture(A, quad, S);
      }
    }
//      drawTexture( A, quad, d );
//      //drawQuad( A, quad, d );
//    }
  }

  d.lineStyle = obj.atomLineStyle;
  d.labelStyle = obj.atomLabelStyle;
  d.style = null;

  for( i = 0; i < obj.atoms.length; i++ ){
    var atom = obj.atoms[i];
    atom.parent = obj;
    if( atom.isJref )
      continue;

    if( justMove){
      // code to implement dragging of atoms...
      var dd = newPos( A, atom, d );
      onLockInMove(A,atom,dd, d);
      var t = A.equanimTime;
      if( isDefined(t) && atom.to )
      {
        atom.x = atom.at.x + t*(atom.to.x-atom.at.x);
        atom.y = atom.at.y + t*(atom.to.y-atom.at.y);
      }
    }
    // We make a special case out of the
    // atoms in molecules.  This forces size
    // and colour.  We will remove this later.
    // The bonds are drawn normally.
    if( drawMoleculeAtoms)
      drawAtom( A, atom, d);
    else if( !drawLabels)
      ;
    else if( atom.subdiagram )
      drawSubDiagram( A, atom, d);
    else if( atom.jatex )
      drawJatex( A, atom, d);
    else
      drawMindMapLabel(A, atom, d);
  }
  d.style = undefined;
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

  // we could add hotspotcolours to bonds too...
  var bonds = obj.bonds; 
  for( var bond of bonds ){
    if( bond.isEnd ){
      atoms[ bond.points[1] ].isEnd = true;
    }
  }
}

// >>>>>>>>>>>>>>>>>>> Draw Functions >>>>>>>>>>>>>>>>>>>>>>>>>>

// Always draw the label with filled-style
function drawLineLabelAndText(A, taper, d){
  var ctx = getCtx( A, taper, d );

  taper.align = 0.5;
  var align = firstValid( taper.align, 0.5);

  ctx.save();
  ctx.textAlign = "left";
  //ctx.fillStyle = d.rgbText;
  var fontSize = obj.fontSize || d.labelStyle.fontSize || 12;
  ctx.font = fontSize + "px Arial";

//  taper.level = obj.level+1;
//  taper.label = true;

  var mWidth = ctx.measureText( "M" ).width;
  var box = getTextDimensions( ctx, taper.str );
  // adjust for round up of sizes.
  box = adjustTextDimensions( box, d );
  taper.height = firstValid( taper.height, box.y/mWidth );
  //taper.height = 1.0;

  // the extra space variables are how much to shift the text
  var extraSpaceLeft  = (mWidth * taper.height) * getExtraSpaceLeft( taper.endShape1);
  var extraSpaceRight = (mWidth * taper.height) * getExtraSpaceLeft( taper.endShape2);

  // so at this stage the 'box' has the text width
  // and the extra space variables say how much bonus space
  // we already have, e.g. in the ends of the ()

  // We pad the text by an amount that grows for wide text.
  var textPad = Math.min( 20, box.x/3);
  textPad = firstValid( d.labelStyle.pad, textPad );
  //textPad = 0;
  if( isDefined( taper.pad) ){
    textPad = taper.pad *mWidth;
  }
  var textWidth = box.x+textPad;

  // the reference point for the text moves, depending on
  // alignement.... align = 
  //   0 - subtract extra space left
  //   1 - add extra space right
  //   0.5 - average of the two above.

  // With this adjustment, the text stays rock solid still.
  taper.textAdjust = (align-1)*extraSpaceLeft + align*extraSpaceRight; 

  // this adjustment is an alignment specific adjust.
  var corrector = mWidth *( 0.8 * taper.height - 0.2)
  taper.textAdjust += corrector*(0.5-align);

  // if there is more extra space than the text needs...
  // take more space.  pretend it just fits.
  textWidth = Math.max( textWidth, extraSpaceLeft + extraSpaceRight);

  // the 'min' is because user can set a negative pad.
  textWidth = Math.max(0.001,textWidth+Math.min( 0, textPad));

  if( isDefined( taper.width) ){
    textWidth = Math.max(0.001,taper.width *mWidth );
  }

  var t;
  var unitVec;
  t = taper.lineAt;
  if( t )
    unitVec = t.v1.sub( t.v0 ).normalized();
  else
    unitVec = Vector2d( 1,0);

  t = taper.textAt;
  if( !t )
    debugger;

  // The alignement of the 'block' of text in the 
  // shield is always central.
  var leftAdj  = unitVec.mul( ( -0.5 ) * textWidth);
  var rightAdj = unitVec.mul( (  0.5 ) * textWidth);

  t.v0 = t.v0.add( leftAdj );
  t.v1 = t.v1.add( rightAdj );

  leftAdj  = unitVec.mul(  extraSpaceLeft );
  rightAdj = unitVec.mul( -extraSpaceRight )

  var reducedHeight = taper.height - 0.4;
  t.r0 = reducedHeight * fontSize/2+2;
  t.r1 = reducedHeight * fontSize/2+2;

  taper.value = taper.str;
  taper.style = {};
  taper.style.gradient = true;
  
  if( taper.makeLine){
    taper.lineAt.v0 = taper.lineAt.v0.add( t.v0 );
    taper.lineAt.v1 = taper.lineAt.v1.add( t.v1 );
  }

  t.v0 = t.v0.add( leftAdj );
  t.v1 = t.v1.add( rightAdj );

  taper.taperIs = 'link';
  d.dddStyle = d.lineStyle;

  taper.disp = null;
  // draw the linking line, either in taper style
  // or in line style.
  if( d.dddStyle.defaultLinkType == "Wide" )
    drawTaper(A,taper,d);
  else
    drawStyledLine(A,taper,d);
  taper.taperIs = 'label';

  // displace the label.
  if( taper.lineAt && taper.bend )
  {
    var t = taper.lineAt;
    var disp = t.v1.sub( t.v0 ).perp().mul(taper.bend/200);
    taper.disp = disp;
  }

  var vAdj = Vector2d(taper.textAdjust,0);
  taper.label = true;
  d.dddStyle = d.labelStyle;
  if( taper.drawLabel )
    drawTaper(A,taper,d);
  if( taper.drawText ){
    var vAdj = taper.textAt.v1.sub( taper.textAt.v0 ).normalized( taper.textAdjust );
    taper.textAt.v0 = taper.textAt.v0.add( vAdj );
    taper.textAt.v1 = taper.textAt.v1.add( vAdj );
    taper.rgbCurrentText = taper.rgbCurrentText || d.dddStyle.rgbText;
    drawText( A, taper, d );
  }

  ctx.restore();
}

function transformXy( obj, d ){
  if( !d )
    return;
  var scale = d.transform.size;
  var theta = d.transform.rotate;
  var v = Vector2d( obj.x, obj.y );
  var centre = Vector2d( 350, 200 );
  v = v.sub( centre ).rot( theta ).mul( scale ).add( centre );
  obj.x = v.x;
  obj.y = v.y;
}

function antiTransformXy( obj, d ){
  if( !d )
    return;
  var scale = d.transform.size;
  var theta = d.transform.rotate;
  var v = Vector2d( obj.x, obj.y );
  var centre = Vector2d( 350, 200 );
  v = v.sub( centre ).mul( 1/scale ).rot(-theta).add( centre );
  obj.x = v.x;
  obj.y = v.y;
}

function copyDiagram( A, obj, d ){
  var AA = d.imageSource;

  var ctx = getCtx( A, obj, d );
  var scale = 0.5;
  var w = A.Porthole.width * scale;
  var h = A.Porthole.height * scale;
  var rgb = obj.hotspotColour;

  if( d.stage == kStageHots){
    ctx.save();
    // other widgets take priority...
    ctx.globalCompositeOperation = 'destination-over';
    ctx.beginPath();
    ctx.rect( obj.x, obj.y, w,h);
    ctx.fillStyle = rgb;
    ctx.fill();
    ctx.restore();
    return;
  }

  var sourceCanvas = AA.BackingCanvas;
  ctx.save();
//  ctx.globalCompositeOperation = 'destination-over';
//  ctx.beginPath();
//  ctx.rect( obj.x, obj.y, w,h);
//  ctx.fillStyle = '#ffffff';
//  ctx.fill();


  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(sourceCanvas, obj.x, obj.y,w,h);
//  ctx.globalCompositeOperation = 'xor';
//  ctx.drawImage(sourceCanvas, obj.x, obj.y,w,h);
//  ctx.beginPath();
//  ctx.rect( obj.x, obj.y, w,h);
//  ctx.fillStyle = rgb;
//  ctx.fill();
  ctx.restore();
}

function drawSubDiagram( A, obj, d){
  var AA = RR.getNamedAnnotator( obj.subdiagram );
  if( AA ){
    d.imageSource = AA;
    copyDiagram( A, obj, d );
    return;
  }
  drawMindMapLabel(A,obj,d);
}

function drawJatex( A, obj, d){
  if( obj.hide && (d.stage != kStageHots))
    return;

  if( !Jatex )
    return;
  Jatex.parse( A, obj, d );
}

function drawBox( A, obj, d){
  var ctx = getCtx( A, obj, d );

  var dv = obj.v1.sub( obj.v0);
  ctx.strokeStyle = "#22f";
  ctx.lineWidth = 1.0;
  ctx.beginPath();  
  ctx.rect( obj.v0.x, obj.v0.y, dv.x, dv.y);
  ctx.stroke();

}

function drawMindMapLabel(A, obj, d){

  if( obj.hide && (d.stage != kStageHots))
    return;

  var taper = parseLabelString( obj.value );
  var v = Vector2d( obj.x, obj.y );
  var dv = Vector2d( 1,0);
  transformXy( v, d);
  taper.label = true;
  taper.styled = obj.styled;
  taper.l1 = obj.level+1;
  taper.l2 = obj.level;

  if( taper.drawLine  ){
    taper.makeLine = 100;
    taper.lineAt = { v0: dv.mul(-1), v1:dv.mul( 1 ), 
      r0: 4, 
      r1: 4};
  }
  taper.textAt = { v0: v.sub(dv), v1:v.add( dv ), 
    r0: 4, 
    r1: 4};

  if( d.stage == kStageHots){
    taper.drawText = null;
    taper.hotspotColour = obj.hotspotColour;
  }
  drawLineLabelAndText( A,taper,d);
}

function getTextDimensions( ctx, text ){
  var lines = text.split(/<br>/);
  var lineHeight = ctx.measureText( "M" ).width * 1.2; 
  var y = lineHeight * lines.length;
  var x = lines.reduce((acc, val) => {
    var v = ctx.measureText( val ).width;
    if( v >acc) 
      acc=v;
    return acc;
  },0);
  y+=5;
  return {"x":x, "y":y};
}

// rounding up of box dimensions...
function adjustTextDimensions( box, d ){
  var g = d.labelStyle.xGranularity || d.labelStyle.sizeGranularity;
  if( g && (box.x > 12 ))
    box.x = Math.ceil( box.x / g) * g;
  g = d.labelStyle.yGranularity || d.labelStyle.sizeGranularity;
  if( g && (box.x > 12 ))
    box.y = Math.ceil( box.y / g) * g;
  box.x *= d.labelStyle.xMagnify || 1;
  box.y *= d.labelStyle.yMagnify || 1;

  return box;
}


function scalingInfo(A, obj, d){
  //if( !isDefined( obj.level ))
    return {font:1,opaque:1};
  var s = d.transform.size * 100;
  if( s > 50)
    return {font:1,opaque:1};
  if( s < 40)
    return {font:0.7,opaque:0.2};
  s = (s-40)/10;
  return {font:0.7+s*0.3,opaque:0.2+s*0.8};
}

function drawText(A, obj, d){
  var ctx = getCtx( A, obj, d );

  ctx.save();
  ctx.textAlign = "left";
  ctx.fillStyle = obj.rgbCurrentText || "#f00";
  var scaling = scalingInfo(A,obj,d);

  var fontSize = d.dddStyle.fontSize || obj.r;
  ctx.font = (fontSize*scaling.font) + "px Arial";
  ctx.globalAlpha = scaling.opaque;

  var align = firstValid( obj.align, 0.5);

  var lines = obj.value.split(/<br>/);
  var lineHeight = ctx.measureText( "M" ).width * 1.2; 
  var t = obj.textAt;
  if( !t )
    debugger;
  // go for the mid point...
  var v = t.v0.mul( 1-align).add( t.v1.mul( align) );
  var slope = t.v1.sub( t.v0 ).slope();

  vTextOffset = Vector2d(0, 6+(d.dddStyle.fontYAdjust || 0));
  // displacement for bend
  if( obj.disp )
    v = v.add( obj.disp );
  {
    slope = slope+5*Math.PI;
    slope = Math.PI * ((slope/(Math.PI)+0.5)%1-0.5);

    v = v.add( vTextOffset.mul( 1).rot( -slope ) );
    ctx.translate(v.x, v.y);
    ctx.rotate( slope );
    ctx.translate(-v.x, -v.y);
    v.y -= lineHeight*0.5*(lines.length-1);
  }
  for( var i in lines){
    var width = ctx.measureText( lines[i]).width;
    width *= align;
    ctx.fillText(lines[i], v.x-width, v.y+lineHeight*i);
  }
  ctx.restore();
}

// Actually draws an atom.
function drawAtom(A, obj, d){
  var ctx = getCtx( A, obj, d );
  var hotspot = d.stage == kStageHots;

  centre = new Vector2d( obj.x, obj.y);
  transformXy( centre, d );

  d.dddStyle = d.labelStyle;
  var taper = {};

  taper.value = obj.value || "P";
  taper.textAt = {};
  taper.textAt.v0 = centre;
  taper.textAt.v1 = centre;

  if( hotspot )
    taper.colour = obj.hotspotColour
  else
    taper.colour = rgbOfAtom( obj.value );

  ctx.save();
  ctx.beginPath();
  var r = d.labelStyle.fixedRadius || obj.r;
  ctx.arc(centre.x, centre.y, r, 0, Math.PI * 2.0, true);
  var rgb = taper.colour ||  "rgba(200,0,0,0.3)";
  ctx.fillStyle = rgb;
  ctx.fill();
  if( !hotspot ){
    ctx.lineWidth = 0.5;
    taper.rgbCurrentText = textColourToContrastWithRgb( rgb );
    ctx.strokeStyle = d.rgbCurrentText;
    ctx.stroke();
    drawText( A, taper, d);
  }

  ctx.restore();
}

function drawEnds(ctx, obj, d){
  d = d || 0;
  drawAnEnd(ctx, obj.S[0], "flat", d);
  drawAnEnd(ctx, obj.S[1], "pointed", d);
}

function drawEndShape( ctx, v, v2, code){
  if( !code)
    return;
  ctx.save();

  //ctx.lineWidth = 2;
  // grey rather than black to avoid over-intense.
  //ctx.strokeStyle = "rgba(110,110,110,1.0)";


  var s = new Shape();
  var t = new Shape();
  t.addPoint( v );
  t.addPoint( v2 );
  t.scaling = 1;

  var edge = ShapeData.LeftEdges[ code ]
  var fn = edge && edge.fn;
  if( fn ){
    s = fn( 1, t, s );
  }
  s.addPoint( v2);
  var style={ pathWithEnds : true };
  s.drawInner(ctx, style );

  ctx.stroke();
  ctx.restore();
}


function drawEndShapes( ctx, v, perp, along, endSize, lineWidth, codes )
{

  if( !codes )
    return;
  var v0=v;
  ctx.beginPath();
  for( code of codes ){
    var edge = ShapeData.LeftEdges[ code ]
    if( edge ){
      v0 = v.add( along.mul( -lineWidth/2 + endSize * edge.mid ));
    }
    drawEndShape( ctx, v0.sub(perp), v0.add(perp), code );
    v = v.sub( along.mul( lineWidth * 2.5 ));
  }
}


function getEndShape( codes )
{
  if( !codes )
    return "(";
  for( code of codes ){
    var edge = ShapeData.LeftEdges[ code ]
    if( edge ){
      return code;
    }
  }
  return "(";
}

// At the mid point we apply half the bend vector.
// But we are using a cubic bezier to the canvas...
function applyBend( bender, p, t)
{
  var bend = bender.mul( 2*t*(1-t));
  return p.add( bend );
}

function drawWigglyLine( ctx, v0, v1, wiggleCount, bend){

  var along = v1.sub(v0);
  var bender = along.perp( bend );
  if( wiggleCount <=1){
    //ctx.lineTo( v1.x, v1.y);

    bender = bender.mul( 2*0.3333);
    p = v0.add( along.mul( 0.3)).add(bender);
    q = v1.sub( along.mul( 0.3)).add(bender);

    ctx.bezierCurveTo( p.x, p.y, q.x, q.y, v1.x,v1.y);
    return;
  }
  //wiggleCount=2;
  var along = along.mul( 1/wiggleCount );
  var disp = along.perp(0.3);

  var t;
  var p,q,r;

  for(var j=0;j<wiggleCount;j++){
    p = v0.add( along.mul(j+0.333 ).add( disp.mul( (j%2)?-1:1)));
    q = v0.add( along.mul(j+0.666 ).add( disp.mul( (j%2)?-1:1)));
    r = v0.add( along.mul(j+1 ));
    p = applyBend( bender, p, (j+0.333)/wiggleCount);
    q = applyBend( bender, q, (j+0.666)/wiggleCount);
    r = applyBend( bender, r, (j+1)/wiggleCount);

    var m = v0.add( along.mul(j+0.5 ).add( disp.mul( (j%2)?-1:1)));
    m = applyBend( bender, m, (j+0.5)/wiggleCount);
    ctx.quadraticCurveTo( m.x, m.y, r.x, r.y );

//    ctx.bezierCurveTo( p.x, p.y, q.x, q.y, r.x,r.y);
//    ctx.lineTo( r.x,r.y);
  }

}

// To become subsumed into 'drawTaper'
function drawStyledLine( A, obj, d){

  if( !obj.lineAt )
    return;
  var ctx = getCtx( A, obj, d );
  if( !obj.lineAt )
    debugger;
  var v0 = obj.lineAt.v0;
  var v1 = obj.lineAt.v1;

  var style = d.lineStyle;

  // this disp is for internally generated displacements
  // extending the ends.
  // it's relevant for a taper used as a bond.
//  var extensionLength = firstValid( obj.extensionLength, 10);

  var disp = v1.sub( v0 ).normalized();

  var bend;
  // ends need to take account of bends...
  var theta = 0;
  if( d.dddStyle.bend )
    bend = d.dddStyle.bend;
  if( obj.bend )
    bend = obj.bend;
  if( bend ){
    theta = Math.atan( (bend *2)/100 );
  }
  if( obj.taperIs == 'label' )
    theta = 0;

  if( /*!obj.label &&*/ d.dddStyle.lineExtend )
  {
    var l = d.dddStyle.lineExtend * 0.5;
    v0 = v0.sub( disp.mul( l ).rot(theta));
    v1 = v1.add( disp.mul( l ).rot(-theta));
  }

  // colour, after all the coordinate adjustment, in
  // case it is a gradient.
  setSolid( ctx, style, 1, v0, v1, style.colourScheme );

  var endSize = d.dddStyle.endSize || 15;
  var lineWidth = style.linkWidth || 2;
  var rgb = style.fill || "rgba(110,110,110,1.0)";


  var multiplicity = obj.multiplicity || 1;
  var wiggleSize = 0;
  if( obj.lineType1 == "==" )
    multiplicity = 2;
  if( obj.lineType1 == "~~" )
    wiggleSize = 1;

//  disp = disp.normalized(Math.sign( extensionLength)).perp();
  disp = disp.normalized().perp();

  ctx.save();
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  // grey rather than black to avoid over-intense.
  ctx.strokeStyle = rgb;

  var along = v1.sub(v0);
  var l = along.length();
  var wiggleCount = wiggleSize ? (Math.floor( l/(5*wiggleSize) )):0;
  var i,j;
  var bend = obj.bend || 0;
  bend = bend/100;
  for(i=0;i<multiplicity;i++){
    var d2 = disp.mul( (2*i-multiplicity+1)*(lineWidth) );
    var u0 = v0.add( d2 );
    var u1 = v1.add( d2 );
    ctx.moveTo( u0.x, u0.y);
    drawWigglyLine( ctx, u0, u1, wiggleCount, bend);
  }

  ctx.stroke();
  disp = disp.mul( endSize );
  along = along.mul( 1/l );
  theta = Math.atan( bend *2 );
  //theta = Math.PI / 4;

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = rgb;

  var codes;
  codes = obj.lineEndShape1;
  drawEndShapes( ctx, v0, disp.rot(theta), along.rot(theta), endSize, lineWidth, codes );
  codes = obj.lineEndShape2;
  drawEndShapes( ctx, v1, disp.mul(-1).rot(-theta), along.rot(-theta), -endSize, -lineWidth, codes );

  ctx.restore();
}

function getTaperLoc(A,obj,d){
  if( obj.textAt )
    return obj.textAt;
  return obj.TextLocs;
}


// This is due to engulf 'drawStyledLine'
function drawTaper(A, obj, d){

  var ctx = getCtx( A, obj, d );

  // style is not part of the object...
  var style = { outline:"#225533", fill: "#55AA77", width:4};

  if( d.stage===kStageHots ){
    if( ! obj.hotspotColour )
      return;
    style = { fill: obj.hotspotColour };
    ctx = A.HotspotsCanvas.ctx;
  }
  else if( d.stage == kStageOutline)
    style.fill = null;
  else if( d.stage == kStageFillAndTextEarly)
    style.outline = null;
  style.colourScheme = d.dddStyle.colourScheme;
  style.lineWidth    = d.dddStyle.lineWidth || 6;
  style.rgbText      = d.dddStyle.rgbText;

  var bLabel = obj.taperIs == 'label';

  var src = bLabel ? obj.textAt : obj.lineAt;
  var {v0,v1,r0,r1} = src;

  // this disp is an external displacement to a taper.
  // it's used to shift the taper relative to text,
  // rather than shifting the text within the taper.
  if( obj.disp ){
    v0 = v0.add( obj.disp );
    v1 = v1.add( obj.disp );
  }

  // this disp is for internally generated displacements
  // extending the ends.
  // it's relevant for a taper used as a bond.
  var disp = v1.sub( v0 ).normalized();
  var dperp = disp.perp();

  // No link width?  Use the radius, so that it is a taper.
  var dperp0 = dperp.mul( r0 );
  var dperp1 = dperp.mul( r1 );
  
  // ends need to take account of bends...
  var theta = 0;
  // no bend if a label.
  var bend = (!bLabel && (obj.bend || d.dddStyle.bend))||0;
  if( bend ){
    theta = Math.atan( (bend *2)/100 );
  }

  if( !obj.label && d.dddStyle.lineExtend )
  {
    var l = d.dddStyle.lineExtend * 0.5;
    v0 = v0.sub( disp.mul( l ).rot(theta));
    v1 = v1.add( disp.mul( l ).rot(-theta));
  }

  var va = v0.add( dperp0.rot( theta) );
  var vb = v1.add( dperp1.rot( -theta) );
  var vc = v1.sub( dperp1.rot( -theta) );
  var vd = v0.sub( dperp0.rot( theta) );

  if( d.stage != kStageHots ) {
    setColourScheme( ctx, style, obj, v0, v1 );
    obj.rgbCurrentText = style.rgbCurrentText;
    if( obj.styled ){
      style.fill = "#a0a0a0";
      style.outline = "#c0c0c0";
      style.sheen = "#707070";
      // make text less visible.
      style.gradient = null;
      obj.rgbCurrentText = "#d0d0d0";
    }
  }
  //style.bevel = d.dddStyle.bevel;

  var proxyObj = {};
  var multiplicity = 1;
  if( bLabel ){
    proxyObj.endShape1 = obj.endShape1 || "(";
    proxyObj.endShape2 = obj.endShape2 || ")";
  }
  else {
    proxyObj.endShape1 = getEndShape( obj.lineEndShape1 );
    proxyObj.endShape2 = getEndShape( obj.lineEndShape2 );
    multiplicity = obj.multiplicity || 1;
    if( obj.lineType1 == "==" )
      multiplicity = 2;
  }
  if( bend ){
    setInOutBend( "bend",     `C 25 ${bend} 75 ${bend} 100 0` );
    setInOutBend( "antibend", `C 25 ${-bend} 75 ${-bend} 100 0` );
    proxyObj.topEdge = "bend";
    proxyObj.botEdge = "antibend";
    proxyObj.bevel   = false;
  }
  else {
    proxyObj.topEdge = (obj.inStem  && "InStem")  || "straight";
    proxyObj.botEdge = (obj.outStem && "OutStem") || "straight";
    proxyObj.bevel   = d.dddStyle.bevel;
  }

  var da = vd.sub(va);
  var db = vc.sub(vb);
  var nTot = 2*multiplicity-1;

  for(var i=0;i<multiplicity;i++){
    var vva = va.add( da.mul( (2*i)/nTot ) );
    var vvb = vb.add( db.mul( (2*i)/nTot ));
    var vvc = vvb.add( db.mul( 1/nTot ));
    var vvd = vva.add( da.mul( 1/nTot ));
    drawScorpioLabel( ctx, proxyObj, style, vva, vvb, vvc, vvd );
  }
}

function drawScorpioLabel( ctx, obj, style, va, vb, vc, vd )
{
  var s = new Shape();
  s.addPoints( va, vb, vc, vd );
  var wartList = new Shape();

  // clockwise, from bottom left
  wartList.addEdges( 
    obj.endShape1, obj.topEdge, 
    obj.endShape2, obj.botEdge
  );
  s = s.addWarts( wartList );
  s = s.reduce();
  if( obj.bevel )
    s = s.bevelCorners( obj.bevel );
  s.draw( ctx, style );
}

function drawQuad( A, obj, d){
  if( d.stage == kStageHots ) 
    return;

  var ctx = A.BackingCanvas.ctx;
  setColourScheme( ctx, d.style, obj, 
    Vector2d(10,10),
    Vector2d(690,390));

  var s = new Shape();
  for( atom of obj.atoms ){
    s.addPoint( Vector2d( atom.x, atom.y) );
  }
  s.draw( ctx, d.style );
}

function thetaOfConnection( obj, con){
  var a = obj.atoms[1];
  var b = obj.atoms[2*con];
  var x = b.x-a.x;
  var y = b.y-a.y;
  var thetaAdj = 2*obj.bends[con]/100;
  thetaAdj = Math.atan( thetaAdj );
  return Math.atan2( y, x)-thetaAdj;
}


function drawAngle( A, obj, d){
  var centre = obj.atoms[1];
  var ctx = getCtx( A, obj, d );
  var theta0 = thetaOfConnection( obj, 0 );
  var theta1 = thetaOfConnection( obj, 1 );
  theta0 = theta0 - d.transform.rotate;
  theta1 = theta1 - d.transform.rotate;
  centre = new Vector2d( centre.x, centre.y);
  transformXy( centre, d );

  var dAngle = 43+2*(theta0-theta1)/Math.PI;
  dAngle = Math.abs( dAngle ) %4;
  // the angle tolerance.  0 is exactly a right angle.
  var isRightAngle = dAngle <0.03;
  var rgb = obj.colour ||  "#e0000040";

  ctx.save();
  ctx.beginPath();

  var r = 30;
  // Path WITH moves to the centre (for fill)
  if( isRightAngle ){
    ctx.moveTo( centre.x, centre.y );
    ctx.lineTo( centre.x + r*Math.cos( theta0), centre.y + r*Math.sin( theta0));
    ctx.lineTo( 
      centre.x + r*Math.cos( theta0) + r*Math.cos( theta1),
      centre.y + r*Math.sin( theta0) + r*Math.sin( theta1));
    ctx.lineTo( centre.x + r*Math.cos( theta1), centre.y + r*Math.sin( theta1));
    ctx.lineTo( centre.x, centre.y );
    rgb = "#f0900040";
  } else {
    ctx.moveTo( centre.x, centre.y );
    ctx.arc(centre.x, centre.y, r, theta0, theta1, true);
    ctx.moveTo( centre.x, centre.y );
  }

  ctx.fillStyle = rgb;
  ctx.fill();

  ctx.beginPath();
  // Path WITHOUT the line to the centre (for stroke)
  if( isRightAngle ){
    ctx.moveTo( centre.x + r*Math.cos( theta0), centre.y + r*Math.sin( theta0));
    ctx.lineTo( 
      centre.x + r*Math.cos( theta0) + r*Math.cos( theta1),
      centre.y + r*Math.sin( theta0) + r*Math.sin( theta1));
    ctx.lineTo( centre.x + r*Math.cos( theta1), centre.y + r*Math.sin( theta1));
  } else {
    ctx.arc(centre.x, centre.y, r, theta0, theta1, true);
  }
  ctx.lineWidth = 3;
  d.rgbText = textColourToContrastWithRgb( rgb );
  ctx.strokeStyle = d.rgbText;
  ctx.stroke();
  ctx.restore();
}


// <<<<<<<<<<<<<<<<<<<< Draw Functions <<<<<<<<<<<<<<<<<<<<<<<<


function quadsFromAtoms( obj ){
  // now tell all the bonds their ends have moved.
  for( var j=0;j<obj.quads.length; j++){
    var quad = obj.quads[j];
    quad.atoms = [];
    for( var i=0;i<quad.points.length;i++){
      var atom = obj.atoms[quad.points[i]];
      quad.atoms.push( atom );
    }
  }
}


function bondsFromAtoms( obj ){
  // now tell all the bonds their ends have moved.
  for( j=0;j<obj.bonds.length; j++){
    var bond = obj.bonds[j];
    var atomFrom = obj.atoms[bond.points[0]];
    var atomTo = obj.atoms[bond.points[1]];
    bond.a1 = atomFrom;
    bond.a2 = atomTo;
  }
}

rulerSpec1 = [
  { mod :10, height : 1.0, 'width': 1.7},
  { mod : 5, height : 0.6, 'width': 0.7},
  { mod : 1, height : 0.4, 'width': 0.7}
  ];

rulerSpec2 = [
  { mod :10, height : 1.0, 'width': 1.5},
  { mod : 2, height : 0.5, 'width': 0.7},
  { mod : 1, height : 0.25, 'width': 0.7}
];

rulerSpec = rulerSpec1;
otherSpec = rulerSpec2;

function drawRulerMark( ctx, obj, i ){
  var {x,y,xw,yh} = getBox( obj );

  x  += i * obj.pixelsPerBar;

  var barCountAtStart = obj.atStart / obj.itemsPerBar;
  i += Math.floor( barCountAtStart );
  x -= (barCountAtStart-Math.floor( barCountAtStart ))*obj.pixelsPerBar;

  var v = rulerSpec[1].mod;

  var j;

  for( j=0;j<2;j++){
    if( i % (v*otherSpec[j].mod) === 0)
      break;
  }
  var spec2 = otherSpec[j];
  var j1=j;

  for( j=0;j<2;j++){
    if( (i % rulerSpec[j].mod) === 0)
      break;
  }
  var spec = rulerSpec[j];

  var height = spec.height;
  var height2 = spec2.height;
  if( j> 1 )
    height2=0;

  // pixelsPerBar is between 3 and 6 or 3 and 15.
  var blend = Math.max( 0, Math.min( (obj.pixelsPerBar-4.5)/1.1, 1.0 ));
  ctx.lineWidth = spec.width;

  height = height2 + blend * (height-height2);

  ctx.beginPath();
  ctx.moveTo( x, y+yh);
  ctx.lineTo( x,y+yh*(1-height*0.6));
  ctx.stroke();

  var opacity = Math.max(0,Math.min( (obj.pixelsPerBar-2.9) /2.1, 1.0));
  if( j1 > 1 )
    opacity=0;
  if( j1 === 0 )
    opacity = 1;

  if( opacity > 0.1){
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.font = "12px Arial";

    ctx.globalAlpha = opacity;
    ctx.textAlign = "center";

    // number to nearest 0.1
    ctx.fillText( ""+ (Math.floor(10*i*obj.itemsPerBar+0.9))/10, x, y+ 8);
    ctx.globalAlpha = 1.0;
  }

}

function Ruler(){
  return this;
}

Ruler.prototype = {
  fns : "\\ruler",
  name: "Ruler",
  astOfRuler(ast, node, tokens, i, len){
    return i;
  },
  measureRuler( ctx, prev, ast ){
    var box = new Box();
    ast.box = box;
    var tree = ast.subtree;
    ast.box.addRight( new Box(300,20)); 
    return ast.box;
  },
  positionRuler( parent, ast, v){
    ast.box.move( v );
  },
  outRulerMarks( ctx, ast, color, proportion ){
    var v = ast.box.vecs[0];
    var dv = ast.box.diagonal();

    var i;

    // The lazy way is to draw every single item in the ruler
    // That is just crazy, because the density would be too high.

    // So instead we draw 'bars' which might be every 5th item,
    // every 10, every 20, every 50, every 100...

    // How many to a bar?  Well, we work out a pixel density.
    // A minimum of 3 pixels between bars seems about right.

    var obj = {};
    obj.atStart = -10;
    obj.atEnd = 310;

    obj.itemsPerPixel = (obj.atEnd - obj.atStart)/dv.x;
    var pixelsPerBar = 100/obj.itemsPerPixel;
    var spec = 0;

    // Find which spec we are drawing to...
    // Each time round this loop is a 10x zoom out
    while( pixelsPerBar > 6){
      spec++;
      pixelsPerBar /= 2;
      if( pixelsPerBar <= 15 )
        break;
      spec++;
      pixelsPerBar /= 5;
    }

    // The number of pixels per bar in turn lets us compute
    // how many items for each bar.
    obj.pixelsPerBar= pixelsPerBar;
    obj.itemsPerBar = obj.itemsPerPixel * pixelsPerBar;

    // some horrible nearly globals here...
    if( (spec%2) === 1 ){
      rulerSpec = rulerSpec2;
      otherSpec = rulerSpec1;
    } else {
      rulerSpec = rulerSpec1;
      otherSpec = rulerSpec2;
    }

    // These are so that getBox works...
    obj.pos = v;
    obj.rect = dv;

    // Actually draw the 'bars'.
    var nBars = Math.floor( dv.x / pixelsPerBar)+1;
    for(i=0;i<nBars;i++){
      drawRulerMark( ctx, obj, i );
    }
  },
  outRuler( ctx, ast, color, proportion ){
    this.P.mayOutHotBox( ctx, ast );
    // hotspots don't draw the ruler markings...
    if( this.P.isHotspot ){
      return;
    }

    var v = ast.box.vecs[0];
    var dv = ast.box.diagonal();

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = color || "#ccc";
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = "rgb(0,0,0)";
    ctx.strokeWidth = 0.5;
    ctx.rect(v.x, v.y, dv.x, dv.y);
    ctx.fill();
    this.outRulerMarks( ctx, ast, color, proportion );
    ctx.stroke();
    ctx.restore();
  },
}

var Ruler = new Ruler();


function registerWorkhorseMethods()
{
  var reg = registerMethod; // abbreviation.
  reg( "Chem",    0,0, layoutMolecule, drawMolecule);
  reg( "Tree2",   0,0, layoutTree2, drawMolecule);
  reg( "MindMap", 0,0, layoutMindMap, drawMindMap);
  reg( "Atom",    0,0, layoutAtom, drawAtom);
  reg( "Bond",    0,0, layoutBond, drawBond);
  reg( "Ruler",   createRuler,0, layoutMargined, drawRuler);

  reg = registerReadWrite;
  reg( "MindMap",         readMindMap,         writeMindMap);
  reg( "Geometry",        readGeometry,        writeMindMap);
  reg( "Molecule",        readMolecule,        writeMindMap);
  reg( "Snake",           readSnake,           writeMindMap);
  reg( "Quads",           readQuads,           writeMindMap);
  reg( "Flowchart",       readFlowchart,       writeMindMap);
  reg( "LineArt",         readLineArt,         writeMindMap);
  reg( "GenericDiagram",  readGenericDiagram,  writeMindMap);
  reg( "Annotated",       readAnnotated,       writeMindMap);
  reg( "CodeTiles",       readCodeTiles,       writeMindMap);
  reg( "SceneGraph",      readSceneGraph,      writeMindMap);
  reg( "Rainbow",         readRainbow,         writeMindMap);
  reg( "StarMap",         readStarMap,         writeMindMap);
  reg( "Sankey",          readSankey,          writeMindMap);

}

Registrar.inits.push( registerWorkhorseMethods );

Exports();

return metaData;
}( Registrar );// end of workhorse_js

