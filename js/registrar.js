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
  doInits(){
    inits = this.inits;
    for(init of inits)
      init();
    this.inits = [];
  }
}

Registrar = new Registrar();

