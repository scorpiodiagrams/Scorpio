var scorpio ={};

scorpio.scriptUrl = 'http://www.scorpiodiagrams.com'
scorpio.validModules = 
{
  'mermaid':[
    "/mermaid/mermaid.js",
    "/js/mermaid_fmt.js"],
  'katex': [
    "/katex/katex.min.js",
    "/katex/contrib/auto-render.min.js",
    "/js/katex_fmt.js"],
  'diagrams':[
//    "/js/registrar.js",
    "/scorpio/scorpiodiagrams.js",
    "/scorpio/getters.js",
    "/scorpio/details_panel.js",
    "/scorpio/annotator.js",
    "/scorpio/curves.js",
    "/scorpio/vector2d.js",
    "/scorpio/shape.js",
    "/scorpio/readers.js",
    "/scorpio/writers.js",
    "/scorpio/smiles.js",
    "/scorpio/workhorse.js",
    "/scorpio/config.js",
    "/js/loader.js",
    "/js/dom_utils.js",
    "/js/jatex_fmt.js",
    "/js/markdown_fmt.js",
    "/js/omnia_fmt.js",
    "/js/raw_fmt.js",
    "/js/scorpio_fmt.js",
    "/js/editor_fmt.js"],
  'annotations':[],
  'extra':[
    "/js/hide_fmt.js",
    "/scorpio/nurb.js"],
  'experimental':[
    "/js/mediawiki_fmt.js",  
    "/js/anki_fmt.js",
    "/js/wordlist_fmt.js",
    "/scorpio/curves.js",
    "/scorpio/kwic.js",
    "/scorpio/fonty.js",
    "/scorpio/vector3d.js"]
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
