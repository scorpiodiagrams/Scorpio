function Shape(){
   // Shape uses Vector2d
   // Shape uses ctx
   // It doesn't know about the rest of the dom.
   this.offset = new Vector2d(0,0);
   this.points = [];
   this.edges = [];
   this.commands = [];
}

TileStyles = {
   green : { outline:"#225533", fill: "#55AA77", width:4},
   blue :  { outline:"#223355", fill: "#5577AA", width:4},
   red :   { outline:"#552233", fill: "#AA5577", width:4},
   yellow :{ outline:"#AAAA33", fill: "#CCCC77", width:4},
};


ShapeData = {
   LeftEdges  : {}, // left and right end shapes.
   InOuts : {},     // up and down additions..
   LinkTypes : {},
}
/* reverses the string.  
 * used for the oipposite end where we build from bottom to top
 */
function reversedCode( code ){
   var reversed = "";
   var len = code.length;
   for(i=code.length-1;i>=0;i--){
      ch = code[i];
      reversed += ch;
   }
   return reversed;
}

/**
 * Replaces left brackets by right brackets, etc.
 */
function swappedCode( code, swaps ){
   var flipped = "";
   var len = code.length;
   for(i=0;i<code.length;i++){
      ch = code[i];
      index = swaps.indexOf( ch );
      if( index >=0){
         index = index - 2*(index % 2) + 1;
         ch = swaps[index];
      }
      flipped += ch;
   }
   return flipped;
}


// This x-flips the 'code string' which can give us indented
// shapes in addition to the out dented default shapes.
// for example...
//    (  becomes )
//   <=  becomes >=
//    /  becomes \
//   \/\ becomes /\/
function flippedCode( code ){
   return swappedCode( code, "()[]<>{}/\\" );
}

// This rotates the 'code string' for use on the other end
// for example...
//    (  becomes )
//   <=  becomes =>
//    /  becomes /
//   \/\ becomes \/\
function rotatedCode( code ){
   if( !code )
      return code;
   var flipped = swappedCode( code, "()[]<>{}" );
   if( flipped.match(/-|=|\)\+\(|\(\+\)/))
      flipped = flipped.split('').reverse().join('');
   return flipped;
}

function drawSvg( i, src, s, flip, svg, siz, align ){
   flip = flip || 1.0;
   flip = flip * src.scaling * 0.7;
   var start= src.getPoint(i-1);
   var along = src.getPoint(i).sub( start);
   var l = along.length();
   s.addPoint(start);
   var pt;

   var x,y;
   x=0;
   y=0;
   var base = 0;
   if( siz ){
      along = along.normalized( siz );
      if( align )
      {
         // preamble...
         base = ((l-siz) * align)/siz;
//         pt = start.add( along.mul( x ));
//         s.addPoint( pt );
      }
   }
   var perp = along.perp();


   commands = svg.split( " ");
   var j=0;
   while( j < commands.length )
   {
      if( commands[j]=="L"){
         x = base +(commands[++j])/100.0;
         y = +(commands[++j])/100.0;
         pt = start.add( along.mul( x )).add( perp.mul( y * flip));
         s.addPoint( pt );
      } 
      else if( commands[j]=="M"){
         s.setMove();
         x = base +(commands[++j])/100.0;
         y = +(commands[++j])/100.0;
         pt = start.add( along.mul( x )).add( perp.mul( y * flip));
         s.addPoint( pt );
      } 
      else if( commands[j]=="C"){
         s.setBezier();
         for(var k=0;k<3;k++){
            x = base +(commands[++j])/100.0;
            y = +(commands[++j])/100.0;
            pt = start.add( along.mul( x )).add( perp.mul( y * flip));
            s.addPoint( pt );
         }
      }   
      j++;
   }
   return s;     
}

function makeSvgDrawer( svg, siz, align ){
   return function( i, src, s, flip ){
      return drawSvg( i,src,s,flip, svg, siz, align);
   }
}

function getExtraSpaceLeft( code ){
   type = ShapeData.LeftEdges[code];
   if(!type)
      return 0.0;
   return type.space;
}

function typeEntry( fn, space, mid ){
   return { 'fn': fn, 'space': space, 'mid': mid/100};
}

