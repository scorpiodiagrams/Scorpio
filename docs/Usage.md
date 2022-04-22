# SCORPIO

This is usage info for Scorpio version 0.1


## Gitwrapping

> Gitwrapping applies javascript transformation to raw text and images held at GitHub.  This is intended for trying out the software for your personal use.  It is not suitable for medium or high volume traffic.  Gitwrapping gives a free and quick way to use Scorpio's diagram markdown with your own diagrams on your own GitHub repo.  If you want to use the software on a more sustained basis, then see 'Self Hosting'.

Currently gitwrapping is only suitable for developers.  It requires being comfortable using git.  

* Create your diagram specs at the [diagrams forge](http://scorpiodiagrams.com/).  These are text files with the extension .txt (lower case).  Place them in your ./diagrams directory.  

* If you need background images, place them in ./images/.

* Create a markdown document that references the diagram files.  Look at the examples in ./wiki/ to see how.  You will need an index.md.

Push to GitHub and check the files are all there.  Go to the [GitWrapped page](http://scorpiodiagrams.com/gitwrapped.html) and enter the name of your GitHub repo.  You should now see these files from GitHub, with the text files converted to diagrams.

You can make a GitHub repo with just the ./diagrams/ ./images/ and ./wiki/ subdirectories and serve Gitwrapped annotated images from it.  You don't need the JavaScript files.

Be sure to review and update README.md, rights.md and LICENSE files appropriately.


## Self hosting

> Self hosting gives you more control and more bandwidth than gitwrapping.  The webserver will only be serving static content, so low powered hosting is fine.  The diagramss are constructed client side.

* Put your content in the three directories as described in 'gitwrapping'.  

* Host a copy of the entire tree of this repo, including your replacement version of the three directories, on your server.  Diagram spec files will be fetched and processed as needed.

There are a few files that you don't have to have for self hosting such as files in ./docs/ amd the examples gitwrapped.html and snippet.html.

You can if you like now customise the css and javascript to your liking.  The default config has editing disabled.  You can change that by changing the config variable in index.html.  You probably will want to add your own favicon.ico.


## Snippet example

> The snippet.html example shows how to use the diagrams from a single html file that you can open in a browser.

This way of using Scorpio requires internet connectivity as the scoprio JavaScript is fetched from the cloud.  Since the required JavasScript files are in this repo, you can also use diagrams locally on your own machine.  See below.


## Use on your own computer

> Using localhost, you can develop your spec files and markdown files locally, using your favourite text editor.

This is the same as self hosting, except you use a light weight local web server e.g: 

```
python -m http.server
```




