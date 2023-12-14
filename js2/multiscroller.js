

Registrar.js.multiscroller_js = function( Registrar ){

var metaData = 
{ 
  version: "2023-12",
  docString: "Multiscroller. Holds the divs that have the multiscroller text, and can do positioning of them. "
};

// Imports
// var Vector2d = Registrar.classes.Vector2d
// var Box = Registrar.classes.Box;

function Exports(){
  // Namespaced  formats classes and verbs
  Registrar.registerClass( Multiscroller );
  RR.MultiscrollerDivs = MultiscrollerDivs;
}

var MultiscrollerDivs = [];

// Constructs a Multiscroller object
// A Multiscroller object...
class Multiscroller{

  constructor(){
    var M = this;
    M.initMultiscroller();
    return M;
  }

  initMultiscroller(){
    var M = this;
    M.nDivs = 10;
    for( var i=0;i<M.nDivs;i++){
      var T = {};
      RR.makeInfoCard( T );
      T.InfoCardDiv.innerHTML = `<h3>Card ${i}</h3>`;
      T.InfoCard.height = 30;
      T.InfoCardDiv.style.height = "auto";
      T.InfoCardDiv.style.min_height = T.InfoCard.height + 'px';
      T.InfoCardDiv.style.overflow = 'hidden';
      //T.InfoCardDiv.style.display = "block";
      MultiscrollerDivs.push( T );
    }
    return this;
  }
}

function drawMulti(A, obj, d){
  var ctx = getCtx( A, obj, d );

  ctx.save();
  ctx.textAlign = "left";
  ctx.fillStyle = obj.rgbCurrentText || "#f00";
  var scaling = scalingInfo(A,obj,d);

  var fontSize = d.dddStyle.fontSize || obj.r;
  ctx.font = (fontSize*scaling.font) + "px Arial";
  ctx.globalAlpha = scaling.opaque;

  var align = firstValid( obj.align, 0.5);

  var value = "Hello World<br>This is the new Line"

  var lines = value.split(/<br>/);
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

function layoutMulti( A, obj, d ){
  return;
}

function registerMultiscrollerMethods()
{
  // Items that can appear in the model
  var reg = registerMethod; // abbreviation.
  reg( "Multi",   0,0, layoutMulti, drawMulti);
//  reg( "Tree2",   0,0, layoutTree2, drawMolecule);
//  reg( "MindMap", 0,0, layoutMindMap, drawMindMap);
//  reg( "Atom",    0,0, layoutAtom, drawAtom);
//  reg( "Bond",    0,0, layoutBond, drawBond);
//  reg( "Ruler",   createRuler,0, layoutMargined, drawRuler);
}

Registrar.inits.push( registerMultiscrollerMethods );


Exports();

return metaData;
}( Registrar );// end of multiscroller_js

