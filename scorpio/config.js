// for configuration related features...


function getGitContent(){
  var repo = DomUtils.getValue( 'url_input' );//'JamesCrook/Scorpio';

  var srcUrl = `https://raw.githubusercontent.com/${repo}/master/` || './';

  Registrar.wikiSrc = srcUrl +  'wiki/',
  Registrar.diagramSrc = srcUrl + 'diagrams/'
  Registrar.imageSrc = srcUrl + 'images/'
  Registrar.useUrlChecklist = false;

  Omnia_Fmt.intro =  
`
<div class='button_holder'>
<button onclick="location.href='#index';"><a href='#index'>Index</a></button><br><br>
<div class='example'>
Gitwrapping the GitHub repo:<br>
    ${repo}<br><br>
Images, Scorpio diagrams and Scorpio<br>
markdown pages are now being fetched from<br>
the above GitHub repo.
</div>
</div><br clear="all"/>
`  
  loadSource( "index.md");
}

function setFromConfig( page ){
  var buttons = 
`<button onclick="location.href='#index';"><a href='#index'>Index</a></button><br>
`;

  if( Registrar.addExtraButtons ){
    buttons = buttons +
`
<button onclick="location.href='#downloads';"><a href='#downloads'>Downloads</a></button><br>
<button onclick="location.href='#community';"><a href='#community'>Community</a></button><br>
`
  }

  var gitWrapping = 
`
<!--Gitwrapping disabled-->
`
  if( Registrar.enableGitWraping ){

    gitWrapping = 
`
<div class='example'>
Currently serving from:<br>
${document.location}<br>
Gitwrap to instead use content from the repo below:<br><br>
<input id="url_input" type='text' value='JamesCrook/Scorpio'></input><br><br>
</div>

<button onclick="getGitContent()">Git Wrap</button><br>
`;
  }

  buttons = 
`
<div class='button_holder'>
${buttons}
${gitWrapping}
</div><br clear="all"/>
`;

  // Adds buttons to top of every page...
  Omnia_Fmt.intro = buttons;

  Omnia_Fmt.outro = 
`
<br clear='all'/>
<div style="float:right;margin:10px;"><a href="${page}">Home</a></div><br><br>
`;
}


