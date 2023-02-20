
function Box(x,y){
  x = x || 0;
  y = y || 0
  this.vecs = [Vector2d(0,0),Vector2d(x,y)];
  return this;
}

Box.prototype ={
  merge( box, by ){
    if( by !== undefined){
      var v = Vector2d( box, by);
      box = new Box();
      box.vecs[1]=v;
    }
    this.vecs[0]= this.vecs[0].min( box.vecs[0]);
    this.vecs[1]= this.vecs[1].max( box.vecs[1]);
    return this;
  },
  addRight( box, by ){
    if( by !== undefined ){
      box = new Box(box,by);
    }
    this.vecs[1].x += box.width();
    this.vecs[1].y = Math.max( this.vecs[1].y,box.vecs[1].y );
    return this;
  },
  addDown( box, by ){
    if( by !== undefined ){
      box = new Box(box,by);
    }
    this.vecs[1].y += box.height();
    this.vecs[1].x = Math.max( this.vecs[1].x,box.vecs[1].x );
    return this;
  },
  set0( v,y ){
    if( y !== undefined )
      v = Vector2d( v, y);
    this.vecs[0]=v.newCopy();
    return this;
  },
  set1( v,y){
    if( y !== undefined )
      v = Vector2d( v, y);
    this.vecs[1]=v.newCopy();
    return this;
  },
  expand( x,y ){
    box = new Box();
    box.set0( this.vecs[0].sub(x,y));
    box.set1( this.vecs[1].add(x,y));
    return box;
  },
  move( x, y){
    this.vecs[0] = this.vecs[0].add(x,y);
    this.vecs[1] = this.vecs[1].add(x,y);
    return this;
  },
  diagonal(){
    return this.vecs[1].sub(this.vecs[0]);
  },
  midpoint(){
    return this.vecs[1].add(this.vecs[0]).mul( 0.5 );
  },
  width(){
    return this.vecs[1].x - this.vecs[0].x;
  },
  height(){
    return this.vecs[1].y - this.vecs[0].y;
  }
}

function Twisty(){
  return this;
}

Twisty.prototype = {
  join( ctx, ast, i, j, len1, len2, color){
    var box = ast.box;
    var offset = 5;
    var v0 = box.vecs[0].add( offset, 0);
    var v1 = box.vecs[1].sub( offset, 0);
    var w = box.width();
    var h = box.height();
    var pixSpace = 8;

    ctx.save();
    for( var pass =0;pass<2;pass++){
      var x = v0.x + w/2;
      ctx.beginPath();  
      ctx.strokeStyle = pass? color :"#DDD";
      ctx.lineWidth = pass? 2:4;
      ctx.moveTo( x+pixSpace*(i-len1*0.5), v0.y );
      ctx.lineTo( x+pixSpace*(i-len1*0.5), v0.y+offset );
      ctx.lineTo( x+pixSpace*(j-len2*0.5), v1.y-offset );
      ctx.lineTo( x+pixSpace*(j-len2*0.5), v1.y );
      ctx.stroke();
    }
    ctx.restore();
  },
  outAst( ctx, ast, params, color){
    var perm = params.token.replace( /[\[\]()]/g,"");
    var perms = perm.split("-");
    perms[0] = perms[0] || "";
    perms[1] = perms[1] || "";
    var len1 = perms[0].length ||1;
    var len2 = perms[1].length ||len1;
    var i = len1
    while(i--){
      var ch = perms[0].substring(i,i+1);
      if( ("a">ch)||(ch>"z"))
        continue;
      var j = perms[1].indexOf( ch );
      if( j< 0 )
        j = (ch.charCodeAt(0)-"a".charCodeAt(0))% 8;

      this.join( ctx, ast, i, j, len1, len2, color || "#333");
    }
  },
}

var Twisty = new Twisty();

function stringDictOfString( items ){
  var dict = [];
  for( var i=0;i<items.length;i+=2){
    dict[ items[i+1]]=items[i];
  }
  return dict;
}
function numberDictOfString( items ){
  var dict = [];
  for( var i=0;i<items.length;i+=2){
    dict[ items[i+1]]=Number(items[i]);
  }
  return dict;
}

