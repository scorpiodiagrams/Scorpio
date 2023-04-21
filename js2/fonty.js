
Registrar.js.fonty_js = function( Registrar ){

var metaData = 
{ 
  version: "2023-04",
  docString: "Skeleton Fonts (experiments)."
};

// Imports
// var Vector2d = Registrar.classes.Vector2d
// var Box = Registrar.classes.Box;

// Seems we only export by exporting a method into the
// registered object types.
function Exports(){
//  RR.graphFn = graphFn;
}


function Fonty(){
   // Fonty encapsulates a font variolator
   this.P = [];
   this.Table = [];
   var P = this.P;
   this.x=10;
   this.y=10;
   this.chosen = "A";
   this.row=0;
   P.x = 60.0;
   P.y = 100.0;
   P.fyMidH = 0.4; // H midline height.  Also E,F,A,M,W
   P.fyBendJ =0.7; // J bend, also U.
   P.fxTopA = 0.5;
   P.fxMidJ = 0.6; // J centreline.
   P.fxBarF = 0.6; // Reduced length F mid bar.  Also E.
   this.Lookup =[];
   var L = this.Lookup;
   L.E = "abcd";
   L.F = "abc";
   L.H = "age";
   L.L = "ad";
   L.N = "afe";
   L.Z = "bod";
   L.M = "ame";
   L.W = "awe";
   L.X = "fo";
   L.T = "bt";
   L.Y = "my";
   L.I = "ai";
   L.V = "v";
   L.A = "A";
   L.P = "aP";
   L.B = "aPB";
   L.R = "aPR";
   L.K = "aKR";
   L.D = "aD";

   L.O = "O";
   L.Q = "OQ";
   L.C = "C";
   L.G = "CQ";

   L.J = "bJ";
   L.U = "U";
   L.S = "S";

   return this;
}


Fonty.prototype ={
   debug(  ){
      if( !this.ctx )
         return;
      var ctx  = this.ctx;
      ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);

      this.x=10;
      this.y=10;
      this.line = 0;
      //alert( "Coolio: "+this.Params.fyMidH);
      this.drawLetter( "E" );
      this.drawLetter( "F" );
      this.drawLetter( "L" );
      this.drawLetter( "H" );
      this.drawLetter( "N" );
      this.drawLetter( "Z" );
      this.drawLetter( "W" );
      this.drawLetter( "M" );
      this.drawLetter( "I" );
      this.drawLetter( "T" );
      this.drawLetter( "Y" );
      this.drawLetter( "X" );
      this.drawLetter( "V" );
      this.drawLetter( "A" );

      this.x = 10;
      this.y += this.P.y+20;

      this.drawLetter( "B" );
      this.drawLetter( "P" );
      this.drawLetter( "R" );
      this.drawLetter( "K" );
      this.drawLetter( "D" );
      this.drawLetter( "O" );
      this.drawLetter( "Q" );
      this.drawLetter( "C" );
      this.drawLetter( "G" );
      this.drawLetter( "J" );
      this.drawLetter( "U" );
      this.drawLetter( "S" );
      //console.log( this.Table );
   },
   drawLine( x1,y1,x2,y2){
      this.drawBump( x1,y1,x2,y2, 0, 1.0);
   },
   drawLine2( x1,y1,x2,y2){
      var s = new Shape();
      var x=this.x;
      var y=this.y;
      s.addPoint( x+x1,y+y1);
      s.addPoint( x+x2,y+y2);
      s.draw( this.ctx, this.Style );
   },

   
   drawBump( x1,y1,x2,y2,d,percent){
      this.count++;
      d = (typeof d !== 'undefined') ? d : 0;
      percent = (typeof percent !== 'undefined') ? percent : 1.0;
      //console.log("["+x1+","+y1+","+x2+","+y2+","+d.toFixed(2)+","+percent+"],");

      // Table is merely recording the lines drawn....
      this.Table[this.line++]=[fToB(x1),fToB(y1),fToB(x2),fToB(y2),
         d,percent];
      var v1 = Vector2d(this.P.x*x1,this.P.y*y1);
      var v2 = Vector2d(this.P.x*x2,this.P.y*y2);
      var n = v2.sub(v1).normalized().perp().mul( -d );
      n.x *= this.P.x;
      n.y *= this.P.y;      
      var mid = v1.add(v2).mul(0.5);

      var i;
      var theta;
      var vx = v1.sub( mid );
      var vy = n;
      var va = v1.newCopy();
      var nSteps = 16;
      for(i=1;i<=nSteps;i++){
         theta = Math.PI * i * percent /nSteps;
         vb = mid.add( vx.mul( Math.cos( theta))).add( vy.mul( Math.sin(theta)));
         this.drawLine2( va.x, va.y, vb.x, vb.y);
         va = vb.newCopy();
      }
   },  

   drawVee( x1,y1,x2,y2,d){
      var v1 = Vector2d(x1,y1);
      var v2 = Vector2d(x2,y2);
      var n = v2.sub(v1).normalized().perp().mul( -d );
      var mid = v1.add(v2).mul(0.5).add(n);
      this.drawBump( x1,y1, mid.x, mid.y);
      this.drawBump( mid.x, mid.y, x2,y2);
   },   

   drawFace( char ){
      this.line=0;// mess up the line for A.
      var mh = this.P.fyMidH;      
      this.drawBump( 0.1, mh-0.2, 0.9, mh-0.2, 0.2-mh); // head
      this.drawBump( 0.1, mh+0.15, 0.9,mh+0.15,0.9-mh); // chin
      var d = mh*0.11;
      this.drawBump( 0.4, mh+0.3-d, 0.6, mh+0.3-d, +0.05-d/3); // mouth


      this.drawBump( 1,mh, 0.85, mh, -0.1, 0.7);
      this.drawBump( 1,mh, 0.85, mh, 0.1, 0.7);

      this.drawBump( 0,mh, 0.15, mh, -0.1, 0.7);
      this.drawBump( 0,mh, 0.15, mh, 0.1, 0.7);

      var eyeGap = 0.1;
      var eyeSize = 0.07;
      eyeGap +=eyeSize;
      this.drawBump( 0.5-eyeGap-eyeSize,mh, 0.5-eyeGap+eyeSize, mh, -eyeSize/2);
      this.drawBump( 0.5-eyeGap-eyeSize,mh, 0.5-eyeGap+eyeSize, mh, eyeSize/2);

      this.drawBump( 0.5+eyeGap-eyeSize,mh, 0.5+eyeGap+eyeSize, mh, -eyeSize/2);
      this.drawBump( 0.5+eyeGap-eyeSize,mh, 0.5+eyeGap+eyeSize, mh, eyeSize/2);

      this.x+= this.P.x+20;
   },

   drawLetter( char ){
      var P = this.P;
      this.count=0;
      //console.log( "// "+char);
      this.line = 4* (char.charCodeAt(0)-'A'.charCodeAt(0));
      bars = this.Lookup[ char ];
      if( !bars )
         return;

      this.Style = (char == this.Chosen)?TileStyles.yellow:TileStyles.green;
      // E
      if( bars.includes( "a") )
         this.drawBump( 0, 0, 0, 1);//Vertical backbone
      if( bars.includes( "b") )
         this.drawBump( 0, 0, 1, 0);//TopBar
      if( bars.includes( "c") )
         this.drawBump( 0, P.fyMidH, P.fxBarF, P.fyMidH);// MidBar
      if( bars.includes( "d") )
         this.drawBump( 0, 1, 1, 1);// BotBar
      if( bars.includes( "e") )
         this.drawBump( 1, 0, 1, 1);//Vertical backbone
      if( bars.includes( "f") )
         this.drawBump( 0, 0, 1, 1);//Diagonal
      if( bars.includes( "g") )
         this.drawBump( 0, P.fyMidH, 1, P.fyMidH);// 
      if( bars.includes( "o") )
         this.drawBump( 0, 1, 1, 0);//Diagonal
      if( bars.includes( "y") )
         this.drawBump( 0.5, P.fyMidH, 0.5, 1);//Y vertical
      if( bars.includes( "m") )
         this.drawVee( 0,0, 1,0, P.fyMidH);
      if( bars.includes( "w") )
         this.drawVee( 0,1, 1,1, (P.fyMidH-1));
      if( bars.includes( "v") )
         this.drawVee( 0,0, 1,0, 1);
      if( bars.includes( "A") ){
         this.drawVee( 0,1, 1,1, -1);
         this.drawBump(  (1-P.fyMidH)*0.5, P.fyMidH, (1+P.fyMidH)*0.5,P.fyMidH);// 
      }
      if( bars.includes( "t") )
         this.drawBump( P.fxTopA, 0, P.fxTopA, 1);// 
      if( bars.includes( "K") )
         this.drawBump( 0,(P.fyMidH+0.15), 1,0);
      if( bars.includes( "R") )
         this.drawBump( 0.35,(P.fyMidH), 1,1);
      if( bars.includes( "Q") )
         this.drawBump( 1,1,0.35,(P.fyMidH), 0, 0.5);
      if( bars.includes( "P") )
         this.drawBump( 0,0, 0,P.fyMidH, -1);
      if( bars.includes( "B") )
         this.drawBump( 0,P.fyMidH, 0, 1, -1);
      if( bars.includes( "D") )
         this.drawBump( 0,0, 0,1, -1);
      if( bars.includes( "O") ){
         this.drawBump( 0,0.5, 1, 0.5, -0.5);
         this.drawBump( 0,0.5, 1, 0.5, 0.5);
      }
      if( bars.includes( "C") ){
         this.drawBump( 0,0.5, 1, 0.5, -0.5, 0.7);
         this.drawBump( 0,0.5, 1, 0.5, 0.5, 0.7);
      }
      if( bars.includes( "S") ){
         var L = 0.2;
         var XX = 0.5;//L+(1-2*L)*(1-P.fyMidH);
         var YY = L+(1-2*L)*P.fyMidH;
         this.drawBump( XX,YY, XX, 0, -0.3, 1.4);
         this.drawBump( XX,YY, XX, 1, -0.4, 1.5);
      }


      if( bars.includes( "J") ){
         this.drawBump( P.fxMidJ,0,           P.fxMidJ, P.fyBendJ);
         this.drawBump( 0, P.fyBendJ, P.fxMidJ,P.fyBendJ, (1-P.fyBendJ));
      }
      if( bars.includes( "U") ){
         this.drawBump( 0,0, 0, P.fyBendJ);
         this.drawBump( 1,0, 1, P.fyBendJ);
         this.drawBump( 0,P.fyBendJ, 1, P.fyBendJ, (1-P.fyBendJ));
      }


      if( bars.includes( "i") ){
         this.x -= this.P.x * 1.15;
      }
      this.x+= this.P.x+20;

      // fills up the rest of the table with zeroes.
      while( this.count <4 )
      {
         this.drawBump( 0,0,0,0,0,0);
      }
   }
}


function createIcon(A,obj,d){
  A.fonty = new Fonty();
}

function drawIcon(A,obj,d){
  var f = A.fonty;
  f.ctx = A.BackingCanvas.ctx;
  f.x = 30;
  f.y = 30;
  f.P.fyMidH = 0.4;
  f.drawLetter("D");
  f.drawLetter("U");
  f.drawLetter("B");
  f.drawLetter("I");
  f.drawLetter("O");
  f.drawLetter("U");
  f.drawLetter("S");
  f.x = 60;
  f.y = 160;
  f.drawLetter("F");
  f.drawFace("F");
  f.P.fyMidH = 0.6;
  f.drawFace("F");
  f.drawLetter("A");
  f.drawLetter("C");
  f.drawLetter("E");
  f.drawLetter("S");
}

function registerFontyMethods()
{
  var reg = registerMethod; // abbreviation.
  reg( "Icon",    createIcon, 0, 0, drawIcon);

}

Registrar.inits.push( registerFontyMethods );

Exports();

return metaData;
}( Registrar );// end of workhorse_js



