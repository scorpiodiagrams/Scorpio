// Module for mermaid format, a wide ranging format that includes flowcharts
function Mermaid_Fmt(){
  this.counter = 0;
  return this;
}



Mermaid_Fmt.prototype ={
  name : "Mermaid",

  debug(A,url,text){
    alert( url );
  },

  htmlOf( str ){
    //str = str || "c = \\pm\\sqrt{a^2 + b^2}";

    var insertSvg = function(svgCode, bindFunctions){
//        alert(svgCode);
    };
    var graph = mermaid.mermaidAPI.render('graphDiv'+this.counter, str, insertSvg);
    this.counter++;
    var html = graph;//"<div class='mermaid'>"+str+"</div>";
    return html+ "<br clear='all'/>";
  },

  afterLoading(){
    mermaid.initialize({ startOnLoad: false });
  }

}

function scorpioMermaidInit(){
  mermaid.initialize({ startOnLoad: false });
}


Mermaid_Fmt = new Mermaid_Fmt();
Registrar.register( Mermaid_Fmt );
Registrar.inits.push( scorpioMermaidInit );