
/**
 * Texture warping using nurbs
 * involves a solver for x,y back to s,t texture coordinates.
 */


function drawTextureOld( A, obj, d ){
  if(d.stage!==kStageFillAndText)
    return;

  var {x,y,xw,yh} = getBox( obj );
  var indent = 40;

  var ctx = A.BackingCanvas.ctx;

  ctx.rect(10, 10, 100, 100);
  ctx.fill();
  
  //var srcData = ctx.getImageData(x, y, xw, yh).data;
  var dstData = ctx.createImageData( xw, yh);
  var dst=dstData.data;

  var i;
  var j;
  var ii;
  var jj;
  var k=0;
  var m;
  var n;
  var r=20;
  var speed = 1.0/600; // bigger is faster
  var c1 = Math.abs(250*Math.cos( 2 * A.Status.time * speed));
  var ss1 = Math.abs(250*Math.sin( 3 *A.Status.time * speed));
  var c2 = Math.abs(250*Math.cos( 3.1 * A.Status.time * speed))+300;
  var ss2 = Math.abs(250*Math.sin( 2.1 *A.Status.time * speed))+100;

  var hl1 = Vector2d( 100,100);
  var hl2 = Vector2d( 100,100);

  var scale = 300/(100+Math.sqrt((c2-c1)*(c2-c1)+(ss2-ss1)*(ss2-ss1)));
  scale = 0.5*(scale + 0.4/scale);
  //scale =2;
  //scale = Math.max( 1, Math.min( scale, 2));
  oldVersion = false;
  for( j=0;j<yh;j++)
  {
    for(i=0;i<xw;i++)
    {
      m=i-c1;
      n=j-ss1;
      ii=i-c2;
      jj=j-ss2;

      zz2 =250;

      p= Math.floor(Math.sqrt(ii*ii + jj*jj)*2.7*scale);
      q= Math.floor(Math.sqrt(m*m+n*n)*3*scale);
      p=Math.abs(p-A.Status.time-2000)%200;
      q=Math.abs(q-A.Status.time-2000)%200;
      r=Math.abs(Math.sqrt(p*q)-A.Status.time)%250;
      //r=Math.abs(p+q+A.Status.time)%200;
      //r=0;
      //p=0;q=0;
      var z = Math.max(p%200,q%200, r%200)%200+Math.abs(A.Status.time%200-100);
      z = ((z % 20) <3)?0:200;

      z = Math.floor(z);
      if( z < 3)
        zz2 = 10;
      z = (z*9+253) & 255;        

      dst[k]= zz2;
      dst[k+1]= z;
      dst[k+2]= 128;
      dst[k+3]= 255;
      k+=4;
    }
  }
  ctx.putImageData(dstData, x,y);
}

// beyond some distance we return 'infinity' 
// for the distance.
function lineDistance( v, p0, p1){
  var line = p1.sub(p0);
  var len = line.length();
  var vert = v.sub(p0);
  var t = vert.dot( line)/(len*len);
  if( t> 1 )
    return 1000;
  if( t< 0)
    return 1000;
  var d = vert.sub( line.mul( t)).length();
  return d;

}

function polyLineDistance( v, c){
  var kk = c.length;
  var z = 1000;
  for(k=0;k<kk;k++){
    z = Math.min( z, c[k].sub(v).length());
  }
  for(k=0;k<kk-1;k++){
    z = Math.min( z, lineDistance(v, c[k], c[k+1] ));
  }
  return z;
}


/**
 * This is a standard Bezier calculation
 * A cubic blend of four vectors.
 * c can offer many such curves.
 * ix chooses which one.
 */
function getPointByT( c,t, ix )
{
  var mt = 1-t;
  // fractionally faster calculation by
  // pre-computing mt squared and t squared. 
  mtmt = mt*mt;
  tt   = t*t;
  var p = 
     c[ix  ].mul( mtmt*mt ).add(
     c[ix+1].mul( mtmt*t  ).add(
     c[ix+2].mul( mt  *tt ).add(
     c[ix+3].mul( t   *tt ) )));
  return p;
}

/**
 * This gives the slope of a cubic Bezier curve
 * as a function of t. 
 */
