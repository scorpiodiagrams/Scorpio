// >>>>>>>>>>>>>>> Kwic


function drawGeshi(A, obj, d){
  if( d.stage !== kStageFillAndText )
    return;

  //console.log( "draw - "+obj.type);
  var {x,y,xw,yh} = getBox( obj );

  // This sizing/font matches typical appearance of <pre> element.
  var ctx = A.BackingCanvas.ctx;
  ctx.font = "13px monospace";

  // Approximate height (as M is 'square' );
  // Advanced metrics not supported in firefox or ie or edge.
  var textHeight = (ctx.measureText( "M").width *1.8);

  var i;
  var lines = obj.value.split( "\n" );
  for( i = 0;i< lines.length; i++){
    var str = lines[i];

    ctx.fillText(str,
      x ,
   y + textHeight*(i+1.5));
/*
    if( obj.hotspotColour ){
      var ctx2 = A.HotspotsCanvas.ctx;
      ctx2.beginPath();
      ctx2.rect(x, y, xw, yh);
      ctx2.fillStyle = obj.hotspotColour;
      ctx2.fill();
    }
 */
  }
}

function drawKwic(A, obj, d){
  if( d.stage !== kStageFillAndText && ( d.stage !== kStageHots ) )
    return;

  //console.log( "draw - "+obj.type);
  var {x,y,xw,yh} = getBox( obj );

  if( !isDefined( obj.offset )){
    obj.offset = {x:xw/3, y:0};//y:yh*20};
  }

  // This sizing/font matches typical appearance of <pre> element.
  var ctx = A.BackingCanvas.ctx;
  ctx.font = "13px monospace";

  // Approximate height (as M is 'square' );
  // Advanced metrics not supported in firefox or ie or edge.
  var oneSpace = ctx.measureText( "M").width;
  obj.oneSpace = oneSpace;
  var textHeight = oneSpace *1.8;
  var textLineSpacing = textHeight;
  var kwicSpace = oneSpace;

  var i;
  var lines = Math.floor( yh/textLineSpacing );
  var D = obj.permutedIndex;

  y+= 1.5*textLineSpacing;


  // Calculate new offset
  var dd = newPos( A, obj );
  // And always accept it.
  onLockInMove(A,obj,dd);

  var offsetX = obj.offset.x;
  var offsetY = obj.offset.y;

/*
  if( A.Status.click ){
    offsetX += A.Status.move.x-A.Status.click.x;
    offsetY += A.Status.move.y-A.Status.click.y;

  }
*/

  var dx = offsetX;
  var iStart = -Math.floor(offsetY / textLineSpacing);
  var dy = iStart * textLineSpacing+offsetY;
  var str;
  var S;
  var r=6;
  var r2=2;

  obj.ruledBackgroundPhase = obj.ruledBackgroundPhase || 0;

  if( d.stage === kStageFillAndText )
  {
    var nChars = Math.floor( xw / kwicSpace );
    for( i = iStart-1;i< Math.min( iStart+lines, D.length); i++){
      if( i < 0 ) continue;
      str = D[i];
      str = str.split(" ~")[0];
      str = mayPadBefore(str, ":< ", nChars);

      S = {
        x: x,
        y: y + dy + textLineSpacing * (i - iStart-1) +3
      };

      //The background rectangles that help the eye follow text.
      var c = (((i+obj.ruledBackgroundPhase)%5)<3);
      //
//    ctx.fillStyle = c ? "rgba(50,80,200,0.2)" : "rgba(100,160,220,0.2)";
      ctx.fillStyle = c ? "rgba(214,220,244,1.0)" : "rgba(224,236,248,1.0)";
      ctx.beginPath();
      ctx.rect(S.x , S.y , xw, textLineSpacing -1);
      ctx.closePath();
      ctx.fill();


      ctx.fillStyle = "rgb(0,0,0)";
      ctx.textAlign = "right";
      ctx.fillText(str, x + dx - kwicSpace,
        y + dy + textLineSpacing * (i - iStart));
      ctx.textAlign = "left";
      ctx.fillText(str, x + dx, y + dy + textLineSpacing * (i - iStart));


      //The blue info blobs (that on hover give the details panel for that row)
      S = {
        x: x + dx - kwicSpace / 2 + 1,
        y: y + dy + textLineSpacing * (i - iStart) - kwicSpace / 2
      };
      ctx.fillStyle = "rgb(100,100,250)";
      ctx.beginPath();
      ctx.rect(S.x - r2, S.y - r, r2 * 2, r * 2);
      //ctx.arc(S.x, S.y, r, 0, 2 * Math.PI, false);
      ctx.closePath();
      ctx.fill();
    }
  }

  r2=4; // increase width for hotspot use.

  if(  d.stage === kStageHots ){
    var c = A.nextAutoColour("");
    addDown(A,["clickObject",obj.id]);
    var ctx2 = A.HotspotsCanvas.ctx;
    ctx2.beginPath();
    ctx2.rect(x, y-1.5*textLineSpacing, xw, yh);
    ctx2.fillStyle = c;
    ctx2.fill();

    if( A.Hotspots && A.Hotspots.autoColourIx)
      A.Hotspots.autoColourIx += lines;

    var str2;
    for( i = iStart-1;i< Math.min( iStart+lines, D.length); i++){
      if( i < 0 ) continue;
      var parts = D[i].split(" ~");

      if( obj.longlist ){
        var index = parseInt( parts[1] ) || 0;
        str2 = obj.longlist[index];
        var split = str2.split("\n" );
        if( (obj.source === "BugTitles") &&  (split.length > 2 ) ){
          split[0] = split[0].replace(/^(.*?):/, "<b>Bug <a href='https://bugzilla.audacityteam.org/show_bug.cgi?id=$1'>$1</a>:</b> " );
          str2 = split[0]+
            "<br><br><b>"+
            anchorTagFromWikipathwyaName(split[1])+
            "</b><br><br>"+
            split[2]+
            "";
        }
        else if( split.length > 3 ){
          str2 = split[0]+
            "<br><b>"+
            anchorTagFromPmcid(split[3])+
            "</b><br><br>"+
            split[2]+
            "</div><div style='font-size:75%;line-height:90%'><br><em>"+
            split[1]+
            "</em></div><div>";
        }
        else if( split.length > 2 ){
          str2 = split[0]+
            "<br><br><b>"+
            anchorTagFromWikipathwyaName(split[1])+
            "</b><br><br>"+
            split[2]+
            "";
        }
      }
      else {
        str2 = parts[0].split(":<", 2);
        str2 = "PMCID date<br>" + str2[1] +
          " <span style='color:blue'>&#9474;</span>" + str2[0].trimStart() +
          "<br>Authors";
        str2 = ""+i+": "+str2;
      }


      S= {x: x+dx-kwicSpace/2+1, y: y+ dy + textLineSpacing*(i-iStart)-kwicSpace/2};
      ctx2.fillStyle = A.nextAutoColour( str2, true );
      ctx2.beginPath();
      ctx2.rect( S.x-r2, S.y-r, r2*2, r*2 );
      //ctx.arc(S.x, S.y, r, 0, 2 * Math.PI, false);
      ctx2.closePath();
      ctx2.fill();


    }

  }
}


