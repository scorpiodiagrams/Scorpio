// Scorpio format allows LaTeX embedded in a markdown doc.
function Scorpio_Fmt(){
  this.instance = 0;
  return this;
}

Scorpio_Fmt.prototype ={
  name : "Scorpio",
  outro : ``,
  debug(A,url,text){
    alert( url );
  },
  jsonOf( str ){
    var matches = str.match(/##\s*(.*)/);
    matches = (matches && matches[1]) || 'unspecified';
    var obj = { MindMap: matches };
    var fn = readThing[ matches ] || readMindMap;
    var json = fn( obj, str);
    str = JSON.stringify( json );
    return str;
  },

  htmlOf( str ){
    str = str || "No Scorpio";

    str = str.replace(/\r\n/g,"\n");
    //str = `<div class="raw">${str}</div>\r\n\r\n`;
    var word;
    var words = str.split( /^# /gm );
    words.shift();

    if( str.startsWith( "{" )){
      try {
        // A JSON spec of a Scorpio diagram.
        var json = JSON.parse(str);
        str = JSON.stringify( json );
        // Unique names for cached data.
        word = "!Cached"+(this.instance++);
        words=[ word+"\n" ];
        LocalPages[ word ]="ADD:DATA="+str;
        str="";
      } catch(e) {
        // do nothing with it.
        str = "No Valid JSON";
      }
    }
    else if( str.startsWith( "###" )){
      var matches = str.match(/###\s*(.*)/);
      return "<!--"+matches[1]+"-->";
    }
    else if( str.startsWith( "##" )){
      // A * indented list of elements
      // that form a tree.
      // Convert this to JSON for later processing.
      word = "!Cached**"+(this.instance++);
      words=[ word+"\n" ];
      str = this.jsonOf( str );
      LocalPages[ word ]="ADD:DATA="+str;
      str = "";
    }
    else{
      str = "";
    }

    var wordcount = words.length;

    // the word is either a filename, OR it has been 
    // set to !Cached for a pre-cached 'file'.
    if( wordcount >0 ){

      word = words[0].trim();
      var list = words.join( "").split("\n").join(" ").trim();
      str +=
         `<div id="content_here${this.instance-1}" class="atkContentDiv" data-page="${list}"></div>`;
    }

    str = '<div class="wide_content">'+
      str +
      '</div>';
    return str + "<br clear='all'/>" + this.outro;
  },

  afterLoading(){
    initContent();
    return;
  }

}

Scorpio_Fmt = new Scorpio_Fmt();
Registrar.register( Scorpio_Fmt );

