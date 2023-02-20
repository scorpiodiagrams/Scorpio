
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
      else if( v instanceof Vector2d )
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


