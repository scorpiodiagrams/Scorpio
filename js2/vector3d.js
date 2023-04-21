
function Vector3d(x,y,z) {
   if( x instanceof Vector2d ){
      // upgrade 2d vector to projective/3d
      // that is why z is 1.
      return new Vector3d(xx,x.y,1);
   }
   if( this instanceof Vector3d ){
      this.x=x||0;
      this.y=y||0;
      this.z=z||0;
      return this;
   }
   return new Vector3d(x,y,z);
}

Vector3d.prototype = {
   mul(v) {
      if( v instanceof Vector3d )
         return new Vector3d(
            this.x * v.x,
            this.y * v.y,
            this.z * v.z
         );
      return new Vector3d(
         this.x * v,
         this.y * v,
         this.z * v
      );
   },
   div(v) {
      if( v instanceof Vector3d )
         return new Vector3d(
            this.x / v.x,
            this.y / v.y,
            this.z / v.z
         );
      return new Vector3d(
         this.x / v,
         this.y / v,
         this.z / v
      );
   },
   min(v) {
      if( v instanceof Vector3d )
         return new Vector3d(
            Math.min(this.x, v.x),
            Math.min(this.y, v.y),
            Math.min(this.z, v.z)
         );
      return new Vector3d(
         Math.min(this.x, v),
         Math.min(this.y, v),
         Math.min(this.z, v)
      );
   },
   max(v) {
      if( v instanceof Vector3d )
         return new Vector3d(
            Math.max(this.x, v.x),
            Math.max(this.y, v.y),
            Math.max(this.z, v.z)
         );
      return new Vector3d(
         Math.max(this.x, v),
         Math.max(this.y, v),
         Math.max(this.z, v)
      );
   },
   add(v) {
      return new Vector3d(
         this.x + v.x,
         this.y + v.y,
         this.z + v.z
      );
   },
   sub(v) {
      return new Vector3d(
         this.x - v.x,
         this.y - v.y,
         this.z - v.z
      );
   },
   blend(v,t) {
      return new Vector3d(
         this.x + t*(v.x-this.x),
         this.y + t*(v.y-this.y),
         this.z + t*(v.z-this.z)
      );
   },
   floor() {
      return new Vector3d(
         Math.floor(this.x),
         Math.floor(this.y),
         Math.floor(this.z)
      );
   },
   round() {
      return new Vector3d(
         Math.round(this.x),
         Math.round(this.y),
         Math.round(this.z)
      );
   },
   ceil() {
      return new Vector3d(
         Math.ceil(this.x),
         Math.ceil(this.y),
         Math.ceil(this.z)
      );
   },
   abs() {
      return new Vector3d(
         Math.abs(this.x),
         Math.abs(this.y),
         Math.abs(this.z)
      );
   },
   newCopy() {
      return new Vector3d(
         this.x,
         this.y,
         this.z
      );
   },
   isAtLeast(v) {
      return 
         (this.x>=v.x) &&
         (this.y>=v.y) &&
         (this.z>=v.z);
   },
   isGreaterThan(v) {
      return 
         (this.x>v.x) &&
         (this.y>v.y) &&
         (this.z>v.z);
   },
   isNoMoreThan(v) {
      return 
         (this.x<=v.x) &&
         (this.y<=v.y) &&
         (this.z<=v.z);
   },
   isLessThan(v) {
      return 
         (this.x<v.x) &&
         (this.y<v.y) &&
         (this.z<v.z);
   },
   assignFrom(v) {
      this.x=v.x;
      this.y=v.y;
      this.z=v.z
   },
   dot(v) {
      return 
         this.x * v.x +
         this.y * v.y +
         this.z * v.z;
   },
   length() {
      return Math.sqrt(
         this.x * this.x +
         this.y * this.y +
         this.z * this.z
      );
   },
   asString() {
      return  (
         "x: " + this.x+ ", " +
         "y: " + this.y+ ", " +
         "z: " + this.z
      );
   },
   setTo(x,y,z){ return this.Vector3d(x,y,z);},
   constrain( low, v, high ){ this.assignFrom(v.max( low ).min( high ));return this;},
   isInBox( low, v, high ){ return v.isAtLeast( low ) && v.isNoMoreThan( high );},
   normalize(){ this.assignFrom(this.mul( 1/this.length()));return this;},
};
