// This file is purely to assist with understanding and finding your
// way in the javascript.  It is NOT included into the html pages.

function mainFunctions(){


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