// Space is how much extra space the end
// provides.  If negative, it encroaches on space.
function setEnd( name, code, space, mid, flips, svg ){
   var fn1 = makeSvgDrawer( svg );
   var fn2 = function( i, src, s ){
      return fn1( i, src, s, -1);
   };

   // named items are the same on left and right.
   ShapeData.LeftEdges[ name ] = typeEntry( fn1, space, mid );

   if( flips )
      ShapeData.LeftEdges[ name+"Flip" ] = typeEntry( fn2, -space, -mid );

   if( !code )
      return;

   var flipped        = flippedCode( code );
   ShapeData.LeftEdges[ code ] = typeEntry( fn1, space, mid );

   if( flips )
      ShapeData.LeftEdges[ flipped ] = typeEntry( fn2, -space, -mid );

}

function setInOut( name, svg, align, offset ){
   offset = offset || 18;
   var fn1 = makeSvgDrawer( svg, offset, align );
   ShapeData.InOuts[ name ] = typeEntry( fn1, 0, 0 );
}

function setInOutBend( name, svg ){
   var fn1 = makeSvgDrawer( svg );
   ShapeData.InOuts[ name ] = typeEntry( fn1, 0, 0 );
}

// An end shape can be left-right flipped by change of sign x.
// and sometimes that is a useful shape too.

function makeEndCodes(){

   const flips = true;
   const noflip = false;

// setEnd( "round",   "(",     1.25, 100,flips, "C 0 100 100 100 100 0"  );
   setEnd( "round",   "(",     0.6, 100,flips, "C 0 30 20 75 50 75 C 80 75 100 30 100 0"  );
   setEnd( "dot",     ".",     0.0, 0,flips, "M 40 0 L 60 0 M 100 0"  );
   setEnd( "chevron", "<",     0.4, 100, flips, "L 50 70" );
   setEnd( "forward", "/",     0.0, 0, flips, "L 0 40 L 100 -40" );
   setEnd( "straight","[",     0.0, 0, noflip, "" );
   setEnd( "straight","|",     0.0, 0, noflip, "" );
   setEnd( "zigzag",  "\\+/+\\",-0.0, 0, flips, "L 33 15 L 66 -15" );
   setEnd( "sway",    ")+(",   -0.0, 0, flips, "C 30 60 60 -60 100 0" );
   // We give the left version of arrow, <= and
   // this will also make the right hand version, =>
   setEnd( "arrow_head", "<=",    0.8, 150, noflip, "L -20 0 L 50 150 L 120 0" );
//   setEnd( "arrow_head", "<=",    0.8, rot, "L -20 0 L 50 150 L 120 0");
   setEnd( "arrow_tail", ">=",   0.2, 0, noflip, "C 0 20 25 25 25 40 L 25 45 L -30 60 L -30 70 L 25 60 L 25 70 L -30 85 L -30 95 L 25 85 L 25 95 L -30 110 L -30 120 L 25 110 L 25 120 L -30 135 L -30 145 L 25 135 C 25 145 35 160 50 160 C 60 160 75 145 75 135 L 130 145 L 130 135 L 75 120 L 75 110 L 130 120 L 130 110 L 75 95 L 75 85 L 130 95 L 130 85 L 75 70 L 75 60 L 130 70 L 130 60 L 75 45 L 75 40 C 75 25 100 20 100 0");
   // some special shapes just for fun.
   setEnd( "snake_head","",0.6,noflip, 0, "C -13 16 -27 1 -39 19 C -90 77 -40 114 -40 160 C -33 258 15 182 28 160 L 61 51 L 79 89 C 71 156 63 190 37 204 C 9 210 12 237 -21 241 C 16 240 27 234 42 216 C 29 241 46 242 32 278 C 60 249 42 222 55 205 C 84 180 79 157 93 118 L 110 170 C 116 192 126 217 152 159 C 164 128 180 120 170 70 C 150 10 140 40 100 0");
   setEnd( "snake_tail","",0.8,noflip, 0, "C 0 120 50 150 110 310 C 70 120 100 40 100 0");
   setEnd( "warm_front","",0.1,flips, 50, "C 0 50 50 50 50 0 C 50 50 100 50 100 0");
   setEnd( "cold_front","",0.1,flips, 45, "C 10 0 25 25 25 45 C 25 25 40 0 50 0 C 60 0 75 25 75 45 C 75 25 90 0 100 0 ");
   setInOut( "InStem", "L 0 0 L 0 100 L 50 30 L 100 100 L 100 0",0 );
   setInOut( "OutStem", "L 0 0 L 0 100 L 50 170 L 100 100 L 100 0",1 );
   setInOut( "InPip", "L 0 0 L 50 70 L 100 0",0 );
   setInOut( "OutPip", "L 0 0 L 50 70 L 100 0",1 );
}

