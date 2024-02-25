
Registrar.js.jatex_fmt_js = function( Registrar ){


var metaData = 
{ 
  version: "2023-02",
  docString: "A LaTeX-like subsystem"
};

// Imports
// var Vector2d = Registrar.classes.Vector2d
var Box = Registrar.classes.Box;

function Exports(){
  // Namespaced  formats classes and verbs
  // These are all for export.
  Registrar.registerTextFormat( Jatex_Fmt );
  Registrar.registerVerbs( Twisty );
  Registrar.registerVerbs( Frac );
  Registrar.registerVerbs( Stack );
  Registrar.registerVerbs( Tile );
  Registrar.registerVerbs( Symbol );
  Registrar.registerVerbs( FontHandler );
  Registrar.registerVerbs( SvgSymbols );
  Registrar.registerVerbs( Macro );
  Registrar.registerVerbs( Transform );
  // Global Exports 
  // These pollute the main namespace
  RR.Jatex = Jatex;
  window.Jatex = Jatex;
}

function Twisty(){
  this.offset = 5;
  this.twistySpacing = 8;
  return this;
}

Twisty.prototype = {
  fns : "\\twisty \\twistyup \\twistyc",
  name: "Twisty",
  // joins two vectors, with offset path.
  // IF halfPath is set, we are placing a blob at v1,
  // and not drawing its offset dog-leg.
  joinv( ctx, ast, v0, offset0, v1, offset1, color, halfPath){
    ctx.save();
    for( var pass =0;pass<2;pass++){
      ctx.beginPath();  
      ctx.strokeStyle = pass? color :"#DDD";
      ctx.lineWidth = pass? 2:4;
      ctx.moveTo( v0.x, v0.y );
      ctx.lineTo( v0.x+offset0.x, v0.y+offset0.y );
      if( !halfPath )
        ctx.lineTo( v1.x+offset1.x, v1.y+offset1.y );
      ctx.lineTo( v1.x, v1.y );
      ctx.stroke();
      if( halfPath && pass ){
        ctx.beginPath();
        ctx.fillStyle = pass? color :"#DDD";
        ctx.arc( v1.x, v1.y, 2.5, 0, Math.PI *2);
        ctx.fill();
      }
    }
    ctx.restore();
  },
  directionOfSide( side ){
    return (side<2) ? Vector2d( 1,0):Vector2d(0,1);
  },
  middleOfSide( ast, side ){
    var box = ast.box;
    var w = box.width();
    var h = box.height();
    // mid points of the sides.
    var v0 = box.vecs[0];
    if( side == 0)
      return v0.add( w/2+ast.xShift, 0 );
    if( side == 1)
      return v0.add( w/2+ast.xShift, h );
    if( side == 2)
      return v0.add(  0, h/2);
    if( side == 3)
      return v0.add(  w, h/2);
    alert("Bad value for side");
  },
  connectionOfIndex( ast, side, p ){
    var dv = this.directionOfSide( side );
    dv     = dv.mul( this.twistySpacing );
    // mid points of the sides.
    var v  = this.middleOfSide( ast, side );
    // now take account of mid point and i and j.
    v = v.add( dv.mul(p) );
    return v;
  },
  offsetOfIndex( ast, side, p ){
    var offset = this.directionOfSide( 3-side );
    var sign   = (side%2)?-1:1;
    offset     = offset.mul( sign * this.offset );
    return offset;
  },
  join( ctx, ast, sideFrom, sideTo, p, q, color, t, v, offset){
    var v0 = this.connectionOfIndex( ast, sideFrom, p);
    var v1 = this.connectionOfIndex( ast, sideTo,   q);
    var offset0 = this.offsetOfIndex( ast, sideFrom, p);
    var offset1 = this.offsetOfIndex( ast, sideTo,   p);
    // if v, it's a 3 way join.
    if( v ){
      var blob = v0.add( offset0).blend( v1.add( offset1),t);
      return this.joinv( ctx, ast, v, offset, blob, null, color, true );
    }
    return this.joinv( ctx, ast, v0, offset0, v1, offset1, color, false );
  },
  drawWiggle( ctx, ast, pattern, v0, dv, color ){
    var bend = 0;
    var pass = 1;
    ctx.save();
    for( pass = 0;pass<2;pass++){
      ctx.beginPath();  
      ctx.strokeStyle = pass ? color :"#DDD";
      ctx.lineWidth = pass? 3:5;
      //ctx.moveTo( v0.x, v0.y );
      this.drawBarSequence( ctx, pattern, v0, dv, bend);
      //ctx.lineTo( v1.x, v1.y );
      ctx.stroke();
    }
    ctx.restore();
  },

  drawBarSequence( ctx, pattern, v0, dv, bend ){
    var vv0=v0;//.sub( dv.mul( this.twistySpacing) );
    var vv1=vv0.add( dv.mul(2));
    for(var i=0;i<pattern.length;i++){
      var ch = pattern.charAt( i );

      if( "[(".indexOf( ch )>=0) {
        vv0 = vv1.add( dv.mul(this.twistySpacing-4));
      } else if( ch == ")"){
        var wiggleCount = (vv1.x-vv0.x)*0.2;
        ctx.moveTo( vv0.x, vv0.y );
        drawWigglyLine( ctx, vv0, vv1, wiggleCount, bend );    
      } else if( ch == "]" ) {
        ctx.moveTo( vv0.x, vv0.y );
        drawWigglyLine( ctx, vv0, vv1, 0, bend );    
      } else {
        vv1 = vv1.add( dv.mul( this.twistySpacing));
      }

    }
  },
  setTwistySpacing(){
    this.twistySpacing = this.P.twistySpacing || 8;
  },
  getPermutations( token ){
    var perms = token.replace( /[\[\]()]/g,"");
    perms = this.getBars( perms );
    // If user misses out a perm, then we assume
    // conversion to default order.
    if( perms[0] == "")
      perms[0] = perms[1].split("").sort().join("");
    if( perms[1] == "")
      perms[1] = perms[0].split("").sort().join("");
    if( perms[2] == "")
      perms[2] = perms[3].split("").sort().join("");
    if( perms[3] == "")
      perms[3] = perms[2].split("").sort().join("");

    return perms;
  },
  getBars( token ){
    var perms = token.split("-");
    perms[0] = perms[0] || "";
    perms[1] = perms[1] || "";
    perms[2] = perms[2] || "";
    perms[3] = perms[3] || "";
    return perms;
  },
//------
  astOfTwisty(ast, node, tokens, i, len){
    i= this.P.astOfTokens( node, tokens, i, i+1);
    this.P.astLift( node );
    this.P.astAddEmpty( node, 1);
    return i;
  },
  measureTwisty( ctx, parent, ast, font ){
    this.setTwistySpacing();
    var perms = this.getPermutations( ast.subtree[0].token );
    var h = this.P.twistyHeight || 16;
    var l1 = Math.max(perms[0].length, perms[1].length);
    var l2 = Math.max(perms[2].length, perms[3].length);
    var mm = 24;
    l1 = Math.max( l1*this.twistySpacing, mm );
    l2 = Math.max( l2*this.twistySpacing, h );
    // possibly round up to next multiple of 24
    // 7 *8 up to 9 * 8
    // 5 *8 up to 6 * 8
    //if( l1 >= 40 )
    //  l1 = l1 + (23-(l1+23)%24);
    //if( l2 >= 40 )
    //  l2 = l2 + (23-(l2+23)%24);
    ast.box = new Box( l1,l2 );
    ast.xShift = 0;
    this.P.twistyHeight = 0;
    return ast.box;
  },
  measureTwisty_twistyc( ctx, parent, ast, font ){
    var box = this.measureTwisty( ctx, parent, ast, font );
    ast.xShift = 12;
    return ast.box;
  },
  positionTwisty( parent, ast, v){
    return ast.box.move( v );
  },
  outTwisty( ctx, ast, color){
    this.setTwistySpacing();
    this.P.mayOutHotBox( ctx, ast );
    // hotspots don't draw the text
    if( this.P.isHotspot ){
      return;
    }
    color = color || this.P.parent.twisty_color || "#111";
    this.outTwistyAst( ctx, ast, ast.subtree[0], color );
    //Twisty.outAst( ctx, ast, ast.subtree[0], color );
    this.P.outBox( ctx, ast.box);
  }, 
  outTwistyBus( ctx, ast, params, sideFrom, sideTo, color){
    var perms = this.getPermutations( params.token );
    var len1 = perms[sideFrom].length;
    var len2 = perms[sideTo].length;
    var i = len1
    while(i--){
      var ch = perms[sideFrom].substring(i,i+1);
      if( ("a">ch)||(ch>"z"))
        continue;
      var j = perms[sideTo].indexOf( ch );
      if( j>= 0 ){
        this.join( ctx, ast, sideFrom, sideTo, i-(len1-1)/2, j-(len2-1)/2, color || "#333");
      }
    }
  },
  outCrossbar(ctx, ast, params, side, color){
    var perms = this.getPermutations( params.token );
    var len  = perms[side].length;
    var sideFrom=(side<2)?2:0;
    var sideTo  =sideFrom+1;
    var len1 = perms[sideFrom].length;
    var len2 = perms[sideTo].length;
    var i = len
    while(i--){
      var ch = perms[side].substring(i,i+1);
      if( ("a">ch)||(ch>"z"))
        continue;
      var j = perms[sideFrom].indexOf( ch );
      var k = perms[sideTo].indexOf( ch );

      if( (j>=0) && (k>=0)){
        var v = this.connectionOfIndex( ast, side, i-(len-1)/2);
        var offset = this.offsetOfIndex( ast, side, i-(len-1)/2);
        //v = v.add(offset);
        var p = (len-1)? (i/(len-1)) :0.5;
        this.join( ctx, ast, sideFrom, sideTo, j-(len1-1)/2, k-(len2-1)/2, color, p, v, offset);

      }
    }
  },
  outCrossbars(ctx, ast, params, color){
    for( var i=2;i<4;i++)
      this.outCrossbar( ctx, ast, params, i, color);
  },
  outConnects(ctx, ast, params, color){
//    var bars = this.getBars( params.token );
    var perms = this.getPermutations( params.token );
    var len,len1,len2;
    for( var side=0;side<4;side++){
      len = perms[side].length;
      var sideOther = side ^1;
      var sideFrom  = (side>1) ?0:2;
      var sideTo    = sideFrom+1;
      len1 = perms[sideFrom].length;
      len2 = perms[sideTo].length;
      for(i=0;i<len;i++){
        var ch = perms[side].substring(i,i+1);
        if( ("a">ch)||(ch>"z"))
          continue;
        var t = perms[sideOther].indexOf( ch )+1;
        var j = perms[sideFrom].indexOf( ch )+1;
        var k = perms[sideTo].indexOf( ch )+1;
        // If has a partner, join to it..
        if( t ){
          if( side<sideOther );
          //this.join( ctx, ast, side, sideOther, i-(len1-1)/2, j-(len2-1)/2, color || "#333");          
        }
        // if the other is a pair, crossbar to it.
        else if( j && k ){
          var v = this.connectionOfIndex( ast, side, i-(len-1)/2);
          var offset = this.offsetOfIndex( ast, side, i-(len-1)/2);
          //v = v.add(offset);
          var p = (len-1)? (i/(len-1)) :0.5;
          j--;k--;
          // crossbar join...
          this.join( ctx, ast, sideFrom, sideTo, j-(len1-1)/2, k-(len2-1)/2, color, p, v, offset);
//          this.outCrossBar( ctx, ast, params, i, color );
        }
        else if(j){
          j--;
          this.join( ctx, ast, side, sideFrom, i-(len-1)/2, j-(len1-1)/2, color || "#333")
        }
        else if(k){
          k--;
          this.join( ctx, ast, side, sideTo,   i-(len-1)/2, k-(len2-1)/2, color || "#333")

        }
      }
    }
  },
  outWiggles( ctx, ast, params, color){
    var bars = this.getBars( params.token );
    for( var i=0;i<4;i++)
    {
      var v = this.middleOfSide( ast, i );
      var dv = this.directionOfSide( i );
      v = v.sub( dv.mul( (bars[i].length-1) * this.twistySpacing*0.5 ));
      this.drawWiggle( ctx, ast, bars[i], v, dv, color || "#333");
    }
  },
  outTwistyAst( ctx, ast, params, color){
    this.outTwistyBus( ctx, ast, params, 0, 1, color );
    this.outTwistyBus( ctx, ast, params, 2, 3, color );
    //this.outCrossbars( ctx, ast, params, color);
    this.outConnects(  ctx, ast, params, color);
    this.outWiggles(   ctx, ast, params, color);
  },
}

var Twisty = new Twisty();

function Frac(){
  return this;
}

Frac.prototype = {
  fns : "\\frac",
  name: "Frac",
  astOfFrac(ast, node, tokens, i, len){
    i=this.P.eatArgs( node, tokens, "numerator denominator", i );
    return i;
  },
  measureFrac( ctx, parent, ast ){
    var box = new Box();
    ast.box = box;
    if( !ast )
      return box;
    var tree = ast.subtree;

    var box1 = this.P.measureSubtree( ctx, parent, tree[0]);
    var box2 = this.P.measureSubtree( ctx, parent, tree[1]);
    // don't destroy the subtree boxes.
    box.addDown( box1 ).addDown( box2 ).addDown( new Box(0,7) );
    box.addRight( new Box(10,0));
    tree[1].box = box2.move( 0, 7+box1.height());

    //ast.box = box.expand( 5, 5 );
    ast.box = box;
    return box;
  },
  positionFrac( parent, ast, v){
    this.P.positionHAligned( parent, ast, v, 0.5 );
  },
  outFrac( ctx, ast, color ){
    var tree = ast.subtree;
    if( !tree )
      return;
    // output the bounding boxes for numerator and denominator
    this.P.outBox( ctx, tree[0].box );
    this.P.outBox( ctx, tree[1].box );
    var v = Vector2d( 
      ast.box.vecs[0].x+3, 
      tree[1].box.vecs[0].y-3.5);
    // output the content for numerator and denominator
    var color = color || this.P.parent.frac_color || "#111";
    this.P.outSubtree( ctx, tree[0], color );
    this.P.outSubtree( ctx, tree[1], color );
    // the horizontal bar
    this.P.outBar( ctx, ast.box.width()-6, v, color);
    this.P.outBox( ctx, ast.box);
  },

}

var Frac = new Frac();


function Stack(){
  return this;
}

Stack.prototype = {
  fns : "\\stack \\stack-left \\stack-right \\hstack \\paper-stack \\spaced-stack \\overlay",
  name: "Stack",
  astOfStack(ast, node, tokens, i, len){
    i= this.P.astOfTokens( node, tokens, i, i+1);
    this.P.astLift( node );
    this.P.astAddUndefined( node, 1);
    return i;
  },
  getProportion( tok ){
    var proportion = 0.5;
    if( tok == "\\stack" )
      proportion = 0.5;
    if( tok == "\\stack-left" )
      proportion = 0.0;
    if( tok == "\\stack-right" )
      proportion = 1.0;
    if( tok == "\\paper-stack" )
      proportion = 0.0;
    return proportion;
  },
  // measure a vertical stack...
  measureStack( ctx, parent, ast, extraSpacing ){
    extraSpacing = extraSpacing || 0;
    var box = new Box(0,-extraSpacing);
    ast.box = box;
    this.minWidth = 0;
    var tree = ast.subtree || [];
    var prev = null;
    for( var subtree of tree ){
      var box1 = this.P.measureSubtree( ctx, prev, subtree);
      // add in the space.
      box.addDown( 0, extraSpacing);
      var height = box.height();
      // placing the new box in our stack...
      box1.move( 0, height );
      // increasing the size of our box...
      box.addDown( box1 );
      prev = subtree;
    }
    //box.addDown( 0, extraSpacing);
    //ast.box = box.expand( 5, 5 );
    this.minWidth = 0;
    ast.box = box;
    return box;
  },
  measureStack_hstack( ctx, parent, ast, extraSpacing ){
    extraSpacing = extraSpacing || 0;
    var box = new Box(0,-extraSpacing);
    ast.box = box;
    this.minHeight = 0;
    var tree = ast.subtree || [];
    var prev = null;
    for( var subtree of tree ){
      var box1 = this.P.measureSubtree( ctx, prev, subtree);
      // add in the space.
      box.addRight( extraSpacing, 0);
      var width = box.width();
      // placing the new box in our stack...
      box1.move( width, 0 );
      // increasing the size of our box...
      box.addRight( box1 );
      prev = subtree;
    }
    box.addRight( extraSpacing, 0);
    //ast.box = box.expand( 5, 5 );
    this.minHeight = 0;
    ast.box = box;
    return box;
  },
  measureStack_spaced_stack( ctx, parent, ast, extraSpacing ){
    return this.measureStack( ctx, parent, ast, 5 );
  },  
  measureStack_paper_stack( ctx, parent, ast ){
    return this.measureStackStepped( ctx, parent, ast, 4 );
  },
  measureStack_overlay( ctx, parent, ast ){
    return this.measureStackStepped( ctx, parent, ast, 0 );
  },
  measureStackStepped( ctx, parent, ast, stagger ){
    var box = new Box();
    ast.box = box;
    this.minWidth = 0;
    var tree = ast.subtree || [];
    var prev = null;
    for( var subtree of tree ){
      // adding a box of something.
      var height = box.height();
      var box1 = this.P.measureSubtree( ctx, prev, subtree);
      box = box.merge2( box1 );
    }
    var l = (tree.length || 1)-1;
    ast.box.vecs[1]=ast.box.vecs[1].add( l*stagger, l*stagger);
    //ast.box = box.expand( 5, 5 );
    this.minWidth = 0;
    ast.box = box;
    return box;
  },
  // delta is how much to move successive items.
  positionStack( parent, ast, v, proportion, delta){
    ast.box.move( v );
    var vv = ast.box.vecs[0];
    delta = delta || Vector2d( 0,0);
    proportion = this.getProportion( ast.token );
    // these are stacked above each other...
    var tree = ast.subtree || [];
    var l = (tree.length || 1)-1;
    vv = vv.add( delta.mul( l ));
    for( var node of tree ){
      var spare = ast.box.width()-node.box.width();
      this.P.positionSubtree2( ast, node, vv.add( spare * proportion,0) );
      vv= vv.sub( delta );
    }
  },
  positionStack_hstack( parent, ast, v, proportion, delta){
    ast.box.move( v );
    var vv = ast.box.vecs[0];
    delta = delta || Vector2d( 0,0);
    proportion = this.getProportion( ast.token );
    // these are stacked above each other...
    var tree = ast.subtree || [];
    var l = (tree.length || 1)-1;
    vv = vv.add( delta.mul( l ));
    for( var node of tree ){
      var spare = ast.box.height()-node.box.height();
      this.P.positionSubtree2( ast, node, vv.add( 0, spare * proportion) );
      vv= vv.sub( delta );
    }
  },

  positionStack_paper_stack( parent, ast, v, proportion ){
    this.positionStack( parent, ast, v, 0, Vector2d( 4,4));
  },
//  positionStack_hstack( parent, ast, v, proportion){
//    return this.P.positionVAligned( parent, ast, v, 0.5);
//  },
  outStack( ctx, ast, color, proportion ){
    var tree = ast.subtree;
    if( !tree )
      return;

    proportion = this.getProportion( ast.token );
    this.P.alignFrac = proportion || 0;
    // output the content for each row...
    var color = color || this.P.parent.frac_color || "#111";
    for( var node of (tree || []) ){
      this.P.outSubtree( ctx, node, color );
      this.P.outBox( ctx, node );
    }
    this.P.alignFrac = 0;
    this.P.outBox( ctx, ast.box);
  },
}

function SupSub(){
  return this;
}

SupSub.prototype = {
  fns : "\\supsub \\surround",
  name: "SupSub",
  astOfSupSub(ast, node, tokens, i, len){
    i=this.P.eatArgs( node, tokens, "superscript subscript", i );
    return i;
  },
  astOfSupSub_surround(ast, node, tokens, i, len){
    if( !ast.subtree )
      return i;
    ast.subtree.pop();
    var oldNode = ast.subtree.pop();
    if( !node.subtree )
      node.subtree = [];    
    node.subtree.push( oldNode );
    ast.subtree.push( node );
    i=this.P.eatArgs( node, tokens, "over under left right corner", i );
    return i;
  },  
  // prev is usually named 'parent' here.
  measureSupSub( ctx, prev, ast ){
    var box = new Box();
    ast.box = box;
    if( !ast )
      return box;
    var tree = ast.subtree;
    FontHandler.pushFont(10);
    var box1 = this.P.measureSubtree( ctx, prev, tree[0]);
    var box2 = this.P.measureSubtree( ctx, prev, tree[1]);
    FontHandler.popFont();
    // don't destroy the subtree boxes.
    box.addDown( box1 ).addDown( box2 );
    //ast.box = box.expand( 5, 5 );
    //The super and sub scripts add half their combined 
    // height to the height of the previous box.
    if( prev )
      box.vecs[1].y = box.vecs[1].y/2 + prev.box.vecs[1].y;
    ast.box = box;
    return box;
  },
  measureSupSub_surround( ctx, prev, ast ){
    var box = new Box();
    ast.box = box;
    if( !ast )
      return box;
    var tree = ast.subtree;
    var box0 = this.P.measureSubtree( ctx, prev, tree[0]);
    FontHandler.pushFont(10);
    var box1 = this.P.measureSubtree( ctx, prev, tree[1]);
    var box2 = this.P.measureSubtree( ctx, prev, tree[2]);
    var box3 = this.P.measureSubtree( ctx, prev, tree[3]);
    var box4 = this.P.measureSubtree( ctx, prev, tree[4]);
    var box5 = this.P.measureSubtree( ctx, prev, tree[5]);
    FontHandler.popFont();

    // box for the main panel
    box.addBox( box0 );
    // surrounding boxes.
    box.addDown( box1 ).addDown( box2 );
    box.addRight( box3 ).addRight( box4 );

    ast.box = box;
    return box;
  },
  positionSupSub( parent, ast, v){
    ast.box.move( v );
    var vv = ast.box.vecs[0];
    // these are stacked above each other...
    for( var i in ast.subtree ) {
      var node = ast.subtree[i];
      var spare = ast.box.height()-node.box.height();
      // subscripts at evenly spaced heights...
      // If we had more than 2, they'd be correctly spread.
      spare = (spare *i)/(ast.subtree.length-1);
      this.P.positionSubtree( ast, node, vv.add( 0,spare));
    }
  },  
  positionSupSub_surround( parent, ast, v){
    ast.box.move( v );
    var vv = ast.box.vecs[0];
    // these are stacked above each other...
    var tree = ast.subtree;
    var vAll = ast.box.diagonal();
    var v0   = tree[0].box.vecs[1];
    var v1   = tree[1].box.vecs[1];
    var v2   = tree[2].box.vecs[1];
    var v3   = tree[3].box.vecs[1];
    var v4   = tree[4].box.vecs[1];
    var v5   = tree[5].box.vecs[1];

    // center panel
    var dv0 = vv.add( v3.x, v1.y);
    // above below left right
    var dv1 = vv.add( v3.x+(v0.x-v1.x)/2, 0);
    var dv2 = vv.add( v3.x+(v0.x-v2.x)/2, vAll.y-v2.y);
    var dv3 = vv.add( 0,             v1.y+(v0.y-v3.y)/2);
    var dv4 = vv.add( vAll.x-v4.x,   v1.y+(v0.y-v4.y)/2);
    var dv5 = dv0.add(v0.x-v5.x,     v0.y-v5.y);

    this.P.positionSubtree( ast, tree[0], dv0);
    this.P.positionSubtree( ast, tree[1], dv1);
    this.P.positionSubtree( ast, tree[2], dv2);
    this.P.positionSubtree( ast, tree[3], dv3);
    this.P.positionSubtree( ast, tree[4], dv4);
    this.P.positionSubtree( ast, tree[5], dv5);
  }, 

  outSupSub( ctx, ast, color ){
    var tree = ast.subtree;
    FontHandler.pushFont(10);
    for( var i in tree ){
      this.P.outSubtree( ctx, tree[i], color);
    }
    FontHandler.popFont();
    this.P.outBox( ctx, ast.box );
  }, 
}

var SupSub = new SupSub();

// helper functions...
// For eaach key, a string value.
function stringDictOfString( items ){
  var dict = {};
  for( var i=0;i<items.length;i+=2){
    dict[ items[i+1]]=items[i];
  }
  return dict;
}
// For each key, a numerical value.
function numberDictOfString( items ){
  var dict = {};
  for( var i=0;i<items.length;i+=2){
    dict[ items[i+1]]=Number(items[i]);
  }
  return dict;
}


function Symbol(){
  var SymStr = "^ \\hat § \\S ¯ \\bar ± \\pm µ \\mu × \\mply × \\times ÷ \\div ı \\imath ȷ \\jmat ˙ \\dot Γ \\Gamma Δ \\Delta Θ \\Theta Λ \\Lambda Ξ \\Xi Π \\Pi Σ \\Sigma Υ \\Upsilon Φ \\Phi Ψ \\Psi Ω \\Omega α \\alpha β \\beta γ \\gamma δ \\delta ε \\varepsilon ζ \\zeta η \\eta θ \\theta ι \\iota κ \\kappa λ \\lambda μ \\mu ν \\nu ξ \\xi π \\pi ρ \\rho ς \\varsigma σ \\sigma τ \\tau υ \\upsilon φ \\phi φ \\varphi χ \\chi ψ \\psi ω \\omega ϑ \\vartheta ϕ \\phi ϖ \\varpi ϱ \\varrho ϵ \\epsilon Ω \\Omega → \\rightarrow ⇒ \\Rightarrow ∀ \\forall ∂ \\partial ∃ \\exists ∅ \\varnothing ∇ \\nabla ∈ \\in ∓ \\mp ∗ \\ast ∝ \\propto ∞ \\infty ∠ \\angle ∣ \\mid ∥ \\parallel ∧ \\wedge ∨ \\vee ∩ \\cap ∪ \\cup ∴ \\therefore ∵ \\because ∼ \\sim ≅ \\cong ≈ \\approx ≠ \\neq ≡ \\equiv ≤ \\leq ≥ \\geq ≺ \\prec ≻ \\succ ⊂ \\subset ⊆ \\subseteq ⊕ \\oplus ⊗ \\otimes ⊥ \\bot ⊥ \\perp ⋅ \\cdot ⋅⋅⋅ \\cdots ... \\ellipsis ◦ \\circ ⪯ \\preceq ⪰ \\succeq ( \\left( ) \\right) [ \\left[ ] \\right] { \\left{ } \\right} ⇌ \\chemequal ⇋ \\chemequal2 - - + + = = \\ \\slash { \\left-brace } \\right-brace";

  SymStr += " ∫ \\int ∬ \\iint ∭ \\iiint ∫⋅⋅⋅∫ \\idotsint ∮ \\oint ∯ \\ooint ∰ \\oooint √ \\sqrt";

  SymStr += " ⊙ \\odot ⊚ \\ocirc ⊛ \\ostar ⏺ \\ofull ☀ \\oglow ⚙ \\ocog ◯ \\oempty ⎈ \\ships-wheel ▲ \\tupfull △ \\tupempty ▼ \\tdownfull ▽ \\tdownempty ◼ \\sqfull ◻ \\sqempty";

// Symbols for the future...
// extra integrals...
//"∱ ∲ ∳ ⨌ ⨍ ⨎ ⨏ ⨐ ⨑ ⨒ ⨓ ⨔ ⨕ ⨖ ⨗ ⨘ ⨙ ⨚ ⨛ ⨜"

// "+ − ± ∓ ÷ ∗ ∙ × ∑ ⨊ ⅀ ∏ ∐ ∔ ∸ ≂ ⊕ ⊖ ⊗ ⊘ ⊙ ⊚ ⊛ ⊝ ⊞ ⊟ ⊠ ⊡ ⋄ ⋇ ⋆ ⋋ ⋌ ~ ⩱ ⩲ Δ ∞ ∃ ∄ | ∤ ‱ ∇ ∘ ∻ ∽ ∾ ∿ ≀ ≁ ≬ ⊏ ⊐ ⊑ ⊒ ⋢ ⋣ ⊓ ⊔ ⊶ ⊷ ⊸ ⊹ ⊺ ⋈ ⋉ ⋊ ⋮ ⋯ ⋰ ⋱ ⌈ ⌉ ⌊ ⌋ 〈 〉 ⊲ ⊳ ⊴ ⊵ ⋪ ⋫ ⋬ ⋭ ≠ ≈ ≂ ≃ ≄ ⋍ ≅ ≆ ≇ ≉ ≊ ≋ ≌ ≍ ≎ ≏ ≐ ≑ ≒ ≓ ≔ ≕ ≖ ≗ ≙ ≚ ≜ ≟ ≡ ≢ ≭ ⋕ ^ ⁰ ¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹ ⁺ ⁻ ⁼ ⁽ ⁾ √ ∛ ∜ < > ≤ ≥ ≦ ≧ ≨ ≩ ≪ ≫ ≮ ≯ ≰ ≱ ≲ ≳ ≴ ≵ ≶ ≷ ≸ ≹ ≺ ≻ ≼ ≽ ≾ ≿ ⊀ ⊁ ⊰ ⋖ ⋗ ⋘ ⋙ ⋚ ⋛ ⋞ ⋟ ⋠ ⋡ ⋦ ⋧ ⋨ ⋩"


// Extra brackets.
// "( ) { } [ ] ⎛ ⎜ ⎝ ⎞ ⎟ ⎠ ⎡ ⎢ ⎣ ⎤ ⎥ ⎦ ⎧ ⎨ ⎩ ⎫ ⎬ ⎭ ⎪ ⎰ ⎱ 〉 ❪ ❫ ❬ ❭ ❰ ❱ ❲ ❳ ❴ ❵ ⟦ ⟧ ⟨ ⟩ ⟮ ⟯ ⦃ ⦄ ⦅ ⦆ ⦗ ⦘ ⧼ ⧽ ⸨ ⸩ ❮ ❯ ⟪ ⟫ ⦇ ⦈ ⦉ ⦊ ⌈ ⌉ ⌊ ⌋ 「 」 『 』 〈 〉 【 】 《 》 〔 〕 〖 〗 〚 〛 ﴾ ﴿ ⁅ ⁆ ⦑ ⦒ ⦋ ⦌ ⦍ ⦎ ⦏ ⦐ ⏜ ⏝ ⏞ ⏟ ⎴ ⎵ ⏠ ⏡ ⎶ ︵ ︶ ︗ ︘ ︷ ︸ ︹ ︺ ︿ ﹀ ﹁ ﹂ ﹇ ﹈ ︻ ︼ ︽ ︾ ﹃";


  SymStr += " ☠ \\poison ☢ \\radioactive ☣ \\biohazard";
  SymStr += " 🧬 \\dna";
  SymStr += " ♜ \\rook ♞ \\knight ♝ \\bishop ♛ \\queen ♚ \\king ♟︎ \\pawn";
  SymStr += " ♖ \\rookw ♘ \\knightw ♗ \\bishopw ♕ \\queenw ♔ \\kingw ♙ \\pawnw";
  SymStr = SymStr.split(" ");
    

  // The \ character should give a space.
  SymStr.push( " ");
  SymStr.push( "\\");

  this.JatexDict = stringDictOfString( SymStr );

  var opNames = "\\times + - = \\sim \\cong \\approx \\neq \\equiv \\leq \\geq \\prec \\succ \\subset \\subseteq \\oplus \\otimes \\preqeq \\succeq \\chemequal \\int \\iint \\iiint \\idotsint \\oint".split(" ");

  for( var tok of opNames)
    this.JatexDict[ tok ] = " " + this.JatexDict[ tok ] + " ";

//  var foo = Object.keys( this.JatexDict );//.join( " ");
//  console.log( foo) ;

  return this;
}

Symbol.prototype = {
  fns : "",
  name: "Symbol",
  astOfSymbol(ast, node, tokens, i, len){
    i++;
    return i;
  },
  outSymbol( ctx, ast, color, proportion ){
  },
}

var Symbol = new Symbol();

function Tile(){
  // add in a flip for each unflipped.
  this.fns = this.fns + " "+this.fns.split(" ").join("-flip ");
  this.fns += " \\box \\low-box \\tile"
  return this;
}

Tile.prototype = {
  fns : "\\round \\chevron \\straight \\forward \\backward \\arrow-head \\arrow-tail \\snake-head \\snake-tail \\cold-front \\warm-front \\zigzag \\zagzig \\sway \\antisway",
  name: "Tile",
  labelEndOfToken( tok ){
    var end = tok.substring(1).replace( "-","_");
    end = end.replace( "backward", "forward_flip");
    end = end.replace( "_flip_flip", "");
    end = end.replace( "_flip", "Flip");
    return end;
  },
  astMayGobbleClosingEnd( node, tokens, i ){
    i=this.P.skipBlanks(tokens,i);
    var tok = tokens[ i ] || "";
    if( this.P.fns[ tok ] == this ){
      node.endShape2 = this.labelEndOfToken( tok );
      i+=4;
    }
    return i;
  },
  astOfTile(ast, node, tokens, i, len){
    var tok = node.token;

    node.endShape1 = this.labelEndOfToken( tok );
    node.endShape2 = "chevron";
    // optionally match a colour
    i = this.P.astMayEatColour( node, tokens, i );
    i = this.P.astOfTokens( node, tokens, i, i+1);
    // Gobble an ending token.
    i = this.astMayGobbleClosingEnd( node, tokens, i );
    this.P.astAddUndefined( node, 1);
    return i;
  },
  astOfTile_tile(ast, node, tokens, i, len){
    var tok = node.token;
    // if not enough args, go use the standard ones..
    i = this.P.astMayEatColour( node, tokens, i );
    i = this.P.getSimpleArg( node, tokens, 'endShape1', 'chevron', i);
    i = this.P.getSimpleArg( node, tokens, 'endShape2', 'chevron', i);
    i = this.P.eatArgs( node, tokens, "contents", i );
    return i;
  },
  astOfTile_box(ast, node, tokens, i, len){
    i = this.P.astMayEatSize( node, tokens, i);
    i = this.P.astMayEatColour( node, tokens, i );
    // optionally match a colour
    //i = this.P.astMayEatNumber1( node, tokens, i );
    //i = this.P.astMayEatNumber2( node, tokens, i );
    node.endShape1 = "straight";
    node.endShape2 = "straight";
    return i;
  },
  astOfTile_low_box(ast, node, tokens, i, len){
    return this.astOfTile_box(ast, node, tokens, i, len);
  },
  measureTile( ctx, parent, ast, font ){
    var box1 = this.P.measureSubtree( ctx, ast, ast.subtree[0]);
    ast.box.addRight( new Box(10,0));    
    ast.box = ast.box.addRight( box1 );
    return ast.box;
  },
  measureTile_box( ctx, parent, ast, font ){
    ast.box = new Box( 35,35);
    if( ast.hasSizing ){
      ast.box = new Box( ast.hasSizing );
    }
    return ast.box;
  },
  measureTile_low_box( ctx, parent, ast, font ){
    ast.box = new Box( 35,10);
    return ast.box;
  },
  // same as position Frac. Move to JaTeX?
  positionTile( parent, ast, v){
    ast.box.move( v );
    var vv = ast.box.vecs[0];
    // these are stacked above each other...
    for( var node of (ast.subtree || []) ){
      var spare = ast.box.width()-node.box.width();
      this.P.positionSubtree( parent, node, vv.add( spare/2,0) );
    }
    if( ast.jref )
      this.P.mayPositionJref( ast.jref, ast.box );
  },
  outTile( ctx, ast, color){
    color = "#000";

    var adjust1 = 0;
    var adjust2 = 0;
    if( ["round","chevron"].indexOf( ast.endShape1) >=0 )
      adjust1 = 8;
    if( ["roundFlip","chevronFlip"].indexOf( ast.endShape2) >=0 )
      adjust2 = 8;
    var va = ast.box.vecs[0].add( adjust1,0);
    var vc = ast.box.vecs[1].add( adjust2,0);
    var vb = new Vector2d( va.x, vc.y );
    var vd = new Vector2d( vc.x, va.y );

    var style = { outline:"#AAAA33", fill: "#eee", width:4 };
    if( ast.colour ){
      style.fill = ast.colour;
      // prefer black as a colour.
      // ignore blue for working out complementary colour...
      if( (Number( ast.colour.substring(1,2)) <=7) ||
          (Number( ast.colour.substring(2,3)) <=9) 
        )
        color = "#fff";
    }

    var isJref =  this.P.parent.shade_jrefs != 'n';
    isJref = this.P.mayPositionJref( ast.jref, ast.box ) && isJref;
    var isHot  = this.P.isHotspot;
    if( isHot )
    {
      color = this.P.hotColourOfAtom( ast.jref || 0 );      
      style = { fill: color };
    }
    else if( isJref  ){
      style = { fill: "#0002" };
    }

    drawScorpioLabel( ctx, ast, style, va, vd, vc, vb );
    if( !isHot && ast.subtree && ast.subtree[0])
      this.P.outSubtree( ctx, ast.subtree[0], color);
    this.P.outBox( ctx, ast.box);
  },  
}

var Tile = new Tile();

function FontHandler(){
  this.FontStack = [];
  // KaTeX_Main is installed on my system, but probably should be
  // using KaTeX_Math - and fix the font loader.
  this.FontList = [
    // style,   font,         px size, height, baseline adjust
    [ "italic",       "KaTeX_Main", 20,      20,     4 ],
    [ "",       "KaTeX_Main", 50,      44,     5 ],
    [ "",       "KaTeX_AMS",  48,      44,     5 ],
    [ "italic", "KaTeX_Main", 15,      15,     4 ],
    [ "bold",   "KaTeX_Main", 20,      20,     4 ],
    [ "",       "KaTeX_Size3",20,      50,     20 ],
    [ "",       "KaTeX_Main",  8,       9,     3 ],
    [ "",       "Courier",    16,      16,     4 ],
    [ "",       "KaTeX_Main", 14,      14,     3 ],
    [ "",       "KaTeX_Size4",20,      80,     35 ],
    [ "italic", "KaTeX_Main", 11,      11,     2 ],
    [ "",       "KaTeX_Main", 15,      15,     4 ],
    ];
  this.font = this.FontList[0];
  // We allow many to one for font names to fonts.
  // The superscript and subscript operations count as font changes.
  this.fontNames = numberDictOfString( 
    "0 \\mathital 1 \\mathbig 2 \\mathbb 3 \\mathitalsmall 4 \\mathbf 5 \\mathsize3 6 \\tiny 7 \\kbd 8 \\mbox 9 \\huge 10 \\mathitaltiny 11 \\invert 3 ^ 3 _".split(" "));
  this.FontAdjust = numberDictOfString( "1 \\Sigma 1 \\Pi 1 \\A 1 \\Z 5 \\left( 5 \\right) 5 \\left[ 5 \\right] 9 \\left{ 9 \\right} 4 \\sqrt".split(" ") );
  this.fns = Object.keys( this.fontNames ).join( " ");
  this.fontRecord("\\invert").fx = "Invert"
  this.fontRecord("\\mathitaltiny").colour = "#950";
  return this;
}

FontHandler.prototype = {
  fns : "",
  name: "FontHandler",

// dynamic font loading and naming is done by KaTeX, so
// no need for us to do it.
//  const font = new FontFace('KATEXI', 
//"url(https://fonts.gstatic.com/s/bitter/v7/HEpP8tJXlWaYHimsnXgfCOvvDin1pK8aKteLpeZ5c0A.woff2)"
//'url(./katex/fonts/KaTeX_Main-italic.woff)', { style: italic', weight: '400' }
//  );
//
//  document.fonts.add( font );
//  font.load().then(() => {
//    //alert( font.family + " loaded just fine");
//    // Resolved - add font to document.fonts
//    },
//  (err) => {
//    alert(err + " loading a font");
//  });

  reset(){
    this.FontStack=[];
  },
  setFontForToken( ctx, token ){
    var font = this.topFont();
    var fontAdjust = this.FontAdjust[token ] || 0;
    if( fontAdjust != 0)
      font = fontAdjust;

    font = this.FontList[font];
    var matches = token.match( /^[a-z A-Z0-9\(\)\,\+\-]*$/ );
    // some symbols are better italic..
    matches = matches || (["\\rho","\\pi"].indexOf( token ) >= 0 );
    //matches = false;
    var fontString = (matches ? font[0]:"") + " " + font[2]+"px "+font[1]; // font and size.
    var avail = document.fonts.check( fontString )
    if( !avail )
      console.log( fontString + (avail ? " present":" absent"));
    ctx.font = fontString;
    this.font = font;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  },
  getFontHeight(){
    return this.font[3];
  },
  getFontOffset(){
    return this.font[3]-this.font[4];
  },
  topFont(){
    var l = this.FontStack.length;
    return l ? this.FontStack[l-1] : 0;
  },
  fontNumber( font ){
    if( isNaN( font ))
      font = (this.fontNames[ font ] || 0);
    return font;
  },
  fontRecord( font ){
    return this.FontList[ this.fontNumber( font ) ];
  },
  pushFont( font ){
    font = this.fontNumber( font );
    this.FontStack.push( font );
  },
  popFont(){
    var l = this.FontStack.length;
    if( l )
      this.FontStack.pop();
  },
  // font handler applies to the next token only.
  astOfFontHandler(ast, node, tokens, i, len){
    i= this.P.astMayEatColour(node, tokens, i);
    i= this.P.astOfTokens( node, tokens, i, i+1);
    this.P.astAddUndefined( node, 1);
    return i;
  },
  measureFontHandler( ctx, parent, ast ){
    this.pushFont(ast.token );
    var box1 = this.P.measureSubtree( ctx, ast, ast.subtree[0]);
    ast.box = ast.box.addRight( box1 );
    this.popFont();
    return ast.box;
  },
  positionFontHandler( parent, ast, v){
    this.P.positionHAligned( parent, ast, v, 0.5);
  },
  outFontHandler( ctx, ast, colour ){
    this.pushFont(ast.token);
    var font = this.fontRecord( this.topFont());
    if( font.fx){
      ctx.save();
      ctx.filter = 'invert(1)';
      ctx.globalCompositeOperation='difference';
      // difference to f8f for a contrasting color.
      // Worst contrast is against #848 (dark purple)
      this.P.outSubtree( ctx, ast.subtree[0], "#f8f");
      ctx.restore();
    }
    else
      this.P.outSubtree( ctx, ast.subtree[0], ast.colour || font.colour || colour);
    this.popFont();
  },
}

var FontHandler = new FontHandler();


function Settings(){
  return this;
}

Settings.prototype = {
  fns : "\\min-width \\min-height \\twisty-spacing \\twisty-height \\align-frac",
  name: "Settings",
  endName( token ){
    return token.split( "-" ).pop();
  },
  settingName( token ){
    str = token.toLowerCase().replace(/\-[a-z]/g, function(letter) {
    return letter.substring(1).toUpperCase();
});
    str = str.replace( "\\", "");
    return str;
  },
  // eats one arg, the numerical size.
  astOfSettings(ast, node, tokens, i, len){
    i = this.P.eatArgs( node, tokens, this.endName( node.token ), i );
    return i;
  },
  setSetting( ast ){
    var setting = this.settingName( ast.token );
    this.P[ setting ]  = Number( ast.subtree[0].token );
  },
  measureSettings( ctx, parent, ast ){
    this.setSetting( ast );
    return ast.box;
  },
  positionSettings( parent, ast, v){
    this.setSetting( ast );
    ast.box.move( v );
  },
  outSettings( ctx, ast, color, proportion ){
    this.setSetting( ast );
  },
}

var Settings = new Settings();



function SvgSymbols(){
  return this;
}

SvgSymbols.prototype = {
  fns : "\\transistor \\resistor \\capacitor \\battery",
  name: "SvgSymbols",
  astOfSvgSymbols(ast, node, tokens, i, len){
    return i;
  },
  measureSvgSymbols( ctx, prev, ast ){
    var box = new Box(72,48);// 9x6 in 8x8 units.
    ast.box = box;
    return box;
  },
  measureSvgSymbols_capacitor( ctx, prev, ast ){
    var box = new Box(48,48);// 6x6 in 8x8 units.
    ast.box = box;
    return box;
  },
  positionSvgSymbols( parent, ast, v){
    ast.box.move( v );
  },
  outSvgSymbols_battery( ctx, ast, color )  {
    return this.outSvgSymbols_capacitor( ctx, ast, color, true);
  },
  outSvgSymbols_capacitor( ctx, ast, color, battery ){
    // hotspots don't draw the ruler markings...
    if( this.P.mayOutHotBox( ctx, ast ))
      return;

    var v = ast.box.vecs[0];
    var dv = ast.box.diagonal();
    var delta = battery ? 30 : 9;
    var nBars = 2;
    var barHeight = 14;
    var indent = (dv.x - (nBars-1) * delta)*0.5;

    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 3.0;
    ctx.strokeStyle = color || "#000";

    //ctx.beginPath();
    ctx.moveTo( v.x, v.y+dv.y/2)
    ctx.lineTo( v.x+indent, v.y+dv.y/2);
    ctx.moveTo( v.x+dv.x-indent, v.y+dv.y/2);
    ctx.lineTo( v.x+dv.x,        v.y+dv.y/2);
    ctx.stroke();

    var adj = 0;
    if( battery ){

      adj = 7;
      delta -= adj/(nBars-1);     
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      for( var i = 0;i<nBars;i++ ){
        ctx.moveTo( v.x+indent + adj + i*delta, v.y+dv.y/2-barHeight-adj);
        ctx.lineTo( v.x+indent + adj + i*delta, v.y+dv.y/2+barHeight+adj);
      }
      ctx.stroke();

      ctx.save();
      //adj = 0;
      ctx.lineWidth = 3.0;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo( v.x     +indent + adj, v.y+dv.y/2);
      ctx.lineTo( v.x+dv.x-indent - adj, v.y+dv.y/2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.beginPath();
    ctx.lineWidth = 5.0;
    for( var i = 0;i<nBars;i++ ){
      ctx.moveTo( v.x+indent + i*delta, v.y+dv.y/2-barHeight);
      ctx.lineTo( v.x+indent + i*delta, v.y+dv.y/2+barHeight);
    }
    ctx.stroke();

    ctx.restore();
    this.P.outBox( ctx, ast.box );

  },
  outSvgSymbols_resistor( ctx, ast, color ){
    // hotspots don't draw the ruler markings...
    if( this.P.mayOutHotBox( ctx, ast ))
      return;

    var v = ast.box.vecs[0];
    var dv = ast.box.diagonal();
    var indent = 14;
    var nPoints = 6;
    var len = dv.x - 2*indent;
    var delta = len / nPoints;

    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 3.0;
    ctx.strokeStyle = color || "#000";

    //ctx.beginPath();
    ctx.moveTo( v.x, v.y+dv.y/2)
    ctx.lineTo( v.x+indent, v.y+dv.y/2);
    for( var i = 0;i<nPoints;i++ )
      ctx.lineTo( v.x+indent + (i+0.5)*delta, v.y+dv.y/2+
        (i%2-0.5)*delta*2.6);
    ctx.lineTo( v.x+dv.x-indent, v.y+dv.y/2);
    ctx.lineTo( v.x+dv.x,        v.y+dv.y/2);
    ctx.stroke();
    ctx.restore();
    this.P.outBox( ctx, ast.box );
  },
  // Does transistor....
  outSvgSymbols( ctx, ast, color ){
    // hotspots don't draw the ruler markings...
    if( this.P.mayOutHotBox( ctx, ast ))
      return;

    var v = ast.box.vecs[0];
    var dv = ast.box.diagonal();
    var r = dv.y *0.45;
    v = v.add( 12,0);
    var base = v.x + dv.y*0.35;

    ctx.save();
    ctx.beginPath();
    // Outer circle...
    ctx.fillStyle = "#ccc";
    ctx.lineWidth = 3.0;
    ctx.strokeStyle = color || "#000";
    ctx.arc(v.x+dv.y/2, v.y + dv.y/2, r, 0, 2*Math.PI);
    ctx.fill();

    //ctx.beginPath();
    // top to base
    ctx.moveTo( v.x+dv.x/2, v.y)
    ctx.lineTo( v.x+dv.x/2, v.y+dv.y*0.1);
    ctx.lineTo( base, v.y + dv.y *0.4);
    // base to bottom
    ctx.moveTo( base, v.y + dv.y *0.6);
    ctx.lineTo( v.x+dv.x/2, v.y+dv.y*0.9);
    ctx.lineTo( v.x+dv.x/2, v.y+dv.y)
    // base to left edge
    v = v.sub( 12,0);
    ctx.moveTo( base, v.y+dv.y/2);
    ctx.lineTo( v.x,  v.y+dv.y/2);
    ctx.stroke();

    // and now the base itself (thicker).
    ctx.beginPath();
    ctx.lineWidth = 5.0;
    ctx.moveTo( base, v.y + dv.y *0.25);
    ctx.lineTo( base, v.y + dv.y *0.75);
    ctx.stroke();
    ctx.restore();
    this.P.outBox( ctx, ast.box );
  },
}

var SvgSymbols = new SvgSymbols();


var Stack = new Stack();


function Transform(){
  return this;
}

Transform.prototype = {
  fns : "\\identity \\rot90 \\rot180 \\rot270 \\flip \\fliph \\flipminor \\flipv \\transform",
  //       i               flip  min    h    v flip
  theta: [ 0, 90, 180, 270,   0,  90, 180, 270,   0],
  corner:[ 0,  1,   2,   3,   0,   3,   2,   1,   0],
  name: "Transform",
  astOfTransform(ast, node, tokens, i, len){
    i=this.P.eatArgs( node, tokens, "sub-diagram", i );
    return i;
  },
  transformIndex( token ){
    return this.fns.split(" ").indexOf( token);
  },
  transformVec( token, v){
    //return Vector2d( v.y, v.x );
    var ix = this.transformIndex( token );
    var theta = (this.theta[ ix ])*Math.PI/180;
    var result = Vector2d(
       Math.cos(theta)*v.x + Math.sin(theta)*v.y, 
       -Math.sin(theta)*v.x + Math.cos(theta)*v.y
       );
    if( ix >= 4 )
      result = Vector2d( result.y, result.x);
    return result;
  },
  measureTransform( ctx, parent, ast ){
    var box = new Box();
    ast.box = box;
    if( !ast )
      return box;
    var tree = ast.subtree;
    var box1 = this.P.measureSubtree( ctx, parent, tree[0]);
    var v = box1.vecs[1];
    // box is flip of what it was given...
    // compute dimensions of resulting box
    var ix = this.transformIndex( ast.token );
    var flips = (this.theta[ix] % 180) > 0;
    if( ix >= 4 )
      flips = !flips;
    if( flips )
      box.vecs[1]=Vector2d( v.y, v.x);
    else 
      box.vecs[1]=Vector2d( v.x, v.y);
    return box;
  },
  positionTransform( parent, ast, v){
    ast.box.move( v );
    this.P.positionVAligned( parent, ast, Vector2d(0,0), 0);
    // subsequent items are aligned by the caller..
  },
  outTransform( ctx, ast, color, proportion ){
    if( this.P.mayOutHotBox( ctx, ast ))
      return;
    var tree = ast.subtree;
    ctx.save();

    var token = ast.token;
    var v  = ast.box.vecs[0];
    var vo = ast.box.vecs[1];
    var targets = [ v, Vector2d( v.x, vo.y), vo, Vector2d(vo.x, v.y) ];
    var ix = this.transformIndex( token );

    // Where do we want the top left corner to end up?
    var targ = targets[ this.corner[ix]];

    var v1 = this.transformVec( token, Vector2d(1,0));
    var v2 = this.transformVec( token, Vector2d(0,1));
    var vn = this.transformVec( token, v);
    var vadj = targ.sub( vn );
    ctx.transform( v1.x, v1.y, v2.x, v2.y , vadj.x , vadj.y );
    this.P.outSubtree(ctx,tree[0], color )
    ctx.restore();
    this.P.outBox( ctx, ast.box );
  },
}

var Transform = new Transform();


function Macro(){
  this.LetterCode = {};
  this.LetterCode[',']="} {"
  this.LetterCode['-']="{ \\  }"
  this.LetterCode['1']="{ 1  }"
  this.LetterCode['.']="{ \\cdot }"
  this.LetterCode['w']="{ \\straight \\ \\straight }"
  this.LetterCode['r']="{ \\straight #e88 \\ \\straight }"
  this.LetterCode['g']="{ \\straight #8e8 \\ \\straight }"
  this.LetterCode['b']="{ \\straight #88e \\ \\straight }"
  this.LetterCode['4']="{ \\straight #444 \\ \\straight }"
  this.LetterCode['8']="{ \\straight #888 \\ \\straight }"
  this.LetterCode['c']="{ \\straight #ccc \\ \\straight }"
  this.LetterCode['M']="{\\ \\round #e88 \\ \\round \\\\}"
  this.LetterCode['N']="{\\ \\round #8e8 \\ \\round \\\\}"
  this.LetterCode['O']="{\\ \\round #88e \\ \\round \\\\}"
  this.LetterCode['P']="{\\ \\round \\ \\round \\\\}"
  return this;
}

Macro.prototype = {
  fns : "\\macro \\sup \\sub \\mul \\grid \\id1 \\id2 \\id3 \\id4 \\left \\right \\tensor-sensor1 \\tensor-sensor2 \\tensor-sensor3 \\ReLU \\dynamic-conv",
  name: "Macro",
  //id1 to id4 do absolutely nothing.
  //they are used to leave a mark in the input string,
  //making it easier to capture a specific jref
  astOfMacro_id1(ast, node, tokens, i, len){
    ast.subtree.pop();return i;},
  astOfMacro_id2(ast, node, tokens, i, len){
    ast.subtree.pop();return i;},
  astOfMacro_id3(ast, node, tokens, i, len){
    ast.subtree.pop();return i;},
  astOfMacro_id4(ast, node, tokens, i, len){
    ast.subtree.pop();return i;},
  astOfMacro(ast, node, tokens, i, len){
    node.token = "<Macro>"
    return i;
  },
  astOfMacro_ReLU(ast, node, tokens, i, len){
    var newStr = "\\overlay {{\\\\shalf-graph 0=0= \\shalf-graph 0/0.5/} \\stack { \\ ReLU}}";
    this.addNewTokens( newStr, node, tokens[i-1]);
    return i;
  },
  astOfMacro_dynamic_conv(ast, node, tokens, i, len){
    var newStr =
 "\\paper-stack {\\box 65x33 #cce \\box 65x33 #cce \\overlay { \\box 65x33 #cce  \\mathitaltiny\\stack{ \\forward   #aae {\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\}  \\backward \\straight   #aae{\\mathitaltiny hid } \\straight  \\backward   #aae{\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ } \\forward }}} \\surround {K\\mply K\\mply C} {K\\mply K\\mply C} {} {} N"
    this.addNewTokens( newStr, node, tokens[i-1]);

    var surrounder = node.subtree[0].subtree;
    var topPaper = node.subtree[0].subtree[0].subtree[2];
    i=this.P.astMayEatColour(node, tokens, i);
    i=this.P.eatArgs( node, tokens, "top mid bot corner", i );
    surrounder[5] = node.subtree.pop();//top
    // want this under the \\rot90, so place in the subtree.
    //surrounder[3].subtree[0] = node.subtree.pop();//left
    //surrounder[4] = node.subtree.pop();
    surrounder[2] = node.subtree.pop();//right
    surrounder[0].subtree[2].subtree[1].subtree[0].subtree[1].subtree[0].subtree[0].subtree[0]=node.subtree.pop();
    surrounder[1] = node.subtree.pop();//right

    return i;
  },
  astOfMacro_grid(ast, node, tokens, i, len){
    var width = 2;
    //ast.subtree.pop();
    var ix=this.P.eatArgs( node, tokens, "arg", i );
    if( ix==i)
      return i;
    var str = node.subtree[0].token;
    var tokenStr = "{";
    for( var j=0;j<str.length;j++ ){
      var ch = str.substring( j, j+1);
      tokenStr = tokenStr + (this.LetterCode[ ch ] || "");
    }
    tokenStr += "}";
    var tokens2 = this.P.tokenise( tokenStr, tokens[i-1]);
    this.P.astOfTokens( node, tokens2, 0, tokens2.length ); 
    node.subtree.shift();   
    node.token = "\\stack"
    return ix;
  },
  astOfMacro_sub(ast, node, tokens, i, len){
    i=this.P.eatArgs( node, tokens, "subscript", i );
    node.token = "\\supsub";
    var dummy = {};
    dummy.token = "{";
    // push to start of array, rather than to end.
    node.subtree.unshift( dummy );
    return i;
  },
  astOfMacro_sup(ast, node, tokens, i, len){
    i=this.P.eatArgs( node, tokens, "superscript", i );
    node.token = "\\supsub";
    var dummy = {};
    dummy.token = "{";
    node.subtree.push( dummy );
    return i;
  },
  addNewTokens( tokenStr, node, at ){
    var tokens2 = this.P.tokenise( tokenStr, at);
    this.P.astOfTokens( node, tokens2, 0, tokens2.length ); 
    node.token = "{"
  },
  astOfMacro_tensor_sensor1(ast, node, tokens, i, len){
    var newStr = "\\low-box #ffb \\surround aaa \\rot90 {} 1 {} {}";
    i=this.P.astMayEatColour(node, tokens, i);
    this.addNewTokens( newStr, node, tokens[i-1]);
    var surrounder = node.subtree[0].subtree;
    var topPaper = node.subtree[0].subtree[0];
    i=this.P.eatArgs( node, tokens, "width", i );
    surrounder[1] = node.subtree.pop();
    if( node.colour ){
      topPaper.colour = node.colour;
    }
    return i;
  },
  astOfMacro_tensor_sensor2(ast, node, tokens, i, len){
    var newStr = "\\box #dfd \\surround aaa \\rot90 {} \\rot90 bbb {} {}";
    i=this.P.astMayEatColour(node, tokens, i);
    this.addNewTokens( newStr, node, tokens[i-1]);
    var surrounder = node.subtree[0].subtree;
    var topPaper = node.subtree[0].subtree[0];
    i=this.P.eatArgs( node, tokens, "width height", i );
    surrounder[3].subtree[0] = node.subtree.pop();
    surrounder[1] = node.subtree.pop();
    if( node.colour ){
      topPaper.colour = node.colour;
    }
    return i;
  },
  astOfMacro_tensor_sensor3(ast, node, tokens, i, len){
    var newStr = "\\paper-stack {\\box\\box\\box #dfd} \\surround aaa \\rot90 {} \\rot90 bbb {} ccc";
    this.addNewTokens( newStr, node, tokens[i-1]);
    var surrounder = node.subtree[0].subtree;
    var topPaper = node.subtree[0].subtree[0].subtree[2];
    i=this.P.astMayEatColour(node, tokens, i);
    i=this.P.eatArgs( node, tokens, "width height depth", i );
    surrounder[5] = node.subtree.pop();
    // want this under the \\rot90, so place in the subtree.
    surrounder[3].subtree[0] = node.subtree.pop();
    surrounder[1] = node.subtree.pop();
    if( node.colour ){
      topPaper.colour = node.colour;
    }
    return i;
  },
  astOfMacro_left(ast, node, tokens, i, len){
    i=this.P.astMayEatToken( node, tokens, "{", i );
    if( node.value )
      node.token = "\\left{";
    else
      node.token = "\\left ";
    return i;
  },
  astOfMacro_right(ast, node, tokens, i, len){
    i=this.P.astMayEatToken( node, tokens, "}", i );
    if( node.value )
      node.token = "\\right}";
    else
      node.token = "\\right ";
    return i;
  },
  astOfMacro_mul(ast, node, tokens, i, len){
    i=this.P.astEatCount( node, tokens, i );
    if( !node.count ){
      node.token = "--count--";
      return i;
    }
    var oldIx = i;
    i=this.P.eatArgs( node, tokens, "arg", i );
    if( i>oldIx ){
      node.token = "{";
      for(var j=1;j<node.count && j<20;j++){
        i = this.P.eatArgs( node, tokens, "arg", oldIx );
      }
      //var dummy = {};
      //dummy.token = "}";
      //node.subtree.push( dummy );
    }
    return i;
  },
  // Macro will usually have been converted to 
  // primitives for these functions.
  // They should not get called!
  measureMacro( ctx, parent, ast ){
    var box = new Box();
    ast.box = box;
    return ast.box;
  },
  positionMacro( parent, ast, v){
    return;
  },
  outMacro( ctx, ast, color, proportion ){
    return;
  },
}

var Macro = new Macro();


function Graph(){
  return this;
}

Graph.prototype = {
  fns : "\\graph \\half-graph \\shalf-graph \\quarter-graph",
  name: "Graph",
  astOfGraph(ast, node, tokens, i, len){
    i = this.P.astMayEatSize( node, tokens, i);
    i = this.P.astMayEatColour( node, tokens, i );
    i = this.P.getSimpleArg( node, tokens, 'spec', '0/1/', i);

    return i;
  },
  measureGraph( ctx, parent, ast ){
    ast.box = new Box(70,70);
    if( ast.hasSizing ){
      ast.box = new Box( ast.hasSizing );
    }
    return ast.box;
  },
  measureGraph_half_graph( ctx, parent, ast ){
    var box = new Box(35,70);
    ast.box = box;
    return ast.box;
  },
  measureGraph_shalf_graph( ctx, parent, ast ){
    var box = new Box(24,48);
    ast.box = box;
    return ast.box;
  },
  measureGraph_quarter_graph( ctx, parent, ast ){
    var box = new Box(10,70);
    ast.box = box;
    return ast.box;
  },
  positionGraph( parent, ast, v){
    ast.box.move( v );
    // subsequent is aligned by the caller..
  },
  fnAccum( t ){
    return -2*t*t*t+3*t*t;
  },
  polyEval( coeffs, t ){
    var result = 0;
    for(var i=0;i<coeffs.length;i++){
      result = result * t;
      result = result + coeffs[i];
    }
    return result;
  },
  addIn( a, b, mul){
    for(var i=0;i<a.length;i++){
      a[i]+=b[i]*mul;
    }
  },
  outGraph( ctx, ast, color, proportion ){
    if( this.P.mayOutHotBox( ctx, ast ))
      return;
    var v0 = ast.box.vecs[0];
    var v  = ast.box.diagonal();

    var choices = ast.spec;
    choices = choices.split( /(=|\/|\\|-?\d+\.?\d*|:)/);
    // get rid of ':' and '' and only keep terms we want.
    choices = choices.filter(term => term.match(/=|\/|\\|-?\d+\.?\d*/ ));

    var nGraphs = Math.max( 1, Math.floor( choices.length / 2)-1);
    // We're doing cubic splines, breaking the x-axis into equal 
    // intervals.
    v.x = v.x / nGraphs;
    for( var i=0;i<nGraphs;i++){
      dx = v.x;
      this.outSubPlot( 
        ctx, choices, color, proportion, v0.add( v.x*i, 0), v );
      choices.shift();
      choices.shift();
    }
    this.P.outBox( ctx, ast.box );
  },
  outSubPlot( ctx, choices, color, proportion, v0, v ){
    var lambda = v.x / Math.max( 0.1, v.y);
    v0.x = Math.floor( v0.x );
    var v1 = v0.add( v );
    v1.x = Math.ceil( v1.x );
    //var lambda = (v1.x-v0.x) / Math.max( 0.1, v.y);
    //In 0=1/ the first is the value, the second is the slope.
    //so that is 0 at 0, 0 gradient
    //1 at 1, gradient of 1.

    // These are the coefficients of polynomials that 
    // set just one value or gradient to 1 and all else zero.
    // We can linearly combine these coefficients to get 
    // a polynomial with the values and gradients we want.
    var polys= [
      [ 2, -3,  0, 1], // 1=0=
      [ 1, -2,  1, 0], // 0/0=
      [-2,  3,  0, 0], // 0=1=
      [ 1, -1,  0, 0], // 0=0/
    ];

    // Where did these coefficients come from?
    //
    // There's a matrix A we can construct for evaluating 
    // f(x) = ax^3+bx^2+cx+d and its gradient at 0 and 1.
    // if v=(a,b,c,d), then Av can give the evaluations we
    // want u=(f(0),f'(0),f(1),f'(1)), if we choose the 
    // right A_ij.
    // We can write down what the values of A_ij by 
    // considering f(x) and f'(x) as follows:
    // A = 
    //     0 0 0 1   - f(0) i.e. constant term d of f(x)
    //     0 0 1 0   - f'(0) i.e. constant term c of f'(x)
    //     1 1 1 1   - f(1) i.e. a+b+c+d
    //     3 2 1 0   - f'(1) i.e 3a+2b+c
    // This A gives us u from v. To go the other way we
    // need the inverse of A.
    // Then v = A^{-1}Av = A^{-1}u
    // So the table of polynomial coefficients, polys, is 
    // 'just' the inverse of the matrix A (and 
    // transposed because of how we evaluate it)

    var multipliers = {};
    multipliers[ "=" ] = 0;
    multipliers[ "/" ] = 1;
    multipliers[ "\\"] = -1;

    var result = [0,0,0,0];
    var j = -1;
    for( var i=0;i<4;i++){
      var mul = 0;
      j++;
      while( ( choices[j]==':') || ( choices[j]=='' ) ){
        j++;
      }
      if( choices[j] && multipliers[ choices[j]])
        mul = multipliers[ choices[j]];
      else if( !isNaN( choices[j]))
        mul = +choices[j];
      if( i%2 == 1)
        mul = mul * lambda;
      this.addIn( result, polys[i], mul );
    }
    //this.addIn( result, polys[2] );


    ctx.beginPath();
    ctx.lineWidth = 2.0;
    ctx.strokeStyle = color || "#444";
    ctx.fillStyle = "#888";
    //ctx.moveTo( v0.x, v1.y );
    ctx.moveTo( v0.x, v1.y - v.y*(this.polyEval( result, 0)));
    var d = Math.min( Math.max(1, v.x/14), 5);
    for( i=0;i<=v.x;i+=d){
      ctx.lineTo( v0.x+i, v1.y - v.y*(this.polyEval( result, i /v.x)));
    }
    ctx.lineTo( v1.x, v1.y - v.y*(this.polyEval( result, 1)))    
    ctx.stroke();
    ctx.lineTo( v1.x,v1.y );
    ctx.lineTo( v0.x,v1.y );
    ctx.closePath();
    ctx.fill();
  },
}

var Graph = new Graph();


function Stretcher(){
  return this;
}

Stretcher.prototype = {
  fns : "\\stretch \\stretch-brace",
  name: "Stretcher",
  astOfStretcher(ast, node, tokens, i, len){
    //node.token="FOO"
    return i;
  },
  measureStretcher( ctx, parent, ast ){
    var box = new Box(15,30);
    ast.box = box;
    return box;
  },
  positionStretcher( parent, ast, v){
    var pHeight = (parent && parent.box && parent.box.height())||0;
    var dh = pHeight - ast.box.height();
    if( dh>0 ){
      // expand the box!
      var box = parent.box;
      ast.box.vecs[0].y = box.vecs[0].y
      ast.box.vecs[1].y = box.vecs[1].y
      v = Vector2d( v.x, 0);
    }
    ast.box.move( v );
    // subsequent is aligned by the caller..
  },
  outStretcher( ctx, ast, color, proportion ){
    if( this.P.mayOutHotBox( ctx, ast ))
      return;
    var v = ast.box.vecs[0];
    var dv = ast.box.diagonal();

    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 3.0;
    ctx.strokeStyle = color || "#000";

    //ctx.beginPath();
    ctx.moveTo( v.x, v.y)
    ctx.lineTo( v.x+dv.x,  v.y+dv.y);
    ctx.stroke();
    ctx.restore();

    this.P.outBox( ctx, ast.box );
  },
  outStretcher_stretch_brace( ctx, ast, color, proportion ){
    if( this.P.mayOutHotBox( ctx, ast ))
      return;
    var v = ast.box.vecs[0];
    var dv = ast.box.diagonal();
    var pieces = "⎧ ⎪ ⎨ ⎪ ⎩".split(" ");

    ctx.save();
    FontHandler.setFontForToken( ctx, "\\left(" );
    color = color || this.parent.sym_color || "#950";
    ctx.fillStyle = color;
    var text = pieces[0];
    var len = ctx.measureText(text).width;
    var h = dv.y;// -len;
    var width = ast.box.width();
    var adjust = this.P.alignFrac * (width - len);
    //ctx.beginPath();
    v = v.add( adjust, 8 );//, this.P.getFontOffset());
    ctx.fillText( pieces[0], v.x, v.y );
    ctx.fillText( pieces[2], v.x, v.y+h/2 );
    ctx.fillText( pieces[4], v.x, v.y+h );
    if( h > 25 ){
      ctx.beginPath();
      ctx.lineWidth = 2.0;
      ctx.strokeStyle = color || "#000";

      //ctx.beginPath();
      ctx.moveTo( v.x+dv.x-5, v.y+2.3)
      ctx.lineTo( v.x+dv.x-5, v.y+h/2-17.8);
      ctx.moveTo( v.x+dv.x-5, v.y+dv.y-2-16.1)
      ctx.lineTo( v.x+dv.x-5, v.y+dv.y-h/2+14-11.8);
      ctx.stroke();
    }
    ctx.restore();

    this.P.outBox( ctx, ast.box );
  },
}

var Stretcher = new Stretcher();



function Sample(){
  return this;
}

Sample.prototype = {
  fns : "\\stack \\stack-left \\stack-right",
  name: "Sample",
  astOfSample(ast, node, tokens, i, len){
    return i;
  },
  measureSample( ctx, parent, ast ){
    var box = new Box();
    ast.box = box;
    if( !ast )
      return box;
    var tree = ast.subtree;
  },
  positionSample( parent, ast, v){
    ast.box.move( v );
    // subsequent is aligned by the caller..
  },
  outSample( ctx, ast, color, proportion ){
    if( this.P.mayOutHotBox( ctx, ast ))
      return;
    this.P.outBox( ctx, ast.box );
  },
}

var Sample = new Sample();






// Jatex is a singleton, just one instance.
function Jatex(){
  this.addTagHandler( Twisty );
  this.addTagHandler( Frac );
  this.addTagHandler( Stack );
  this.addTagHandler( Tile );
  this.addTagHandler( SupSub );
  this.addTagHandler( FontHandler );
  this.addTagHandler( Settings );
  this.addTagHandler( Ruler );
  this.addTagHandler( SvgSymbols );
  this.addTagHandler( Transform );
  this.addTagHandler( Macro );
  this.addTagHandler( Graph );
  this.addTagHandler( Stretcher );
  return this;
}

Jatex.prototype ={
  fns : [],
  addTagHandler( object_var ){
    if( !object_var.fns )
      return;
    object_var.P = this;
    for( name of object_var.fns.split(" ")){
      this.fns[ name ] = object_var;
    }
  },
  callBack( prefix, tok, ...args ){
    var obj = this.fns[ tok ];
    var proto = Object.getPrototypeOf(obj);
    var fn_name = prefix + obj.name + tok.replace( /[-\\]/g, "_");
    // Try with suffix
    if( !proto[ fn_name ])
      fn_name = prefix + obj.name;
    // Try without suffix
    if( !proto[ fn_name ])
//      return;
      alert( "No tag handler for "+fn_name);
    //console.log( fn_name );
    return proto[fn_name].call(obj,...args);
  },
  // Functions that redirect to the registered objects.
  textOfToken( token ){
    return Symbol.JatexDict[ token ] || token;
  },
  // From outside a label, this is a similar interface to Katex.
  renderToString( str ){
    if( this.JatexDict[str])
      return this.JatexDict[str];
    return "ƒƒƒiƒƒƒo"
  },
  tokenSubstitutes( tok )
  {
    if( tok == '_')
      return "\\sub";
    if( tok == '^')
      return "\\sup";
    return tok;
  },
  // ---------------- Parsing and rendering ---------------
  // Originally token stream was merely a stream of tokens.
  // Nowadays it is groups of four:
  // - The token, such as \sum
  // - The start index in the original string
  // - The end index in the original string
  // - The assigned atom index.
  tokenise( str, atomIx ){
    var tokens = [];
    var token = "";
    var start = 0;
    str = str+ " ";
    for( var i in str ){
      i = Number(i);
      var ch = ""+str[i];
      // Maybe emit the token we were working on.
      // -> Emit previous token.
      if( "\\{}^_ ".indexOf( ch )>=0){
        if( token ){
          tokens.push(token);
          tokens.push( Number(start));
          tokens.push( Number(i-1));
          tokens.push( atomIx );
          start = i;
        }
        token = "";
      }
      // For now " " only separates, and never is passed through.
      // All our tokens are free of " ".
      //if( ch != " ")
        token += ch;
      //else 
      //  start = i+1;
      // If this is an all-in-one token, send it out immediately.
      // These are the one character tokens which are complete in 
      // themselves.
      // -> Emit this token.
      if( "{}^_ ".indexOf( ch )>=0){
        tokens.push( token );
        tokens.push( Number(i));
        tokens.push( Number(i));
        tokens.push( atomIx );
        start = i+1;
        token = "";
      }
    }
    return tokens;
  },
  // This is given a list of named args.
  // We expect to eat that number of tokens.
  // If they are absent, we make up empty placeholders
  // each placeholder has the right name.
  eatArgs( ast, tokens, args, i){
    args = args.split( " ");
    if( !ast.subtree )
      ast.subtree = [];
    for( var j=0;j<args.length;j++){
      i = this.astOfTokens( ast, tokens, i, i+1);
      if( ast.subtree.length <= j)
        break;
    }
    while( ast.subtree.length < args.length){
      var node = {};
      node.token = args[ast.subtree.length];
      ast.subtree.push( node );
    }
    return i;
  },
  getSimpleArg( ast, tokens, name, defaultValue, i){
    i=this.skipBlanks(tokens,i);
    if( i>tokens.length ){
      ast[name]=defaultValue;
      return i;
    }
    ast[name]=tokens[i];
    i+=4;
    while( (tokens[i]!==undefined) && (tokens[i]!=" ")){
      ast[name]+=tokens[i];
      i+=4;
    }
    return i;
  },

  // skip blanks.
  // this may go beyond the sequence end.
  skipBlanks(tokens,i){
    while( tokens[i]==" ")
      i+=4;
    return i;
  },
  astOfTokens( ast, tokens, i, len ){
    if( i>= tokens.length )
      return i;
    // sequentially convert tokens to nodes.
    // We may read ahead, if the construct consumes tokens itself.
    while( i< len ){
      i=this.skipBlanks(tokens,i,len);
      var tok = tokens[i++];
      var start = tokens[i++];
      var end = tokens[i++];
      var jref = tokens[i++];
      if( tok == undefined )
        break;
      if( tok == "}" )
        return i;
      var node = {};
      tok = this.tokenSubstitutes( tok );
      node.token = tok;
      node.jref = jref;
      if( !ast.subtree )
        ast.subtree = [];
      ast.subtree.push( node );
      if( ["{"].includes(tok) )
      {
        // as many as we want...
        i= this.astOfTokens( node, tokens, i, tokens.length);
        this.astAddEmpty( node, 1);
      }
      else if( this.fns.hasOwnProperty(tok) )
      {
        i = this.callBack( "astOf", tok,/*) -> (*/ ast, node, tokens, i, length );
      }
    }
    return i;
  },
  // Brings contents of a {}, if there is any, up one level.
  astLift( ast ){
    if( !ast.subtree )
      return;
    if( !ast.subtree[0])
      return;
    if( ast.subtree[0].token != "{")
      return;
    ast.subtree = ast.subtree[0].subtree;
  },
  astAddErr( ast, string ){
    if( !ast.subtree )
      ast.subtree = [];
    var node = {};
    node.token = string;
    ast.subtree.push( node );
  },
  astAddUndefined( ast, count ){
    if( !ast.subtree )
      ast.subtree = [];
    while( ast.subtree.length < count){
      var node = {};
      node.token = "--undefined--";
      ast.subtree.push( node );
    }
  },
  astAddEmpty( ast, count ){
    if( !ast.subtree )
      ast.subtree = [];
    while( ast.subtree.length < count){
      var node = {};
      node.token = "";
      ast.subtree.push( node );
    }
  },
  astMayEatColour( node, tokens, i ){
    i=this.skipBlanks(tokens,i);
    var tok = tokens[ i ] || "";
    if( tok.match( /^#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]$/ )){
      node.colour = tok;
      i+=4;
    }
    return i;
  },
  astMayEatSize( node, tokens, i){
    i=this.skipBlanks(tokens,i);
    var tok = tokens[ i ] || "";
    if( tok.match( /^[0-9]+x[0-9]+$/ )){
      tok=tok.split('x');
      node.hasSizing = new Box( +tok[0], +tok[1] );
      i+=4;
    }
    return i;
  },
  astMayEatToken( node, tokens, token, i ){
    i=this.skipBlanks(tokens,i);
    var tok = tokens[ i ] || "";
    if( tok == token ){
      node.value = tok;
      i+=4;
    }
    return i;
  },  
  astEatCount( node, tokens, i ){
    i=this.skipBlanks(tokens,i);
    var tok = tokens[ i ] || "";
    if( !isNaN( tok )){
      node.count = Number(tok);
      i+=4;
    }
//    else
//      this.astAddErr(ast,"--Count--");
    return i;
  },  
  isFormatter( tok ){
    if( ["{","}"].includes( tok ))
      return true;
    return false;
  },
  measureSubtree( ctx, parent, ast){
    ast.box = new Box();
    var tok = ast.token;

//    if( ["^","_"].includes( tok ))
//      return this.measureLittleBits( ctx, parent, ast, tok);
    if( this.fns.hasOwnProperty(tok) )
      return this.callBack( "measure", tok,/*) -> (*/ ctx, parent, ast );
    if( this.isFormatter( tok ))
      return this.measure_hStack( ctx, parent, ast );  
    return this.measureChars( ctx, parent, ast );
  },
  measureChars( ctx, parent, ast ){
    var box = ast.box;
    var tok = ast.token;
    var len = 0;
    // adding text
    var text = this.textOfToken(  tok );
    FontHandler.setFontForToken( ctx, tok );
    var len = ctx.measureText(text).width;
    var ht  = FontHandler.getFontHeight();//8+ctx.measureText("M").width;
    len = Math.max( len, this.minWidth );
    box.addRight( len, ht );
    ast.box = box;
    return box;
  },
  measure_hStack( ctx, parent, ast ){
    var box = ast.box;
    var tok = ast.token;
    var len = 0;
    // horizontal sequence...
    var prev = null;
    for( var subtree of ast.subtree || []){
      // adding a box of something.
      box.addRight( this.measureSubtree( ctx, prev, subtree));
      prev = subtree;
    }
    ast.box = box;
    return box;
  },
  measureLittleBits( ctx, parent, ast, font ){
    FontHandler.pushFont(font);
    var box1 = this.measureSubtree( ctx, ast, ast.subtree[0]);
    //ast.box = ast.box.addRight( box1 );
    FontHandler.popFont();
    return ast.box;
  },
  outSubtree( ctx, ast, color ){
    var tok = ast.token;
//    if( ["^","_"].includes( tok ))
//      return this.outFontChange( ctx, ast, color, tok);
    if( this.fns.hasOwnProperty(tok) )
      return this.callBack( "out", tok,/*) -> (*/ ctx, ast, color );
    return this.outChars( ctx, ast, color );
  },
  outChars( ctx, ast, color ){
    var tok = ast.token;
    if( !this.isFormatter( tok ))
      this.outBoxedToken( ctx, ast, color);
    for( var node of (ast.subtree || []) ){
      this.outSubtree( ctx, node, color );
    }
  },
  outBar( ctx, len, v, color ){
    // Safari needs the save and restore, otherwise it
    // applies the colours and widths to other lines.
    ctx.save();
    ctx.beginPath();  
    ctx.strokeStyle = color || "#208";
    ctx.lineWidth = 2;
    ctx.moveTo( v.x, v.y);
    ctx.lineTo( v.x+len, v.y);
    ctx.stroke();
    ctx.restore();
  },
  // illustrative bounding-boxes around the symbols.
  outBox( ctx, box, color ){
    if( !this.parent.bounding_boxes )
      return; 
    if( !box.vecs )   
      return;
    var v0 = box.vecs[0];
    var dv = box.diagonal();
    ctx.beginPath();  
    ctx.strokeStyle = color || "#2083";
    ctx.lineWidth = 1.0;
    ctx.rect( v0.x, v0.y, dv.x, dv.y);
    ctx.stroke();
    ctx.beginPath();
  },
  // hot-boxes used for info cards
  outFilledBox( ctx, box, color ){
    var v0 = box.vecs[0];
    var dv = box.diagonal();
    ctx.beginPath();  
    ctx.fillStyle = color;
    ctx.lineWidth = 1.0;
    ctx.rect( v0.x, v0.y, dv.x, dv.y);
    ctx.fill();
    ctx.beginPath();
  },
  hotColourOfAtom( atomIx ){
    // this way of accessing the atoms is cursed!
    var atoms = this.A.RootObject.content[1].atoms;
    var jrefAtom = atoms[ atomIx % atoms.length ];
    var color = jrefAtom.hotspotColour;
    return color;
  },
  // Record position of the jRef atom.
  mayPositionJref( atomIx, box ){
    var atoms = this.A.RootObject.content[1].atoms;
    var jrefAtom = atoms[ (+atomIx) % atoms.length ];
    if( jrefAtom.isJref){
      var v = box.midpoint();
      jrefAtom.x = v.x;
      jrefAtom.y = v.y;
      jrefAtom.placed = true;
      return true;
    }
    return false;
  },
  // There is a hotspot box to show if either 
  // this has a jref (grey overlay)
  // or we're doing the false colour thing.
  mayOutHotBox( ctx, ast ){
    var hot = this.isHotspot;
    if( ast.jref == undefined)
      return hot;
    if(ast.jref < 0)
      return hot;

    var isJref = this.mayPositionJref( ast.jref, ast.box );
    isJref =  isJref && (this.parent.shade_jrefs != 'n');
    var colorBox = "#0002";
    // hotspot is coloured, normal is grey.
    if( hot )
      colorBox = this.hotColourOfAtom( ast.jref );
    if( isJref || this.isHotspot )
      this.outFilledBox( ctx, ast.box, colorBox || "#00f");
    return hot;
  },
  outBoxedToken( ctx, ast, color ){
    if( this.mayOutHotBox( ctx, ast ))
      return;
    var v = ast.box.vecs[0];
    var text = this.textOfToken( ast.token );
    FontHandler.setFontForToken( ctx, ast.token );
    color = color || this.parent.sym_color || "#950";
    ctx.fillStyle = color;
    var len = ctx.measureText(text).width;
    var width = ast.box.width();
    var adjust = this.alignFrac * (width - len);
    //ctx.beginPath();
    ctx.fillText( text, v.x+adjust, v.y+FontHandler.getFontOffset() );
    this.outBox( ctx, ast.box );
    ctx.textBaseline = "alphabetic";
  },
  positionSubtree(parent, ast, v ){
    var tok = ast.token;
    if( this.fns.hasOwnProperty(tok))
      return this.callBack( "position", tok,/*) -> (*/ parent, ast, v );
    this.positionVAligned( parent, ast, v, 0.5);
  },
  positionSubtree2(parent, ast, v ){
    var tok = ast.token;
    if( this.fns.hasOwnProperty(tok) )
      return this.callBack( "position", tok,/*) -> (*/ parent, ast, v );
    this.positionVAligned( parent, ast, v, 0.5);
  },
  // The VAlign and HAlign subroutines may quite often be 
  // called by functions that only have one sub element.
  positionVAligned( parent, ast, v, vAlign){
    ast.box.move( v );
    var vv = ast.box.vecs[0].newCopy();
    // These are laid out side by side.
    for( var node of (ast.subtree || []) ){
      var spare = ast.box.height()-node.box.height();
      this.positionSubtree( ast, node, vv.add( 0,spare*vAlign) );
      if( Math.abs(vAlign-0.5)<0.01 )
        vv = vv.add( node.box.width(), 0);
    }
  },
  // called by font handler.
  positionHAligned( parent, ast, v, hAlign){
    ast.box.move( v );
    var vv = ast.box.vecs[0].newCopy();
    // these are stacked above each other...
    for( var node of (ast.subtree || []) ){
      var spare = ast.box.width()-node.box.width();
      this.positionSubtree( ast, node, vv.add( spare*hAlign,0) );
    };
  },

  // We pass A because we will need the ctx for measuring
  // text size.
  parse(A, obj,d){
    var v = Vector2d( obj.x, obj.y );
    var dv = Vector2d( 1,0);
    transformXy( v, d);
    var label;

    var ast = obj.ast;
    var ctx = getCtx( A, obj, d );
    this.isHotspot = d.isHotspot;
    this.parent = obj.parent;
    this.A = A;
    this.minWidth = 0;
    this.twistyHeight = 0;
    this.twistySpacing = 0;
    this.alignFrac = 0.0;

    // reset would be needed if there is a bug that 
    // does not pop as often as it pushes.
    FontHandler.reset();
    // Optimisation - 
    // We can probably skip the first two steps, 
    // IF we are drawing a hotspot.
    this.measureSubtree( ctx, null, ast);
    this.positionSubtree( null, ast, v );
    this.outSubtree( ctx, ast );
    // We could pre-clear all the x,y postions of 
    // jRefs.
//    for( atomIx of obj.jrefAtom || [] ){
//    }
  },
  listSymbols(){
    var cmds = Object.keys( Symbol.JatexDict ).sort();
    var result = [];
    for(var i=0;i<cmds.length;i++){
      var name = cmds[i];
      var translation = Symbol.JatexDict[cmds[i]];
        result.push(`${name} - ${translation}`);
    }
    return result;
  },
  listCommands(){
    var cmds = Object.keys( this.fns ).sort();
    var proto = Object.getPrototypeOf(this);
    var result = [];
    for(var i=0;i<cmds.length;i++){
      var name = cmds[i];
      var obj = this.fns[cmds[i]];
        result.push(`${name} - ${obj.name}`);
    }
    return result;
  },
}

var Jatex = new Jatex();


// Jatex format allows LaTeX embedded in a markdown doc.
function Jatex_Fmt(){
  return this;
}

Jatex_Fmt.prototype ={
  name : "Jatex",
  debug(A,url,text){
    alert( url );
  },
  htmlOf( str ){
    str = str || "c = \\pm\\sqrt{a^2 + b^2}";
    var html = Jatex.renderToString(str, {
      throwOnError: false, displayMode: true});
    return html;
  },
  htmlInlineOf( str ){
    str = str || "c = \\pm\\sqrt{a^2 + b^2}";
    var html = Jatex.renderToString(str, {
      throwOnError: false, displayMode: false});
    return html;
  },
}
var Jatex_Fmt = new Jatex_Fmt();

Exports();

return metaData;
}( Registrar );// end of jatex_fmt_js