// Jatex is a singleton, just one instance.
function Jatex(){
  var SymStr = "^ \\hat § \\S ¯ \\bar ± \\pm µ \\mu · \\cdot × \\times ÷ \\div ı \\imath ȷ \\jmat ˙ \\dot Γ \\Gamma Δ \\Delta Θ \\Theta Λ \\Lambda Ξ \\Xi Π \\Pi Σ \\Sigma Υ \\Upsilon Φ \\Phi Ψ \\Psi Ω \\Omega α \\alpha β \\beta γ \\gamma δ \\delta ε \\varepsilon ζ \\zeta η \\eta θ \\theta ι \\iota κ \\kappa λ \\lambda μ \\mu ν \\nu ξ \\xi π \\pi ρ \\rho ς \\varsigma σ \\sigma τ \\tau υ \\upsilon φ \\phi φ \\varphi χ \\chi ψ \\psi ω \\omega ϑ \\vartheta ϕ \\phi ϖ \\varpi ϱ \\varrho ϵ \\epsilon Ω \\Omega → \\rightarrow ⇒ \\Rightarrow ∀ \\forall ∂ \\partial ∃ \\exists ∅ \\varnothing ∇ \\nabla ∈ \\in ∓ \\mp ∗ \\ast ∝ \\propto ∞ \\infty ∠ \\angle ∣ \\mid ∥ \\parallel ∧ \\wedge ∨ \\vee ∩ \\cap ∪ \\cup ∴ \\therefore ∵ \\because ∼ \\sim ≅ \\cong ≈ \\approx ≠ \\neq ≡ \\equiv ≤ \\leq ≥ \\geq ≺ \\prec ≻ \\succ ⊂ \\subset ⊆ \\subseteq ⊕ \\oplus ⊗ \\otimes ⊥ \\bot ⊥ \\perp ⋅ \\cdot ◦ \\circ ⪯ \\preceq ⪰ \\succeq ( \\left( ) \\right) ⇌ \\chemequal ⇋ \\chemequal2 - - + + = =";

  SymStr += " ∫ \\int ∬ \\iint ∭ \\iiint ∫⋅⋅⋅∫ \\idotsint ∮ \\oint ∯ \\ooint ∰ \\oooint";

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
//  SymStr.push( " — ");
//  SymStr.push( "-");
//  SymStr.push( " + ");
//  SymStr.push( "+");

  this.JatexDict = stringDictOfString( SymStr );

  var opNames = "\\times + - = \\sim \\cong \\approx \\neq \\equiv \\leq \\geq \\prec \\succ \\subset \\subseteq \\oplus \\otimes \\preqeq \\succeq \\chemequal \\int \\iint \\iiint \\idotsint \\oint".split(" ");

  for( var tok of opNames)
    this.JatexDict[ tok ] = " " + this.JatexDict[ tok ] + " ";


  SymStr = "\\round \\chevron \\straight \\forward \\backward \\arrow-head \\arrow-tail \\snake-head \\snake-tail \\cold-front \\warm-front \\zigzag \\zagzig \\sway \\antisway".split( " " );
  this.EndShapes = [];
  for( var tok of SymStr){
    this.EndShapes[tok]=1; 
    this.EndShapes[tok+'-flip']=1; 
  }

  SymStr = "\\Sigma \\Pi \\A \\Z".split(" ");
  this.FontAdjust = [];
  // 30 for big.
  for( var tok of SymStr)
    this.FontAdjust[tok]=1;

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

  this.FontStack = [];
  this.FontList = [
    // style,   font,         px size, height, baseline adjust
    [ "italic", "KaTex_Math", 20,      20,     4 ],
    [ "",       "KaTex_Math", 50,      44,     5 ],
    [ "",       "KaTex_AMS",  48,      44,     5 ],
    [ "italic", "KaTex_Math", 17,      17,     4 ],
    [ "bold",   "KaTex_Math", 20,      20,     4 ],
    [ "",       "KaTex_Size3",20,      20,     5 ],
    ];
  this.font = this.FontList[0];
  // We allow many to one for font names to fonts.
  // The superscript and subscript operations count as font changes.
  this.fontNames = numberDictOfString( 
    "0 \\mathital 1 \\mathbig 2 \\mathbb 3 \\mathitalsmall 4 \\mathbf 5 \\mathsize3 3 ^ 3 _".split(" "));
  this.growable = "\\left( \\right)".split(" ");
  return this;
}