makeEndCodes();


function getBondData( bond, d, r ){
   var a;
   a = bond.a1;
   var v0 = Vector2d( a.x, a.y );
   var r0 = r || a.size || a.r;
   var l1 = a.level;
   a = bond.a2;
   var v1 = Vector2d( a.x, a.y );
   var r1 = r || a.size || a.r;
   var l2 = a.level;

   transformXy( v0, d );
   transformXy( v1, d );

   return [ v0,v1, r0, r1, l1, l2];
}

//Uses a taper for the connection.
//Doesn't have a label.
//can't be crinkly.
function drawWideLineTrampoline(A, obj, d){
   //d.stage = kStageFillAndTextEarly;

   var taper = parseLabelString( obj.value || '--' );
   taper.extensionLength = firstValid( d.lineStyle.lineExtend, -12);

   var r0, r1;
   var r = obj.linkWidth || d.lineStyle.linkWidth;

   [taper.v0, taper.v1, r0, r1, l1, l2 ] = getBondData( obj, d, r );

   taper.lineAt =
      { v0: taper.v0, v1: taper.v1, r0: r0, r1: r1};

   var mid = taper.v0.add( taper.v1).mul( 0.5 );
   taper.textAt = 
      { v0: mid, v1: mid, r0: 2, r1: 2};

   taper.l1 = l1;
   taper.l2 = l2;
   taper.styled = obj.styled; // used for cloze question colours..

   taper.label = false;
   taper.bend = obj.bend;
   taper.multiplicity = obj.multiplicity;
   taper.hotspotColour = obj.hotspotColour;
 
   taper.taperIs = 'link';

   d.dddStyle = d.lineStyle;
   drawLineLabelAndText( A, taper, d);
//   drawTaper(A, taper, d);
}

//Uses a line for the connection.
//can have a label.
//can be crinkly
function drawNarrowLineTrampoline(A, obj, d){

   var taper = parseLabelString( obj.value || '--' );
   taper.extensionLength = firstValid( d.lineStyle.lineExtend, -12);

   var r0, r1;
   [taper.v0, taper.v1, r0, r1, l1, l2 ] = getBondData( obj, d );

   var r = obj.linkWidth || d.lineStyle.linkWidth;
   taper.lineAt =
      { v0: taper.v0, v1: taper.v1, r0: r || r0, r1: r || r1};

   var mid = taper.v0.add( taper.v1).mul( 0.5 );
   taper.textAt = 
      { v0: mid, v1: mid, r0: 2, r1: 2};

   taper.l1 = l1;
   taper.l2 = l2;
   taper.styled = obj.styled;

   taper.label = false;
   taper.bend = obj.bend;
   taper.multiplicity = obj.multiplicity;
   taper.hotspotColour = obj.hotspotColour;

   taper.taperIs = 'link';

   d.dddStyle = d.lineStyle;
   // draws the line behind, the text and the 'Taper' as
   // an equal dimensioned thing.
   drawLineLabelAndText( A, taper, d);
}


function setLinkMaker( name, makerFn){
   ShapeData.LinkTypes[name]=makerFn;
}

function makeLinkStyles(){
   setLinkMaker( "Wide",        drawWideLineTrampoline );
   setLinkMaker( "Narrow",      drawNarrowLineTrampoline );
}


function drawBond(A, obj, d){
   key = d.lineStyle.defaultLinkType;
   if( ShapeData.LinkTypes[key])
   {
      ShapeData.LinkTypes[key](A,obj,d);
   }
}

makeLinkStyles();

