// for configuration related features...


function getGitContent( repo ){
  repo = DomUtils.getValue( 'url_input'+repo );//'JamesCrook/Scorpio';
  setRepo( repo );
}


function setRepo( repo ){
  var srcUrl;
  if( repo.match(/^http/)){
    srcUrl = repo;
  } else {
    srcUrl = `https://raw.githubusercontent.com/${repo}/master/` || './';
  }


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
Click on Git wrap to instead use content from one of the<br> following directories at https://github.com/<br><br>
<button class='gitbutton' onclick="getGitContent('sampler')">Git Wrap</button><input class='gitwrap' id="url_inputsampler" type='text' value='scorpiodiagrams/sampler'></input><br>a small sample of <a target=blank href='https://github.com/scorpiodiagrams/sampler'>annotated images</a><br><br><br>
<button class='gitbutton' onclick="getGitContent('ui')">Git Wrap</button><input class='gitwrap' id="url_inputui" type='text' value='scorpiodiagrams/ui-annotated'></input><br>some annotated open source <a target=blank href='https://github.com/scorpiodiagrams/ui-annotated'>user interfaces</a><br><br>
<button class='gitbutton' onclick="getGitContent('other')">Git Wrap</button><input class='gitwrap' id="url_inputother" type='text' value=''></input><br>you type in a github repo identifier for this one<br><br>
</div>

<br>
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


