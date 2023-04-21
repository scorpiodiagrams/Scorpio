function getNextSequenceCoord( A, obj, d){
  return getCoordinateOffsetPlusLayout( A, d.sequence[ d.index++]);
}

function getPCoord( A, obj, d ){
  return obj.P;
}

function getCoordinateOffsetPlusLayout( A, id ){
  var P = {};
  var obj = objectFromId(A, id);
  if( !isDefined( obj ) )
    return P;
  if( !isDefined( obj.pos ) )
    return P;
  if( !isDefined( obj.offset ) )
    return P;
  P.x = obj.offset.x + obj.pos.x;
  P.y = obj.offset.y + obj.pos.y;
  return P;

}



function catmulBlend(t, t0, t1, P0, P1 ){
  var b0 = (t1-t)/(t1-t0);
  var b1 = (t0-t)/(t0-t1);
  return {x:b0*P0.x+b1*P1.x,y:b0*P0.y+b1*P1.y};
}

function catmulBlendd(t, t0, t1, P0, P1 ){
  var b0 = -1/(t1-t0);
  var b1 = -b0;
  return {x:b0*P0.x+b1*P1.x,y:b0*P0.y+b1*P1.y};
}

function catmulBlendd2(t, t0, t1, P0, P1, P0d, P1d ){
  var b0 = (t1-t)/(t1-t0);
  var b1 = (t0-t)/(t0-t1);
  var b0d = -1/(t1-t0);
  var b1d = -b0;
  return {x:b0d*P0.x+b1d*P1.x+b0*P0d.x+b1*P1d.x,y:b0d*P0.y+b1d*P1.y+b0*P0d.y+b1*P1d.y};
}


function catmulLength( P0, P1 ){
  var x = (P1.x-P0.x);
  var y = (P1.y-P0.y);
  return Math.pow(((x*x)+(y*y)),0.25 );

}

function catEval( t, t0,t1,t2,t3,P0,P1,P2,P3 ){
  var A1 = catmulBlend( t, t0,t1,P0,P1 );
  var A2 = catmulBlend( t, t1,t2,P1,P2 );
  var A3 = catmulBlend( t, t2,t3,P2,P3 );
  var B1 = catmulBlend( t, t0,t2,A1,A2 );
  var B2 = catmulBlend( t, t1,t3,A2,A3 );
  var C  = catmulBlend( t, t1,t2,B1,B2 );
  return C;
}

function catRotationEval( t, t0,t1,t2,t3,P0,P1,P2,P3 ){
  var A1 = catmulBlend( t, t0,t1,P0,P1 );
  var A2 = catmulBlend( t, t1,t2,P1,P2 );
  var A3 = catmulBlend( t, t2,t3,P2,P3 );

  var A1d = catmulBlendd( t, t0,t1,P0,P1 );
  var A2d = catmulBlendd( t, t1,t2,P1,P2 );
  var A3d = catmulBlendd( t, t2,t3,P2,P3 );

  var B1 = catmulBlend( t, t0,t2,A1,A2 );
  var B2 = catmulBlend( t, t1,t3,A2,A3 );

  var B1d = catmulBlendd2( t, t0,t2,A1,A2, A1d, A2d );
  var B2d = catmulBlendd2( t, t1,t3,A2,A3, A2d, A3d );

  //var C  = catmulBlend( t, t1,t2,B1,B2 );
  var Cd  = catmulBlendd2( t, t1,t2,B1,B2,B1d,B2d  );

  var theta = Math.atan2( Cd.x, Cd.y )+Math.PI;

  return theta;
}

function bulge(b, x, t ){
  if( !b)
    return 0;
  var s;
  if( t< x )
    s = t/x;
  else
    s = (1-t)/(1-x);
  s = s*s*(3-2*s);
  return b * s;
}

// Simple linear blend, a at 0, b at 1.
// Constant gradient.
function tBlend(a, b, t ){
  return a + t * (b-a);
}