function getDeltaByT( c,t, ix )
{
  var mt = 1-t;
  mtmt = mt*mt;
  tt   = t*t;
  var p = 
     c[ix  ].mul( -3*mtmt          ).add(
     c[ix+1].mul( -2*mt*t + mtmt   ).add(
     c[ix+2].mul(  2*mt*t - tt     ).add(
     c[ix+3].mul(  3*tt            ) )));
  return p;
}


/**
 * This blends two Bezier curves.
 * s is the blend factor.
 */
function getPointBySt( c,s,t )
{
  var ms = 1-s;
  var p = getPointByT( c, t, 0).mul( ms );
  var q = getPointByT( c, t, 4).mul( s);
  return p.add( q );
}


/**
 * This gets the curves parameters at s,t
 * pt - the point
 * deltaS - how much it changes for a change in s
 * deltaT - how much it changes for a change in t
 */
function getCurveAtSt( c,s,t )
{
  result = {};
  var ms = 1-s;
  var p = getPointByT( c, t, 0);
  var q = getPointByT( c, t, 4);

  var deltaP = getDeltaByT( c, t, 0);
  var deltaQ = getDeltaByT( c, t, 4);

  result.pt = p.mul( ms ).add( q.mul(s));
  result.deltaS = q.sub( p );
  result.deltaT = deltaP.mul( ms ).add( deltaQ.mul(s));

  return result;
}


function updateSolver( S, v){
  //return sillySolver( S,v);
  var s=0.5;
  var t=0.5;
  var e=1000;
  var ans1=S.ans;
  if( ans1 ){
    s = ans1.s;
    t = ans1.t;
    e = ans1.err.normMax();
  }
  else
  {
    ans1 = {};
    ans1.sOld = s;
    ans1.tOld = t;
  }

  /** 
   * Make laziness 0 to test at every single pixel.
   * 10.01 only recalculates slopes when we are 
   * extrapolating 'from 10 pixels away' in x,y space.
   */
  var laziness = 10.01;

  if( e > laziness){
    ans1 = getCurveAtSt(S.c,s,t);
    ans1.sOld = s;
    ans1.tOld = t;
  }

  // err is the x,y error,
  // IF we were to use s,t and not update them.
  var err = v.sub( ans1.pt);
  var DS = ans1.deltaS;
  var DT = ans1.deltaT;
  var det = DS.x * DT.y - DS.y * DT.x;
  var detReciprocal = 1 / det;
  var ds = detReciprocal * (  DT.y * err.x - DT.x * err.y);
  var dt = detReciprocal * ( -DS.y * err.x + DS.x * err.y);

//  console.log( "Aiming for point", v);
//  console.log( "We are at  point", ans1.pt);
//  console.log( "Error Vector  is", err);
//  console.log( "DeltaS ", ans1.deltaS);
//  console.log( "DeltaT ", ans1.deltaT);
//  console.log( "Update by: ", ds, ", ",dt );

  ans1.err = err;
  ans1.s = constrain( 0, ans1.sOld +ds, 1);
  ans1.t = constrain( 0, ans1.tOld +dt, 1);

  ans1.isValid= (0<ans1.s) && (ans1.s<1) && (0<ans1.t) && (ans1.t<1);

  S.ans = ans1;
}


/** 
 * Silly solver solves the trivial function
 * where s,t and x,y essentially correspond.
 * it is useful to get an idea of how fast/slow the
 * morphing could be in the best case.
 */
function sillySolver(S,v)
{
  var ans = {};
  ans.s = v.x/700;
  ans.t = v.y/400;
  S.ans = ans;
}

/** 
 * A test function to show we do converge onto solutions..
 */
function solveMe(A,obj,d)
{
  var S = obj;
  var s = 0.5;
  var t = 0.28;
  var ans1 = getCurveAtSt(S.c,s,t);
  s =0.5;
  t =0.25;
  var ans2 = getCurveAtSt(S.c,s,t);
  var err = ans1.pt.sub( ans2.pt);
  var DS = ans1.deltaS;
  var DT = ans1.deltaT;
  var det = DS.x * DT.y - DS.y * DT.x;
  var detReciprocal = 1 / det;
  var ds = detReciprocal * (  DT.y * err.x - DT.x * err.y);
  var dt = detReciprocal * ( -DS.y * err.x + DS.x * err.y);


//  console.log( "Aiming for point", ans1.pt);
//  console.log( "We are at  point", ans2.pt);
//  console.log( "Error Vector  is", err);
//  console.log( "DeltaS ", ans1.deltaS);
//  console.log( "DeltaT ", ans1.deltaT);
//  console.log( "Update by: ", ds, ", ",dt );


//  console.log("----------------------");
//  debugger;
//  updateSolver( S, Vector2d( 391,104));
//  updateSolver( S, Vector2d( 392,104));
//  updateSolver( S, Vector2d( 393,104));
//  updateSolver( S, Vector2d( 393,104));
//  updateSolver( S, Vector2d( 393,104));
//  updateSolver( S, Vector2d( 394,104));
//  updateSolver( S, Vector2d( 394,104));
//  updateSolver( S, Vector2d( 394,105));
//  updateSolver( S, Vector2d( 394,105));
}



