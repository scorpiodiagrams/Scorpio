//Modules register with the registrar.  Once this is all done, the code knows what all the modules are.
function Registrar(){
  modules = {};
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
  useUrlChecklist : true,

  debug(A,url,text){
    alert( url );
  },
  register( module ){
    this.modules[ module.name ] = module;
  }

}

Registrar = new Registrar();

