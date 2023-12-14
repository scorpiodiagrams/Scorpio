// Multiscroller format allows multiscrollers to be added.
function Multiscroller_Fmt(){
  return this;
}

CodeBrowse = 
{ 
   MultiScroller: {
     Where: "CanvasSurface",
     Cols: [
       { 
         Name: "Files",
         DataSource: 1,
         Location: { x:0,y:0},
         ColCardSize: {x: {min:30,max:30}, y:{min:1,max:1}},
         ColCardStyling: {
           Margin:10, 
           Transparency: 0, 
           Border:5, 
           color:"#ddd"},
        OnHover: "&Nop",
        Layout: 0,
        Wrap: true
       },
       { 
         Name: "Functions",
         DataSource: 2,
         Location: { x:30,y:0},
         ColCardSize: {x: {min:30,max:30}, y:{min:1,max:1}},
         ColCardStyling: {
           Margin:10, 
           Transparency: 0, 
           Border:5, 
           color:"#ddd"},
        OnHover: "&Nop",
        Layout: 0,
        Wrap: true         
       },
       { 
         Name: "Instructions",
         DataSource: 3,
         Location: { x:60,y:0},
         ColCardSize: {x: {min:10,max:120}, y:{min:1,max:1}},
         ColCardStyling: {
           Margin:10, 
           Transparency: 0, 
           Border:5, 
           color:"#ddd"},
        OnHover: "&Nop",
        Layout: 0,
        Wrap: true
       },
    ]
   } 
};

Multiscroller_Fmt.prototype ={
  name : "Multiscroller",

  debug(A,url,text){
    alert( url );
  },

  makeScroller(){
    var str = "";
    str = `<`
  },

  htmlOf( str ){
    str = str || "No Multiscroller";
    str += CodeBrowse.MultiScroller.Cols[2].Name;
    str = `<div class="raw" style="width:550px;height:600px;">${str}</div>\r\n\r\n`;
    return str;
  }

}

Multiscroller_Fmt = new Multiscroller_Fmt();
Registrar.register( Multiscroller_Fmt );