function reselectInKwic( obj,row ){
  if( obj.selected ){
    var X = obj.permutedIndex;
    var index = bSearch(X, obj.selected + " ~ZZZ");
    console.log("found at: " + index);
    console.log("value: " + X[index]);
    if( obj.oneSpace ){
      var textHeight = obj.oneSpace *1.8;
      //var row = Math.floor(A.Status.click.y / textHeight -0.5);
      index = index-row;
      obj.ruledBackgroundPhase -= (obj.offset.y)/textHeight;
      obj.offset.y -= index*textHeight;
      obj.ruledBackgroundPhase += (obj.offset.y)/textHeight;
      obj.ruledBackgroundPhase = obj.ruledBackgroundPhase % 10;
    }
  }
}

function onKwicClicked(A, obj){
  var x = obj.pos.x;
  var y = obj.pos.y;
  var xw = obj.rect.x;
  var yh = obj.rect.y;
  if( !obj.oneSpace )
    return;
  if( !A.Status.click )
    return;
  onDraggableClicked( A, obj );

/*
  // Calculate new offset
  var dd = newPos( A, obj );
  // And always accept it.
  onLockInMove(A,obj,dd);

  var offsetX = obj.offset.x;
  var offsetY = obj.offset.y;
*/


  var offsetX = -obj.offset.x;
  var offsetY = -obj.offset.y;
  offsetX += A.Status.click.x-x;
  offsetY += A.Status.click.y-y;
  var textHeight = obj.oneSpace *1.8;
  var textLineSpacing = textHeight;
  var kwicSpace = obj.oneSpace;

  var row = Math.floor(offsetY / textLineSpacing -0.5);
  var col = Math.floor(offsetX / kwicSpace );

  console.log("click at row:"+row+" col:"+col );
  var D = obj.permutedIndex;

  if( (0<=row) && (row<=D.length)){

    var str = D[row];
    str = str.split(" ~")[0];
    var nChars = Math.floor( xw / kwicSpace );
    str = mayPadBefore(str,":< ",nChars);

    // wrap around if after end of string.
    var wrap = col;
    if( col === -1 )
      col =0;
    if( col < 0 )
      col++;
    col = (col + 20*(str.length)) % (str.length);
    wrap = col-wrap;

    if( str.length > col ){
      while( (str[col]!==' ') && (col>0))
        col--;
      while( (str[col]===' ') && (col < (str.length-1)))
        col++;
      str = str.slice(col) +  " " + str.slice( 0, col);
      str = str.trimEnd();
      str = str.replace( / +/g , " " );
    }
    console.log( "Jump to: " +str );
    obj.selected = str;
    reselectInKwic( obj, row );
    obj.offset.x += (col-wrap)*kwicSpace;
    drawDiagramAgain(A);
  }
}

