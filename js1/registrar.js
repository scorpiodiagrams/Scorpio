

//Modules register with the registrar.  Once this is all done, the code knows what all the modules are.
function Registrar(){
  this.modules = {};
  this.inits = [];
  //this.register( this );
  return this;
}



Registrar.prototype ={
  name : "Registrar",
  modules : {},
  classes : {},
  verbs   : {},
  js      : {},

// Configuration paramters:  
  wikiSrc : './wiki/',
  diagramSrc : './diagrams/',
  imageSrc : './images/',
  useUrlChecklist : false,

  debug(A,url,text){
    alert( url );
  },
  register( module ){
    this.modules[ module.name ] = module;
  },
  registerTextFormat( module ){
    this.modules[ module.name ] = module;
  },
  registerClass( classIn ){
    this.classes[ classIn.name ] = classIn;
  },
  registerVerbs( verb ){
    this.verbs[ verb.name ] = verb;
  },
  doInits(){
    inits = this.inits || [];
    for(init of inits)
      init();
    this.inits = [];
  }
}

var Registrar = new Registrar();
var RR = Registrar;
// These are functions made callable from onclick handlers.
var OnFns = Registrar;

