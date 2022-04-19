// Katex format allows LaTeX embedded in a markdown doc.
function Katex_Fmt(){
  return this;
}



Katex_Fmt.prototype ={
  name : "Katex",

  debug(A,url,text){
    alert( url );
  },

  htmlOf( str ){
    str = str || "c = \\pm\\sqrt{a^2 + b^2}";
    var html = katex.renderToString(str, {
    throwOnError: false, displayMode: true
});
    return html;
  },
  htmlInlineOf( str ){
    str = str || "c = \\pm\\sqrt{a^2 + b^2}";
    var html = katex.renderToString(str, {
    throwOnError: false, displayMode: false
});
    return html;
  },

}

Katex_Fmt = new Katex_Fmt();
Registrar.register( Katex_Fmt );

