// This file is purely to assist with understanding and finding your
// way in the javascript.  It is NOT included into the html pages.

function mainFunctions(){

	Symbol();
	Jatex();

  Twisty();
  Frac();
  Stack();
  Tile();
  SupSub();
  FontHandler();
  Settings();
  Ruler();
  //Grid(); part of Macro.
  SvgSymbols();
  Transform();
  Macro();
  Graph();
  Stretcher();

  astOfTokens( ast, tokens, i, len );
  measureSubtree( ctx, parent, ast);
  positionSubtree(parent, ast, v);
  outSubtree( ctx, ast, color );

// compare with registration - objects we position and draw.
  reg( "Ruler",createRuler,sizeNowt,layoutMargined, drawRuler);
// objects we read and write to text.
  reg( "MindMap", readMindMap, writeMindMap);


	// The most important draw function that calls the 
	// angle, bond and atom drawing functions.
	drawMindMap()

	// Lotsa configuaration parameters for a diagram type
	readMindMap()
	readMolecule()

	writeMindMap()

    // crucial colouring function.
	setSolid()


	drawLineLabelAndText();
	drawTextyBond();

	drawTaper();
	drawText();
	drawStyledLine()

	parseLabelString()
}

/*

---------------------
scorpiodiagrams.js (4383 lines)

drawXYZ (2000 lines) - The flood fill maybe doesn't condense much.  There's charting in there that has some iterations and could use 'the other' label system. Shapes for focus layer could be generic.  Could use SVG and Shape more.

codes & wikimarkdown (420 lines) - Extracting field values, regex for wikimarkdown, etc.

helper functions (700 lines) - Includes solver for arrow-intersect-box, some space apportioning, transfer of values between variables to carry styles into subroutines.

code for dragging (~90 lines), delayed image fetch (~50 lines) polyfill/missing-functions (~100 lines), dom initting (~100 lines)

old code for choosers.  


recommend: 
split into

defined_shapes.js - Like the annotation star and the 4-way arrow cursor.
flyweight_shapes.js - Nearly all of the charting stuff.  We'll hand in the prototypes and the plan for how to repeat.
flyweight_text.js - nearly all of the auto-generated text stuff.
solvers.js - intersection code, for example.

htmlOfMediaWiki moved into getter.js.

-----------------------

workhorse.js (1640 lines)

mindmap (1240 lines) - atoms, quads, textylabels, includes some of the parsing, not just the drawing.

ruler and draggers and font invocation (280 lines)

recommend:
most of ruler can move to flyweight shapes.

------------------------

annotator (1220 lines)

the info card, also mouse functions, toc inner (menu) and downloads.

recommend:
long term plan to split into:

menu.js - a general purpose menu manager, that does not have
specific functions or text attached.
info_card.js - an info card that can be connected to any rectangular region
diagram_details.js - including the toc for the diagram

no hurry for the split as the combined file is still quite small.

--------------------------

getters (342 lines)
readers (1238 lines) - 300 lines are just configuring the built in styles.
writers (lines)

nurb (611 lines)
shape (677 lines) - will grow, and that's fine.
jsloader (185 lines)
*/