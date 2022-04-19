
// This computes the text spec of the diagram,
// but it also sets the title of the editor, so is 
// having side effects and not strictly being functional.
function writeMindMap( A, obj, d){
  var atoms = obj.atoms;
  var str = "";
  if( A.Caption.text ){
    str += "caption: "+A.Caption.text+"\r\n";
    setEditorTitle( A.Caption.text );
  }
  for( var i in atoms){
    var atom = atoms[i];
    var val = atom.oldValue || atom.value;
    str += "**********:".slice(-1 - atom.level) + 
    monikerOfIndex(i) +": "+val+"\r\n";
  }
  if( obj.size ){
    str += "magnify: " + obj.size +"\r\n";
  }
  if( isDefined( obj.rotate ) ){
    str += "rotate: " + obj.rotate +"\r\n";
  }
  for( var i in atoms){
    var atom = atoms[i];
    str += ":" + 
    monikerOfIndex(i) +": at: "+
    Math.floor(atom.x)+","+Math.floor(atom.y)+"\r\n";
    if( atom.size ){
      str += "size: " + atom.size +"\r\n";
    }
    if( atom.styled){
      str+= "cloze: "+atom.styled+"\r\n";
    }
    if( atom.subdiagram )
      str+= "subdiagram: "+atom.subdiagram+"\r\n";
    if( atom.hide){
      str+= "hide:\r\n";
    }
  }

  if( obj.extra ){
    str += "object: "+JSON.stringify( obj.extra )+"\r\n";
  }
  if( obj.background ){
    str += "background: "+obj.background+"\r\n";
  }

  var bonds = obj.bonds;
  bendReported = 0;

  // Find some bond, and report its bend.
  for( bond of bonds){
    bendReported = bond.bend || 0;
    if( !bond.bend )
      break;
    str += "bond: * *\r\n";
    str += "bend: "+bendReported + "\r\n";
    break;
  }
  for( bond of bonds){
    var bondConfig = "";
    var bend = bond.bend || 0;  
    if( bend != bendReported ){
      bondConfig+= "bend: "+ bend+"\r\n";
    }
    if( isDefined( bond.multiplicity) && (bond.multiplicity!=1)){
      bondConfig += "multiplicity: "+bond.multiplicity +"\r\n";
    }
    if( bondConfig || !bond.tree){
      str += "bond: "+ 
        monikerOfIndex(bond.points[0]) + " " + 
        monikerOfIndex(bond.points[1]) +
        (bond.value ? " "+bond.value : "") + "\r\n" +
        bondConfig;
    }
  }
  var angles = obj.angles;
  for( angle of angles){
    str += "angle: "+ 
      monikerOfIndex(angle.points[0]) + " " + 
      monikerOfIndex(angle.points[1]) + " " + 
      monikerOfIndex(angle.points[2]) + "\r\n";
  }


  var quads = obj.quads;
  for( quad of quads){
    str += "quad: "+ 
      monikerOfIndex(quad.points[0]) + " " + 
      monikerOfIndex(quad.points[1]) + " " + 
      monikerOfIndex(quad.points[2]) + " " + 
      monikerOfIndex(quad.points[3]) + "\r\n";
    if( quad.src )
      str += "image: "+quad.src+"\r\n";
    if( quad.hmul && (quad.hmul != 1))
      str += "hmul: "+quad.hmul+"\r\n";
    if( quad.vmul && (quad.vmul != 1))
      str += "vmul: "+quad.vmul+"\r\n";
  }

  // tipList is a hash of all the card strings.
  // we are merging duplicates.
  var tipList = {};

  for( var i in atoms){
    var atom = atoms[i];
    if( atom.card ){
      var moniker = monikerOfIndex( i );
      item = tipList[atom.card];
      if( item )
        item.push(moniker);
      else
        tipList[atom.card]=[moniker];
    }
  }
  for( var key in tipList ){
    str += ":"+ tipList[key].join(':')+":\r\n";
    str += "card:\r\n";
    // key is the text of the card.
    str += joinableTip(key);// +"\r\n";
  }
  if( A.infoText() ){
    var info = A.infoText();
    if( info != defaultInfoTip( A.Caption.text ) ){
      str += ":info:\r\n";
      str += "card:\r\n";
      str += info; // no new line..
    }
  }
  return str;
}