function getPoints( steps, c)
{
  var pts = [];
  var m
  for( m=0;m<=steps;m++){
    var t = m/steps;
    var curve = getCurveAtSt( c,0.5,t);
    pts.push( curve.pt );
  }
  return pts;
}


function bezDist( v, S){
  var m;

  pts = S.pts;
  ptStep = S.ptStep;
  nPts = S.nPts;
  pts6 = S.pts6;

  pt  = S.pt;
  pt1 = S.pt1;

  var zz = v.sub( pts[pt]).length();
  var count = 1;
  var qStep = ptStep;
  var min = 0;
  var max = nPts-1;

  if(zz<20){
    for( m=pt-2;m<=pt+2;m++)
    {
      zn = v.sub( pts[(m+nPts)%nPts]).length();
      if( zn < zz){
        pt = (m+nPts)%nPts;
        zz = zn;
      }
    }
  }
  for( m=0;m<count;m++)
  {
    pt1 = (pt1+qStep)%nPts;
    zn = v.sub( pts[pt1]).length();
    if( zn < zz){
      pt = pt1;
      zz = zn;
    }
  }

  if( S.perfectPlot )
    zz = polyLineDistance(v,pts6);

  S.pt = pt;
  S.pt1 = pt1;

  return zz;
}


function distLimit( d, max ){
  if( d>max )
    return max;
  var t;
  t = d/max;
  t = t*(1+t-t*t);
  return t*max;
}

function bezDist2( v, S){

  dis = S.dis;

  var zz;
  var d0 = polyLineDistance( v, S.Lines[0]);
  var d1 = polyLineDistance( v, S.Lines[1]);

  d0 = distLimit( d0, dis );
  d1 = distLimit( d1, dis );

  var t = d0/(d0+d1);
  t=0.5;
  zz = (1-t)*d0-t*d1+dis/2;

  return zz;
}

function getDriftyQuad( A, obj, d){
  var indent = 40;

  var c=[];
  if( obj.atoms ){
    var a = obj.atoms;
    c.push( Vector2d(a[1].x,a[1].y));
    c.push( Vector2d(a[0].x,a[0].y));
    c.push( Vector2d(a[3].x,a[3].y));
    c.push( Vector2d(a[2].x,a[2].y));
  }
  else if( obj.shape){
    c.push( obj.shape[1]);
    c.push( obj.shape[0]);
    c.push( obj.shape[3]);
    c.push( obj.shape[2]);
  }
  else
  {
    var speed = 1.0/200; // bigger is faster
   // speed = 0;
    var cc1 = Math.abs(250*Math.cos( 2 * A.Status.time * speed));
    var ss1 = Math.abs(250*Math.sin( 3 *A.Status.time * speed));
    var cc2 = Math.abs(250*Math.cos( 3.1 * A.Status.time * speed))+300;
    var ss2 = Math.abs(250*Math.sin( 2.1 *A.Status.time * speed))+100;

    c=[
      Vector2d( cc1, ss1+190),
      Vector2d( cc1-100, ss1+20),
      Vector2d( cc2+50, ss2+30),
      Vector2d( cc2, ss2+190)
      ];
  }

  var strength = 0.7;
  c[4] = c[0].sub(c[1]).perp(strength).add(c[0]).mul(3);
  c[5] = c[2].sub(c[3]).perp(strength).add(c[3]).mul(3);
  c[6] = c[0].sub(c[1]).perp(strength).add(c[1]).mul(3);
  c[7] = c[2].sub(c[3]).perp(strength).add(c[2]).mul(3);

  return c;  
}


