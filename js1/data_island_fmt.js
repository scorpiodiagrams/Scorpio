

// A null format that does not emit content.
function DataIsland_Fmt(){
  return this;
}

DataIsland_Fmt.prototype ={
  name : "DataIsland",
  debug(A,url,text){
    alert( url );
  },
  delayed_quick_plot( canv ){
    var ctx = canv.getContext('2d');
    var data = this.data;
    var rowHeight =20;
    var graphWidth = 500;
    var nRows = data.length -1;
    ctx.font = "14px Arial";
    ctx.fillStyle = "#000070";
    ctx.textAlign = "left";
    graphWidth = 100;
    var max = [];
    for( var col = 2;col<=5;col++){
      var m=0;
      for(var i=1;i<=nRows;i++){
        var t = data[i][col];
        if(t>m)
          m=t;
        max[col]= m;
      }
    }
    for( var i=1;i<=nRows;i++){
      text = data[i][1];
      ctx.fillText(text, 20, i*rowHeight + 10);
      for( var col=2;col<=5;col++){
        var x = 100 + (col-2) * (graphWidth+5);
        var x1 = x+ (graphWidth*data[i][col])/max[col];
        var y = i*rowHeight;
        var y1 = y+ rowHeight - 5;
        ctx.fillRect( x,y,x1-x,y1-y);
      }
    }
  },
  quick_plot( spec ){
    var data = spec.data;
    this.data = data;
    var result = "";
    result += "Fields are: " + data[0];
    var rowHeight =20;
    var graphWidth = 500;
    var nRows = data.length -1;
    result+=`<canvas width=${graphWidth} height=${nRows*rowHeight+30}>Canvas not supported</canvas><img src onerror='DataIsland_Fmt.delayed_quick_plot(this.previousSibling)'><br>Bar`;
    return result;
  },
  htmlOf( text ){
    var spec = JSON.parse(text);
    return this[spec.func](spec);
  }
}

DataIsland_Fmt = new DataIsland_Fmt();
Registrar.register( DataIsland_Fmt );