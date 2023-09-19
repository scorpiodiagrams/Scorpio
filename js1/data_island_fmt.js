

// A null format that does not emit content.
function DataIsland_Fmt(){
  return this;
}

DataIsland_Fmt.prototype ={
  name : "DataIsland",
  debug(A,url,text){
    alert( url );
  },
  drawTime( ctx, data, i,j,x, y ){
    ctx.fillStyle = "#005070";
    var value = data[i][j]*200;
    if( j != 5)
    {
      // 30 GB/s for PCIe 4
      // 4 Bytes per float
      // x1000 for ms
      value = (value *4)/30000000.0;
      // Maybe 2 Transfers per float? No, don't account for that.
    }
    else
    {
      // 61 TFLOPs for RX 7900 XTX
      // x1000 for ms
      value = value/61000000.0;
    }
    value = Math.round( value *1000)/1000;
    value = value + " ms";
    ctx.fillText(value, x+4, y + 10);
  },
  delayed_quick_plot( canv ){
    var ctx = canv.getContext('2d');
    var data = this.data;
    var rowHeight =20;
    var graphWidth = 500;
    var nRows = data.length -1;
    ctx.font = "14px Arial";
    ctx.fillStyle = "#00007060";
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
    for( var col=2;col<=5;col++){
      var x = 100 + (col-2) * (graphWidth+5);
      var y = 0;//i*rowHeight;
      ctx.fillStyle = "#000070";
      ctx.textAlign = "left";
      ctx.fillText(data[0][col], x, y + 10);
    }
    for( var i=1;i<=nRows;i++){
      text = data[i][1];
      ctx.fillStyle = "#000070";
      ctx.textAlign = "right";
      ctx.fillText(i,    20, i*rowHeight + 10);
      ctx.textAlign = "left";
      ctx.fillText(text, 30, i*rowHeight + 10);
      for( var col=2;col<=5;col++){
        var x = 100 + (col-2) * (graphWidth+5);
        var x1 = x+ (graphWidth*data[i][col])/max[col];
        var y = i*rowHeight;
        var y1 = y+ rowHeight - 2;
        ctx.fillStyle = "#00007060";
        ctx.fillRect( x,y-4,x1-x,y1-y);
        this.drawTime( ctx, data, i, col, x,y);
      }
    }
  },
  quick_plot( spec ){
    var data = spec.data;
    this.data = data;
    var result = "<br>";
    var rowHeight =20;
    var graphWidth = 500;
    var nRows = data.length -1;
    result+=`<canvas width=${graphWidth} height=${nRows*rowHeight+30}>Canvas not supported</canvas><img src onerror='DataIsland_Fmt.delayed_quick_plot(this.previousSibling)'>`;
    return result;
  },
  htmlOf( text ){
    var spec = JSON.parse(text);
    return this[spec.func](spec);
  }
}

DataIsland_Fmt = new DataIsland_Fmt();
Registrar.register( DataIsland_Fmt );