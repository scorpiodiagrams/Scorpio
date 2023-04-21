var scorpio ={};

scorpio.scriptUrl = 'http://www.scorpiodiagrams.com'
scorpio.validModules = 
{
  'mermaid':[
    "/mermaid/mermaid.js",
    "/js1/mermaid_fmt.js"],
  'katex': [
    "/katex/katex.min.js",
    "/katex/contrib/auto-render.min.js",
    "/js1/katex_fmt.js"],
  'diagrams':[
//    "/js1/registrar.js",
    "/js2/utils.js",
    "/js2/annotator.js",
    "/js2/scorpiodiagrams.js",
    "/js2/getters.js",
    "/js2/details_panel.js",
    "/js2/curves.js",
    "/js2/vector2d.js",
    "/js2/shape.js",
    "/js2/readers.js",
    "/js2/writers.js",
    "/js2/smiles.js",
    "/js2/workhorse.js",
    "/js2/config.js",
    "/js1/loader.js",
    "/js1/dom_utils.js",
    "/js1/jatex_fmt.js",
    "/js1/markdown_fmt.js",
    "/js1/omnia_fmt.js",
    "/js1/raw_fmt.js",
    "/js1/scorpio_fmt.js",
    "/js1/editor_fmt.js"],
  'annotations':[],
  'extra':[
    "/js1/hide_fmt.js",
    "/js2/nurb.js"],
  'experimental':[
    "/js1/mediawiki_fmt.js",  
    "/js1/anki_fmt.js",
    "/js1/wordlist_fmt.js",
    "/js2/curves.js",
    "/js2/kwic.js",
    "/js2/fonty.js",
    "/js2/vector3d.js"]
};

scorpio.load = function(modules){
  modules = modules.split(" ");
  var str = "in scorpio.load()\r\n";
  var bad = 0;
  for( module of modules){
    if( scorpio.validModules[ module ])
      str += `  '${module}' found\r\n`;
    else{
      str += `  '${module}' not found\r\n`;
      bad++;
    }
  }
  console.log( str );
  if( bad ){
    alert( str );
    return;
  }
  scorpio.toLoad = modules;
}

scorpio.gotAFile = function( file  ){
  console.log( `got file ${file}\r\n`);
  scorpio.loadCount--;
  if( scorpio.loadCount != 0)
    return;
  console.log( `got them all...\r\n`);
  Registrar.doInits();
  Registrar.imageSrc = scorpio.scriptUrl + "/images/";
  scorpio.onLoadCallBack();
}

scorpio.setOnLoadCallback = function(callBack){
  var haveScripts = false;
  var url = scorpio.scriptUrl;
  scorpio.onLoadCallBack = callBack;
  if( scorpio.toLoad ){
    console.log("I'm loading js files now....");
    scorpio.loaded = [];
    scorpio.loadCount = 0;
    var files;
    for( module of scorpio.toLoad ){
      files = scorpio.validModules[ module ];
      if( !files)
        continue;
      for( file of files )
      {
        scorpio.loaded.push( url+file );
        scorpio.loadCount++;
      }
    }

    var link
    link = document.createElement('link');
    link.rel="stylesheet";
    link.href="http://www.scorpiodiagrams.com/katex/katex.min.css";
    document.head.appendChild(link);
    link = document.createElement('link');
    link.rel="stylesheet";
    link.href="http://www.scorpiodiagrams.com/main.css";
    document.head.appendChild(link);

    files = scorpio.loaded;
    for( f in files ){
      var A = {};
      A.index = f;

      var script = document.createElement('script');
      var file = files[f];
      script.onload = 
        (function(ff){
          return function(){
           scorpio.gotAFile( ff);
          }
        })(file);
      script.src = file;
      document.head.appendChild(script);
    }
  }
}

scorpio.diagram = function(){
//  alert( "scorpio.diagram() called before scorpio modules were loaded");
  return this;
}


scorpio.diagram.prototype ={
  setDiv( div ){
    this.div = div;
  },
  setSpec( text )
  {
    console.log( text );

    Markdown_Fmt.hasBigLogo = false;
    var module = Omnia_Fmt;
    //text = text.replace( /^\w*([\s\S]*?)\w*$/m, "$1");
    text = text.trim();
    var str = module.htmlOf( "!!Scorpio\r\n"+text );
    this.div.innerHTML =  str;
    module.afterLoading( {"fmt_init":true});
  }
}


//Modules register with the registrar.  Once this is all done, the code knows what all the modules are.
function Registrar(){
  this.modules = {};
  this.inits = [];
  this.classes={};
  this.js={};
  this.verbs={};
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

Registrar = new Registrar();
