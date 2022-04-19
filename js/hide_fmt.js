

// WikiWords with info cards
function Hide_Fmt(){
  return this;
}

Hide_Fmt.prototype ={
  name : "Hide",
  debug(A,url,text){
    alert( url );
  },
  htmlOf( text ){
    return "";
  }
}

Hide_Fmt = new Hide_Fmt();
Registrar.register( Hide_Fmt );