Jatex.prototype ={
  renderToString( str ){
    if( this.JatexDict[str])
      return this.JatexDict[str];
    return "ƒƒƒiƒƒƒo"
  },
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
      if( "\\{}^_ ".indexOf( ch )>=0){
        if( token ){
          tokens.push(token);
          tokens.push(Number(start));
          tokens.push(Number(i-1));
          tokens.push( atomIx );
          start = i;
        }
        token = "";
      }
      // For now " " only separates, and never is passed through.
      // All our tokens are free of " ".
      if( ch != " ")
        token += ch;
      else 
        start = i+1;
      // If this is an all-in-one token, send it out immediately.
      // These are the one character tokens which are complete in 
      // themselves.
      if( "{}^_".indexOf( ch )>=0){
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
  textOfToken( token ){
    return Jatex.JatexDict[ token ] || token;
  },
  setFontForToken( ctx, token ){
    var font = this.topFont();
    var fontAdjust = this.FontAdjust[token ] || 0;
    if( fontAdjust != 0)
      font = fontAdjust;
    font = this.FontList[font];
    var matches = token.match( /^[a-z A-Z]*$/ );
    // some symbols are better italic..
    matches = matches || (["\\rho","\\pi"].indexOf( token ) >= 0 );
    //matches = false;
    ctx.font = (matches ? font[0]:"") + " " + font[2]+"px "+font[1]; // font and size.
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
  pushFont( font ){
    if( isNaN( font ))
      font = (this.fontNames[ font ] || 0);
    this.FontStack.push( font );
  },
  popFont(){
    var l = this.FontStack.length;
    if( l )
      this.FontStack.pop();
  },
  labelEndOfToken( tok ){
    var end = tok.substring(1).replace( "-","_");
    end = end.replace( "backward", "forward_flip");
    end = end.replace( "_flip_flip", "");
    end = end.replace( "_flip", "Flip");
    return end;
  },
  astOfTokens( ast, tokens, i, len ){
    if( i>= tokens.length )
      return i;
    while( i< len ){

      var tok = tokens[i++];
      var start = tokens[i++];
      var end = tokens[i++];
      var jref = tokens[i++];
      if( tok == "}" )
        return i;
      var node = {};
      node.token = tok;
//      node.start = start;
//      node.end = end;
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
      else if( ["\\missing"].includes(tok) )
      {
        // just one.
        i= this.astOfTokens( node, tokens, i, i+1);
        this.astAddEmpty( node, 1);
      }
      else if( ["\\twisty","\\twistyup"].includes(tok) )
      {
        // just one.
        i= this.astOfTokens( node, tokens, i, i+1);
        this.astLift( node );
        this.astAddEmpty( node, 1);
      }
      else if( ["\\frac"].includes(tok)){
        i= this.astOfTokens( node, tokens, i, i+1);
        i= this.astOfTokens( node, tokens, i, i+1);
        this.astAddUndefined( node, 2);
      }
      else if( this.EndShapes[ tok ] !== undefined ){
        node.endShape1 = this.labelEndOfToken( tok );
        node.endShape2 = ">";
        // optionally match a colour
        i = this.astMayEatColour( node, tokens, i );
        i = this.astOfTokens( node, tokens, i, i+1);
        // Gobble an ending token.
        i = this.astMayGobbleClosingEnd( node, tokens, i );
        this.astAddUndefined( node, 1);
      } 
      else if( ["\\stack"].includes(tok)){
        i= this.astOfTokens( node, tokens, i, i+1);
        this.astLift( node );
        this.astAddUndefined( node, 1);
      }
      else if( ["\\supsub"].includes(tok)){
        i= this.astOfTokens( node, tokens, i, i+1);
        i= this.astOfTokens( node, tokens, i, i+1);
        this.astAddEmpty( node, 2);
      }
      else if( this.fontNames[ tok ] !== undefined ) {
        i= this.astOfTokens( node, tokens, i, i+1);
        this.astAddUndefined( node, 1);
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
    var tok = tokens[ i ] || "";
    if( tok.match( /^#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]$/ )){
      node.colour = tok;
      i+=4;
    }
    return i;
  },
  astMayGobbleClosingEnd( node, tokens, i ){
    var tok = tokens[ i ] || "";
    if( this.EndShapes[ tok ]!== undefined ){
      node.endShape2 = this.labelEndOfToken( tok );
      i+=4;
    }
    return i;
  },
  isFormatter( tok ){
    if( ["{","}"].includes( tok ))
      return true;
    return false;
  },
  measureSubtree( ctx, parent, ast){
    var box = new Box();
    ast.box = box;
    if( !ast )
      return box;
    var tok = ast.token;
    if( tok == "\\frac") 
      return this.measureFrac( ctx, parent, ast);
    if( tok == "\\stack") 
      return this.measureStack( ctx, parent, ast);
    if( tok == "\\supsub") 
      return this.measureSupSub( ctx, parent, ast);
    if( tok == "\\twisty") 
      return this.measureTwisty( ctx, parent, ast);
    if( tok == "\\twistyup") 
      return this.measureTwisty( ctx, parent, ast);
    if( tok == "\\missing") 
      return this.measureMissing( ctx, parent, ast);
    if( ["^","_"].includes( tok )) {
      return this.measureLittleBits( ctx, parent, ast, tok);
    }
    if( this.EndShapes[ tok ] !== undefined ){
      return this.measureMissing( ctx, parent, ast);
    }      
    if( this.fontNames[ tok ] !== undefined)
      return this.measureFontChange( ctx, parent, ast, tok);

    var len = 0;
    if( !this.isFormatter( tok )){
      // adding text
      var text = this.textOfToken(  tok );
      this.setFontForToken( ctx, tok );
      var len = ctx.measureText(text).width;
      var ht  = this.getFontHeight();//8+ctx.measureText("M").width;
      box.addRight( len, ht );
    }
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
  measureFrac( ctx, parent, ast ){
    var box = new Box();
    ast.box = box;
    if( !ast )
      return box;
    var tree = ast.subtree;

    var box1 = this.measureSubtree( ctx, parent, tree[0]);
    var box2 = this.measureSubtree( ctx, parent, tree[1]);
    // don't destroy the subtree boxes.
    box.addDown( box1 ).addDown( box2 ).addDown( new Box(0,7) );
    box.addRight( new Box(10,0));
    tree[1].box = box2.move( 0, 7+box1.height());

    //ast.box = box.expand( 5, 5 );
    ast.box = box;
    return box;
  },
  measureStack( ctx, parent, ast ){
    var box = new Box();
    ast.box = box;
    if( !ast )
      return box;
    var tree = ast.subtree;
    var prev = null;
    for( var subtree of (tree || [])){
      // adding a box of something.
      var height = box.height();
      var box1 = this.measureSubtree( ctx, prev, subtree);
      box.addDown( box1 );
      box1.move( 0, height );
      prev = subtree;
    }
    //ast.box = box.expand( 5, 5 );
    ast.box = box;
    return box;
  },
  measureSupSub( ctx, prev, ast ){
    var box = new Box();
    ast.box = box;
    if( !ast )
      return box;
    var tree = ast.subtree;
    this.pushFont(3);
    var box1 = this.measureSubtree( ctx, prev, tree[0]);
    var box2 = this.measureSubtree( ctx, prev, tree[1]);
    this.popFont();
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
  measureFontChange( ctx, parent, ast, font ){
    this.pushFont(font);
    var box1 = this.measureSubtree( ctx, ast, ast.subtree[0]);
    ast.box = ast.box.addRight( box1 );
    this.popFont();
    return ast.box;
  },
  measureLittleBits( ctx, parent, ast, font ){
    this.pushFont(font);
    var box1 = this.measureSubtree( ctx, ast, ast.subtree[0]);
    //ast.box = ast.box.addRight( box1 );
    this.popFont();
    return ast.box;
  },
  measureTwisty( ctx, parent, ast, font ){
    ast.box = new Box( 30, 20 );
    return ast.box;
  },
  measureMissing( ctx, parent, ast, font ){
    var box1 = this.measureSubtree( ctx, ast, ast.subtree[0]);
    ast.box.addRight( new Box(20,0));    
    ast.box = ast.box.addRight( box1 );
    return ast.box;
  },
  outSubtree( ctx, ast, color ){
    var tok = ast.token;
    if( tok == "\\frac"){
      return this.outFrac( ctx, ast, color);
    }
    if( tok == "\\stack"){
      return this.outStack( ctx, ast, color);
    }
    if( tok == "\\supsub"){
      return this.outSupSub( ctx, ast, color);
    }
    if( tok == "\\twisty"){
      return this.outTwisty( ctx, ast, color);
    }
    if( tok == "\\twistyup"){
      return this.outTwisty( ctx, ast, color);
    }
    if( tok == "\\missing"){
      return this.outMissing( ctx, ast, color);
    }
    if( this.growable.indexOf( tok )>=0){
      return this.outResized( ctx, ast, color );
    }
    if( ["^","_"].includes( tok ))
      return this.outFontChange( ctx, ast, color, tok);
    if( this.EndShapes[ tok ] !== undefined ){
      return this.outMissing( ctx, ast);
    }      
    if( this.fontNames[ tok ] !== undefined)
      return this.outFontChange( ctx, ast, color, tok);

    if( !this.isFormatter( tok )){
      this.outBoxedToken( ctx, ast, color);
    }
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
  // illustrative boxes around the symbols.
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
  mayOutHotBox( ctx, ast ){
    if( ast.jref == undefined)
      return;
    if(ast.jref < 0)
      return;

    var isJref = this.mayPositionJref( ast.jref, ast.box );
    var colorBox = "#0002";
    // hotspot is coloured, normal is grey.
    if( this.isHotspot )
      colorBox = this.hotColourOfAtom( ast.jref );
    if( isJref || this.isHotspot )
      this.outFilledBox( ctx, ast.box, colorBox || "#00f");
  },
  outBoxedToken( ctx, ast, color ){
    this.mayOutHotBox( ctx, ast );
    // hotspots don't draw the text
    if( this.isHotspot ){
      return;
    }
    var v = ast.box.vecs[0];
    var text = this.textOfToken( ast.token );
    this.setFontForToken( ctx, ast.token );
    color = color || this.parent.sym_color || "#950";
    ctx.fillStyle = color;
    //ctx.beginPath();
    ctx.fillText( text, v.x, v.y+this.getFontOffset() );
    this.outBox( ctx, ast.box );
    ctx.textBaseline = "alphabetic";
  },
  outSupSub( ctx, ast, color ){
    var tree = ast.subtree;
    this.pushFont(3);
    var box1 = this.outSubtree( ctx, tree[0], color);
    var box2 = this.outSubtree( ctx, tree[1], color);
    this.popFont();
    this.outBox( ctx, ast.box );
  }, 
  outFrac( ctx, ast, color ){
    var tree = ast.subtree;
    if( !tree )
      return;
    // output the bounding boxes for numerator and denominator
    this.outBox( ctx, tree[0].box );
    this.outBox( ctx, tree[1].box );
    var v = Vector2d( 
      ast.box.vecs[0].x+3, 
      tree[1].box.vecs[0].y-3.5);
    // output the content for numerator and denominator
    var color = color || this.parent.frac_color || "#111";
    this.outSubtree( ctx, tree[0], color );
    this.outSubtree( ctx, tree[1], color );
    // the horizontal bar
    this.outBar( ctx, ast.box.width()-6, v, color);
    this.outBox( ctx, ast.box);
  },
  outStack( ctx, ast, color ){
    var tree = ast.subtree;
    if( !tree )
      return;

    // output the content for each row...
    var color = color || this.parent.frac_color || "#111";
    for( var node of (tree || []) ){
      this.outSubtree( ctx, node, color );
      this.outBox( ctx, node );
    }
    this.outBox( ctx, ast.box);
  },
  outFontChange( ctx, ast, color, font ){
    this.pushFont(font);
    this.outSubtree( ctx, ast.subtree[0], color);
    this.popFont();
  },
  outResized( ctx, ast, color){
    this.pushFont( '\\mathsize3' );
    this.outBoxedToken( ctx, ast, color );
    this.popFont();
  },
  outTwisty( ctx, ast, color){
    this.mayOutHotBox( ctx, ast );
    // hotspots don't draw the text
    if( this.isHotspot ){
      return;
    }
    color = color || this.parent.twisty_color || "#111";
    Twisty.outAst( ctx, ast, ast.subtree[0], color );
    this.outBox( ctx, ast.box);
  }, 
  outMissing( ctx, ast, color){
    color = "#000";

    var va = ast.box.vecs[0].add( 10,0);
    var vc = ast.box.vecs[1].sub( 10,0);
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
    if( this.isHotspot )
    {
      color = this.hotColourOfAtom( ast.jref || 0 );      
      style = { fill: color };
    }
    drawStraightLabel( ctx, ast, style, va, vd, vc, vb );
    this.outSubtree( ctx, ast.subtree[0], color);
    this.outBox( ctx, ast.box);
  },    
  positionSubtree(parent, ast, v){
    var tok = ast.token;
    if( tok == "\\frac" ){
      //this.positionFrac( node, vv);
      this.positionFrac( parent, ast, v );
      return;
    }
    if( tok == "\\stack" ){
      //this.positionFrac( node, vv);
      this.positionStack( parent, ast, v );
      return;
    }
    if( tok == "\\supsub" ){
      //this.positionFrac( node, vv);
      this.positionSupSub( parent, ast, v );
      return;
    }  
    if( tok == "\\twisty" ){
      //this.positionFrac( node, vv);
      ast.box.move( v );
      return;
    }        
    if( tok == "\\twistyup" ){
      //this.positionFrac( node, vv);
      ast.box.move( v );
      return;
    }        
    if( tok == "\\missing" ){
      //this.positionFrac( node, vv);
      this.positionFrac( parent, ast, v );
      return;
    }        
    if( this.EndShapes[ tok ] !== undefined ){
      this.positionFrac( parent, ast, v );
      return;
    }      

    ast.box.move( v );
    var vv = ast.box.vecs[0];
    // These are laid out side by side.
    for( var node of (ast.subtree || []) ){
      var vAlign = 0.5;
      var tok2 = node.token;
      if( tok2 == "^")
        vAlign = 0;
      if( tok2 == "_")
        vAlign = 1;
      var spare = ast.box.height()-node.box.height();
      this.positionSubtree( parent, node, vv.add( 0,spare*vAlign) );
      if( Math.abs(vAlign-0.5)<0.01 )
        vv = vv.add( node.box.width(), 0);
    }
  },
  positionFrac( parent, ast, v){
    ast.box.move( v );
    var vv = ast.box.vecs[0];
    // these are stacked above each other...
    for( var node of (ast.subtree || []) ){
      var spare = ast.box.width()-node.box.width();
      this.positionSubtree( parent, node, vv.add( spare/2,0) );
    }
  },
  positionStack( parent, ast, v){
    ast.box.move( v );
    var vv = ast.box.vecs[0];
    // these are stacked above each other...
    for( var node of (ast.subtree || []) ){
      var spare = ast.box.width()-node.box.width();
      this.positionSubtree( parent, node, vv.add( spare/2,0) );
    }
  },
  positionSupSub( parent, ast, v){
    ast.box.move( v );
    var vv = ast.box.vecs[0];
    // these are stacked above each other...
    for( var i in ast.subtree ) {
      var node = ast.subtree[i];
      var spare = ast.box.height()-node.box.height();
      // subscripts at evenly spaced heights...
      spare = (spare *i)/(ast.subtree.length-1);
      this.positionSubtree( parent, node, vv.add( 0,spare));
    }
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
    this.measureSubtree( ctx, null, ast);
    this.positionSubtree( null, ast, v );
    this.outSubtree( ctx, ast );
    // We could pre-clear all the x,y postions of 
    // jRefs.
//    for( atomIx of obj.jrefAtom || [] ){
//    }
  }
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
    throwOnError: false, displayMode: true
});
    return html;
  },
  htmlInlineOf( str ){
    str = str || "c = \\pm\\sqrt{a^2 + b^2}";
    var html = Jatex.renderToString(str, {
    throwOnError: false, displayMode: false
});
    return html;
  },

}

var Jatex_Fmt = new Jatex_Fmt();
Registrar.register( Jatex_Fmt );

