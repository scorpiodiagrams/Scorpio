

Registrar.js.multiscroller_js = function( Registrar ){

var metaData = 
{ 
  version: "2023-07",
  docString: "Multiscroller. Holds the divs that have the multiscroller text, and can do positioning of them. "
};

// Imports
// var Vector2d = Registrar.classes.Vector2d
// var Box = Registrar.classes.Box;

function Exports(){
  // Namespaced  formats classes and verbs
  Registrar.registerClass( Multiscroller );
  RR.MultiscrollerDivs = MultiscrollerDivs;
}

var MultiscrollerDivs = [];

// Constructs a Multiscroller object
// A Multiscroller object...
class Multiscroller{

  constructor(){
    var M = this;
    M.initMultiscroller();
    return M;
  }

  initMultiscroller(){
    var M = this;
    M.nDivs = 10;
    for( var i=0;i<M.nDivs;i++){
      var T = {};
      RR.makeInfoCard( T );
      //T.InfoCardDiv.style.display = "block";
      MultiscrollerDivs.push( T );
    }
    return this;
  }
}

Exports();

return metaData;
}( Registrar );// end of multiscroller_js