function permuteMe( values ){
  var i;

  var stopwords = [];
  stopwords["A"] = true;
  stopwords["AN"] = true;
  stopwords["AND"] = true;
  stopwords["ARE"] = true;
  stopwords["FOR"] = true;
//  stopwords["FROM"] = true;
//  stopwords["HAVE"] = true;
  stopwords["HOW"] = true;
  stopwords["IF"] = true;
//  stopwords["IN"] = true;
//  stopwords["INTO"] = true;
  stopwords["OF"] = true;
  stopwords["ON"] = true;
  stopwords["THE"] = true;
  stopwords["TO"] = true;
//  stopwords["WHAT"] = true;
//  stopwords["WHEN"] = true;
//  stopwords["WHERE"] = true;
  stopwords["-"] = true;


  var results = [];
  for( i= 0;i< values.length;i++){
    var str = values[i];
    str = str.replace( /^[0-9]*: */, "" );
    str = ":< "+str;
    var words = str.split( ' ');
    var j;
    for( j=0;j<words.length;j++){
      if( stopwords[ words[j] ] )
        continue;
      var perm = words.slice(j).join(" ");
      if( j> 0 )
        perm = perm + " " + words.slice(0,j).join(" ");
      results.push( perm + " ~"+i);
    }
  }
  return results;
}

// Always return something.
// Aim to return the line that IS item, or near miss.
function bSearch(array, item) {
  // Use an INCLUSIVE range.
  var lo = 0;
  var hi = array.length - 1;
  var mid = hi >> 1;
  while (lo <= hi) {
    mid = (lo +hi) >> 1;
    //console.log( "Cf "+array[mid] );
    if (item > array[mid]) {
      lo = mid + 1;
    } else if(item < array[mid]) {
      hi = mid - 1;
    } else {
      return mid;
    }
  }
  return hi;
}

function newKwicData(A, obj, text ){
  console.log( "Got text response "+text.length+" chars for object "+obj.type );
  text = text.replace( /\r\n/gm , "\n" );
  var X = text.split( "\n\n" );
  obj.longlist = X;
  console.log( "number of items "+X.length );

  var Y;
  Y= [];
  var i;
  for(i=0;i<X.length;i++){
    var str = X[i].split("\n")[0];
    str = str.toUpperCase();
    Y.push(str);
  }
  Y = permuteMe( Y );
  var i;
  Y.sort( );
  for(i=0;i<Math.min( 3, Y.length);i++){
    console.log( Y[i] );
  }
  obj.permutedIndex = Y;
  reselectInKwic( obj, 5 );

}

function createKwic( A, obj, data ){
  console.log("Got it");
  //var X = [ obj.content[0] ];
  var X = permuteMe( obj.values );
  var i;
  X.sort( );
  for(i=0;i<Math.min( 3, X.length);i++){
    console.log( X[i] );
  }
  obj.permutedIndex = X;
  obj.onClick = onKwicClicked;//["clickAction",obj.name ];

  if( !A.KwicContents ){
    if( obj.source )
      requestKwicContents(A, obj.source, obj);
  }
}