// Hermite blend, a at 0, b at 1.
// Zero gradient at 0 and 1.
function hermiteBlend(a, b, t ){
  return a + t*t*(3-2*t) * (b-a);
}

/**
 * The 'graph' functions return a vaguely audio looking stereo waveform.
 * Eight 'graphN()' functions produce some mix of sinusoids.
 * These are then labelled alphabetically and cobbled together with
 * a hermite blend over a 100 item span.
 * @param x
 * @param perturb
 * @returns {number}
 */

function graph1( x, perturb ){
  return 0.7*Math.sin( Math.PI * (x/200.1257680 + perturb) )*Math.sin( Math.PI * (x*1.3276409) )
    + 0.05*Math.sin( Math.PI * (x/3.31572981) );
}
function graph2( x, perturb ){
  return 0.6*Math.sin( Math.PI * (x/50.1257680 + perturb) )*Math.sin( Math.PI * (x*1.3276409) )
    + 0.05*Math.sin( Math.PI * (x/3.31572981) );
}
function graph3( x, perturb ){
  return 0.5*Math.sin( Math.PI * (x/10.1257680 + perturb) )*Math.sin( Math.PI * (x*1.3276409) )
    + 0.05*Math.sin( Math.PI * (x/3.31572981) );
}
function graph4( x, perturb ){
  return 0.4*Math.sin( Math.PI * (x/20.1257680 + perturb) )*Math.sin( Math.PI * (x*1.3276409) )
    // x is between 0 and 2000.
    + 0.05*Math.sin( Math.PI * (x/3.31572981) );
}
function graph5( x, perturb ){
  return (0.1*Math.sin( Math.PI * (x/100.1257680 + perturb) )+0.3)*Math.sin( Math.PI * (x*1.3276409) )
    + 0.05*Math.sin( Math.PI * (x/3.31572981) );
}
function graph6( x, perturb ){
  return (0.01*Math.cos( Math.PI * (x/100.1257680 + perturb) )+0.15)*Math.sin( Math.PI * (x*1.3276409 + perturb) )
    + (0.05)*Math.sin( Math.PI * (x/(3.31572981+ perturb*8)) );
}
function graph7( x, perturb ){
  return 0.07*(0.1*Math.sin( Math.PI * (x/90.1257680 + 0.33+perturb) )+0.3)*Math.sin( x + perturb*2 );
}
// H: almost silence...
function graph8( x, perturb ){
  return 0.001*Math.sin(x)+0.001*Math.sin(x*2.1);
}


var gChooser = "HGABCDEFFHABBCCDDFFHADC";
//var gChooser = "AGH";
function graphFnUnblended(x, t, perturb ){
  var i = Math.floor( (x+t)/100) % gChooser.length ;
  var ch = gChooser[ i ];
  switch( ch ){
    case 'A':
      return graph1( x,perturb);
    case 'B':
      return graph2( x,perturb);
    case 'C':
      return graph3( x,perturb);
    case 'D':
      return graph4( x,perturb);
    case 'E':
      return graph5( x,perturb);
    case 'F':
      return graph6( x,perturb);
    case 'G':
      return graph7( x,perturb);
    default:
      return graph8( x,perturb);
  }
}

/**
 * Get waveform value.
 * The waveform is specified in blocks.
 * We blend two adjacent blocks, so that there are no
 * discontinuities at block boundaries.
 * @param x - the position in the waveform
 * @param perturb - allow left and right audio to differ.
 * @returns {number} - value of nice smooth function
 */
function graphFn( x, perturb ){
  // y computed using correct block
  var y0 = graphFnUnblended( x, 0, perturb );
  // y computed using next block.
  var y1 = graphFnUnblended( x, 100, perturb );

  // If the blocks were the same, then the blend
  // does nothing.  But if they are different, we
  // transition smoothly from one to the other as x
  // increases.
  var t = (x - Math.floor( x/100)*100)*0.08;
  t = constrain( 0,t,1);
  // t is now between 0 and 1.
  return hermiteBlend( y0, y1, t );
}

