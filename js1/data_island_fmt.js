

// A null format that does not emit content.
function DatIsland_Fmt(){
  return this;
}

DatIsland_Fmt.prototype ={
  name : "DataIsland",
  debug(A,url,text){
    alert( url );
  },
  quick_plot( spec ){
    var data = spec.data;
    return "Fields are: " + data[0];

  },
  htmlOf( text ){
    var spec = JSON.parse(text);
    return this[spec.func](spec);
  }
}

DatIsland_Fmt = new DatIsland_Fmt();
Registrar.register( DatIsland_Fmt );