function drawFilledQuad( A, quad, d )
{
//  debugger;
}

function minny( a,b ){
  return a.min(b);
}
function maxy( a,b ){
  return a.max(b);
}

function getQuadBox( c ){
  vv = [c[0],c[1],c[2],c[3]];
  var mins = vv.reduce( minny ).floor();
  var maxs = vv.reduce( maxy ).floor();
  mins.y=0;
  return { x:mins.x, y:mins.y, xw:maxs.x-mins.x,yh:maxs.y-mins.y };
}

function getPixelBySt( s, t)
{
  var scale = 200 *30;
  s = Math.floor(s*scale) %400;
  s = Math.abs( s-200 );
  t = Math.floor(t*scale) %400;
  t = Math.abs( t-200 );
  return ((Math.max( s,t ))+50);

}


function drawTexture( A, obj, d ){
  if(d.stage!==kStageFillAndText)
    return;

  var c = getDriftyQuad(A,obj,d);

  var ctx = A.BackingCanvas.ctx;

  var {x,y,xw,yh} = getQuadBox( c, obj );

  //var srcData = ctx.getImageData(x, y, xw, yh).data;
  var dstData = ctx.getImageData( x,y,xw, yh);
  var dst=dstData.data;

  var i;
  var j;
  var k=0;

  var S = {};

//  var nPts = 411;
//  var ptStep = 251; // phi and coprime.
//  var pts=getPoints( nPts-1, c);
//  S.pts    = pts;
//  S.ptStep = ptStep;
//  S.nPts   = nPts;

  var zz;
  var z;
  var z1;


  S.c = c;

  var cd=[];
  cd[0]=c[0];
  cd[1]=c[4];
  cd[2]=c[5];
  cd[3]=c[3];
  cd[4]=c[1];
  cd[5]=c[6];
  cd[6]=c[7];
  cd[7]=c[2];

  var pts6=getPoints( 30, cd);

  S.c = cd;


  S.Lines = [[c[0],c[1]],[c[2],c[3]]];


  S.perfectPlot = false;
  S.pts6   = pts6;
  S.base   = c[2].sub(c[0]).length()/2;
  S.dis = 300;


  var T = {};

  T.c = c;
  T.Lines = [[c[0],c[3]],[c[1],c[2]]];
  T.dis = 150;

  for( j=0;j<yh;j++)
  {
    S.pt=0;
    S.pt1=0;
    k = j * (xw*4);
    S.ans = undefined;
    updateSolver( S, Vector2d(x,y+j));
    for(i=0;i<xw;i++)
    {
      var v = Vector2d(i+x,j+y);
      var zz2 = 250;

//      zz = bezDist2( v, S );
//      z  = Math.floor(zz);
//      if( ((z+ 5) %S.dis) < 10)
//        zz2 = 10;

//      zz = polyLineDistance(v,pts6);
//      z  = Math.floor(zz);
//      if( (z+ 5) < 10)
//        zz2 = 10;
//
//      z = (z*15+253)&255;


      updateSolver( S, v);
      var hmul = obj.hmul || 1;
      var vmul = obj.vmul || 1;
      var row = Math.floor((1-S.ans.s)*vmul);
      var s = (1-S.ans.s)*vmul%1;
      var tIn = (row%2) ? (row+1-S.ans.t):(row+S.ans.t);
      var t = ((tIn)*hmul)%1;
      if( row%2)
        s = 1-s;

      if( !S.ans.isValid )
      {
        ;
      }
      else if( obj.srcData ){

        var src = obj.srcData.data;
        var img = obj.img;
        var sw = obj.srcData.width;
        var sh = obj.srcData.height

        s = Math.floor(s*sh);
        t = Math.floor(t*sw);
        var r = (s * sw + t)*4;
        if( src[r+3] > 10){
          dst[k]  = src[r  ];
          dst[k+1]= src[r+1];
          dst[k+2]= src[r+2];
          dst[k+3]= src[r+3];
        }
      }
      else 
      {
        z = getPixelBySt( s, t);
        dst[k]= zz2;
        dst[k+1]= z;
        dst[k+2]= 128;
        dst[k+3]= 255;
      }
      k+=4;
    }
  }

  ctx.putImageData(dstData, x,y);
  //solveMe( A, S, d);
}