Shape.prototype={
   addPoint(x,y){
      if( x instanceof Vector2d )
         this.points.push( x );
      else
         this.points.push(new Vector2d(x,y));
   },
   addPoints( ...items ){
      if( items[0] instanceof Vector2d )
      {
         for(item of items)
            this.points.push(item);
      }
      else
      {
         for(var i=0;i<items.length;i+=2){
            this.addPoint( items[i], items[i+1]);
         }
      }
   },
   addEdge( code, value){
      value = value || 0;
      this.edges.push( {"code":code, "value":value});
   },
   addEdges( ...codes ){
      for( item of codes){
         this.addEdge( item );
      }
   },
   dropLastPoint(){
      this.points.pop();
   },
   setPoint(i,v){
      i=(i+this.points.length)%this.points.length;
      this.points[i]=v;
   },
   setBezier(){
      this.commands[this.points.length] = "C";
   },
   setMove(){
      this.commands[this.points.length] = "M";
   },
   getPoint(i){
      i=(i+this.points.length)%this.points.length;
      return this.points[i].add( this.offset );
   },
   getEdge(i){
      if( this.edges.length < 1)
         return "straight";
      i=(i+this.edges.length)%this.edges.length;
      return this.edges[i];
   },
   finishDraw(ctx,style){
      if( style.gradient ){
         if( !Array.isArray( style.gradient)){
            var grd;
            grd = ctx.createLinearGradient(0, 0, 170, 0);
            grd.addColorStop(0, "#000");
            grd.addColorStop(1, "#bbb");
            ctx.fillStyle = grd;
         }
         ctx.fill();
      }
      else if( style.fill ){
         ctx.fillStyle=style.fill;
         ctx.fill();
      }
      if( style.outline ){
         ctx.strokeStyle=style.outline;
         ctx.lineWidth =style.lineWidth;
         ctx.stroke();
      }
   },

   // Removes spurious points from a shape.
   // When points are colinear, the intermediate points
   // are dropped.
   reduce(){      
      var i,j;
      var p,pOld,v;
      v = undefined;
      var s = new Shape();
      var l = this.points.length;
      pOld = this.getPoint( l-1 );
      for(i=0;i<this.points.length+1;i++){
         p = this.getPoint(i);
         if( i==0 )
            s.addPoint( p );
         else if( this.commands[i]){
            j= s.points.length;
            s.commands[j]=this.commands[i];
            q = this.getPoint(++i);
            r = this.getPoint(++i);
            s.addPoint( p );
            s.addPoint( q );
            s.addPoint( r );
            p=r;
            pOld = undefined;
         }
         else
         {  
            if( v ){
               // either vector zero, or they are colinear...
               if( Math.abs( pOld.sub(v).dot( p.sub(pOld).perp()))<0.01){
                  s.points.pop();
                  pOld = undefined;
                  if( s.points.length)
                    pOld = s.points[s.points.length-1];
               }
            }
            if( i< this.points.length)
               s.addPoint(p);
         }
         v=pOld;
         pOld = p;
      }

      return s;
   },

   bevelCorners( bevelAmount ){
      var i,j;
      var p,pOld,v;
      var lastPoint = undefined;
      var s = new Shape();
      var l = this.points.length;
      v    = this.getPoint( l-2 );
      pOld = this.getPoint( l-1 );
      for(i=0;i<this.points.length;i++){
         p = this.getPoint(i);
         if( this.commands[i]){
            j= s.points.length;
            s.commands[j]=this.commands[i];
            q = this.getPoint(++i);
            r = this.getPoint(++i);
            s.addPoint( p );
            s.addPoint( q );
            s.addPoint( r );
            p=r;
            pOld = undefined;
         }
         else
         {  
            if( v  ){
               var a = pOld.sub(v);
               var b = p.sub( pOld);
               var doBevel = Math.abs( a.dot(b))<0.01;
               doBevel = doBevel && (a.length() > bevelAmount*2);
               doBevel = doBevel && (b.length() > bevelAmount*2);
               if( doBevel ){
                  a= a.normalized( bevelAmount );
                  b= b.normalized( bevelAmount );
                  if( i==0 )
                     lastPoint = pOld.sub( a );
                  else 
                     s.setPoint( -1, pOld.sub( a ));
                  s.addPoint( pOld.add( b ));
               }
            }
            if( i< this.points.length)
               s.addPoint(p);
         }
         v=pOld;
         pOld = p;
      }
      if( lastPoint ){
        s.setPoint( -1, lastPoint );
      }

      return s;      
   },

   isSheened( p0,p1 )
   {  var v = p1.sub(p0);
      if( v.x == v.y )
         return v.x<-v.y;
      return v.x<v.y;
   },
   draw(ctx,style){
      this.drawInner( ctx, style );
      if( !style.pathWithEnds)
         ctx.closePath();
      this.finishDraw(ctx,style);

      // now maybe draw the sheen...
      if( this.bend )
         return;
      if( !style.sheen )
         return;
      var style2 = { outline: style.sheen || "#ff0", width:style.width}
      this.drawInner( ctx, style2, true );
      this.finishDraw(ctx,style2);
   },
   drawInner(ctx,style,sheening){      
//      if( this.bend){
//         this.drawBendy(ctx,style);
//         return;
//      }
      style = style || TileStyles.green;
      var i;
      var p,q,r;
      var pOld;
      var c;

      ctx.beginPath();
      var l = this.points.length + (style.pathWithEnds?0:1);
      var skip;
      for(i=0;i<l;i++){
         p = this.getPoint(i);
         c = this.commands[i];
         skip = (i==0);

         // We must start with M so that there is an initial point.
         // (strange results if an unclosed path starts with C) 
         if( c=='C'){
            r = p;
            q = this.getPoint(++i);
            p = this.getPoint(++i);
         }

         skip = skip || (sheening && !this.isSheened(p,pOld));

         if( skip )
            ctx.moveTo( p.x, p.y);
         else if( c=='C' ){
            ctx.bezierCurveTo( r.x,r.y,q.x,q.y,p.x,p.y );
         }
         else if( c=='M' )
         {   
            ctx.moveTo( p.x, p.y);
         }
         else
         {
            ctx.lineTo( p.x, p.y);
         }
         pOld = p;
      }
   },
   // this is very crude.  It just replaces all straight 
   // lines by bendy ones.
   drawBendy(ctx,style){
      style = style || TileStyles.green;
      var multipliers = [0.0001,2,0.0001,-2];
      var i;
      var p;
      var pPrev;
      ctx.beginPath();
      for(i=0;i<this.points.length+1;i++){
         p = this.getPoint(i);
         if( i===0 )
            ctx.moveTo( p.x, p.y);
         else{
            var f = this.bend/100;
            var v = p.sub(pPrev);
            var vPerp = v.perp( (multipliers[i%4]*f)*0.3 );
            var v0 = pPrev.add( v.mul( 0.3)).add(vPerp);
            var v1 = p.sub( v.mul(0.3)).add( vPerp);

            ctx.bezierCurveTo( v0.x, v0.y, v1.x, v1.y, p.x, p.y);
         }
         pPrev = p;
      }
   },   
   drawPolar(ctx,style, at){
      style = style || TileStyles.green;
      var i;
      var loc;
      var p=Vector2d(0,0);
      var q=Vector2d(0,0);
      ctx.beginPath();
      for(i=0;i<this.points.length+1;i++){
         loc = this.getPoint(i);
         p.x = loc.y * Math.cos( loc.x)+at.x;
         p.y = loc.y * Math.sin( loc.x)+at.y;

         if( i===0 )
            ctx.moveTo( p.x, p.y);
         // if y is essentially unchanged, draw the curve.
         else if( (Math.abs(loc.y-q.y)<0.1) )
            ctx.arc(at.x, at.y, loc.y, q.x, loc.x, loc.x < q.x);
         else
            ctx.lineTo( p.x, p.y);
         q = loc;
      }
      ctx.closePath();
      this.finishDraw(ctx,style);
   },
   // Takes two shapes of the same size, and makes a 
   // new shape, twice the number of points, alternating
   // the points.
   merge( poly ){
      var s = new Shape();
      var i;
      for( i=0;i<this.points.length;i++){
         s.addPoint( this.getPoint(i));
         s.addPoint( poly.getPoint(i));
      }
      return s;
   },
   getWartFn( wartList, i){
      var code = wartList.getEdge(i).code;
      var edge = ShapeData.LeftEdges[ code ];
      edge = edge || ShapeData.InOuts[ code ];
      var fn = edge && edge.fn;
      return fn;
   },
   addWarts( wartList, scaling ){
      var s = new Shape();
      var i;
      this.scaling = scaling || 1.0;
      for( i=0;i<this.points.length;i++){
         var fn = this.getWartFn(wartList,i);
         if( fn ){
            s = fn( i, this, s );
         }
         else 
            s.addPoint( this.getPoint(i));   
      }
      return s;
   },
   makePolygon(r,nSides, phase){
      phase = phase || 0;
      var s = new Shape();
      var i;
      var theta;
      for( i=0;i<nSides;i++){
         theta = (2*Math.PI) * ( phase +  i/nSides);
         s.addPoint( r * Math.cos( theta ), r * Math.sin( theta ) );
      }
      s.offset=Vector2d(110,110);
      return s;
   },
   makeStar(r1,r2,nSides){
      var s = this.makePolygon( r1, nSides, 0);
      var t = this.makePolygon( r2, nSides, 0.5/nSides);
      return s.merge( t );
   },
}
