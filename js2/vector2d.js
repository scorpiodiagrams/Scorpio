
function Vector2d(x,y) {
   if( this instanceof Vector2d ){
      this.x=x||0;
      this.y=y||0;
      return this;
   }
   return new Vector2d(x,y);
}

Vector2d.prototype = {
   itemNames: ["x","y"],
   makeIterator: function(){ return new Iterator( this );},
   mul(v,y) {
      if( y!==undefined)
         v = Vector2d( v, y);
      else if( v instanceof Vector2d )
         return new Vector2d(
            this.x * v.x,
            this.y * v.y
         );
      return new Vector2d(
         this.x * v,
         this.y * v
      );
   },
   div(v,y) {
      if( y!==undefined)
         v = Vector2d( v, y);
      else if( v instanceof Vector2d )
         return new Vector2d(
            this.x / v.x,
            this.y / v.y
         );
      return new Vector2d(
         this.x / v,
         this.y / v
      );
   },
   min(v,y) {
      if( y!==undefined)
         v = Vector2d( v, y);
      else if( v instanceof Vector2d )
         return new Vector2d(
            Math.min(this.x, v.x),
            Math.min(this.y, v.y)
         );
      return new Vector2d(
         Math.min(this.x, v),
         Math.min(this.y, v)
      );
   },
   max(v,y) {
      if( y!==undefined)
         v = Vector2d( v, y);
      else if( (v.x !== undefined) && (v.y !== undefined) )
         return new Vector2d(
            Math.max(this.x, v.x),
            Math.max(this.y, v.y)
         );
      return new Vector2d(
         Math.max(this.x, v),
         Math.max(this.y, v)
      );
   },
   add(v, y) {
      if( y!==undefined)
         v = Vector2d( v, y);
      return new Vector2d(
         this.x + v.x,
         this.y + v.y
      );
   },
   sub(v, y) {
      if( y!==undefined)
         v = Vector2d( v, y);
      return new Vector2d(
         this.x - v.x,
         this.y - v.y
      );
   },
   blend(v,t) {
      return new Vector2d(
         this.x + t*(v.x-this.x),
         this.y + t*(v.y-this.y)
      );
   },
   floor() {
      return new Vector2d(
         Math.floor(this.x),
         Math.floor(this.y)
      );
   },
   round() {
      return new Vector2d(
         Math.round(this.x),
         Math.round(this.y)
      );
   },
   ceil() {
      return new Vector2d(
         Math.ceil(this.x),
         Math.ceil(this.y)
      );
   },
   abs() {
      return new Vector2d(
         Math.abs(this.x),
         Math.abs(this.y)
      );
   },
   newCopy() {
      return new Vector2d(
         this.x,
         this.y
      );
   },
   isAtLeast(v, y) {
      if( y!==undefined)
         v = Vector2d( v, y);
      return 
         (this.x>=v.x) &&
         (this.y>=v.y);
   },
   isGreaterThan(v,y) {
      if( y!==undefined)
         v = Vector2d( v, y);
      return 
         (this.x>v.x) &&
         (this.y>v.y);
   },
   isNoMoreThan(v,y) {
      if( y!==undefined)
         v = Vector2d( v, y);
      return 
         (this.x<=v.x) &&
         (this.y<=v.y);
   },
   isLessThan(v,y) {
      if( y!==undefined)
         v = Vector2d( v, y);
      return 
         (this.x<v.x) &&
         (this.y<v.y);
   },
   assignFrom(v,y) {
      if( y!==undefined)
         v = Vector2d( v, y);
      this.x=v.x;
      this.y=v.y
   },
   dot(v,y) {
      if( y!==undefined)
         v = Vector2d( v, y);
      var b = this.x * v.x +
         this.y * v.y; 
      return b;
   },
   length() {
      return Math.sqrt(
         this.x * this.x +
         this.y * this.y
      );
   },
   asString() {
      return  (
         "x: " + this.x+ ", " +
         "y: " + this.y
      );
   },
   rot( theta ){
      var c = Math.cos( theta );
      var s = Math.sin( theta );
      return new Vector2d( c*this.x + s*this.y,
       -s*this.x + c*this.y);
   },
   slope(){
      if( this.y==0 && this.x==0)
         return 0;
      return Math.atan2( this.y, this.x);
   },
   normMax(){
      return Math.max( Math.abs(this.x),Math.abs(this.y));
   },
   setTo(x,y){ return this.Vector2d(x,y);},
   constrain( low, v, high ){ this.assignFrom(v.max( low ).min( high ));return this;},
   isInBox( low, v, high ){ return v.isAtLeast( low ) && v.isNoMoreThan( high );},
   normalized(len){ return this.mul( firstValid(len,1)/this.length())},
   perp(m){
      m = firstValid( m, 1);
      return Vector2d( m*this.y, -m*this.x);
   }
};

function asVector2d( v ){
   return Vector2d.prototype.newCopy.call( v );
}
function setFromVector2d( x, v ){
   return Vector2d.prototype.assignFrom.call( x, v );
}



Registrar.js.utils_js = function( Registrar ){


var metaData = 
{ 
  version: "2023-02",
  docString: "Utilities"
};

// Imports
// var Vector2d = Registrar.classes.Vecotr2d

function Exports(){
  // Namespaced  formats classes and verbs
  // These are all for export.
  Registrar.registerClass( Box );
  // Global Exports 
  // These pollute the main namespace
}

// Now all our declarations...
function Box(x,y){
  if((x!==undefined)&&(y == undefined))
  {
    this.vecs = [Vector2d(0,0),Vector2d(0,0)];
    this.merge( x );
    return this;
  }
  x = x || 0;
  y = y || 0
  this.vecs = [Vector2d(0,0),Vector2d(x,y)];
  return this;
}

Box.prototype ={
  name: "Box",
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
  merge2( box, by ){
    if( by !== undefined){
      var v = Vector2d( box, by);
      box = new Box();
      box.vecs[1]=v;
    }
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
  addBox( b ){
    v = this.diagonal().add( b.diagonal());
    this.vecs[0] = Vector2d(0,0);
    this.vecs[1] = v;
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


Exports();

return metaData;
}( Registrar );// end of utils_js

