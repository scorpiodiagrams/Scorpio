# SCORPIO

This is usage info for Scorpio version 0.1

## Gitwrapping

> Gitwrapping applies javascript transformation to raw text and images held at GitHub.  It is not suitable for medium or high volume traffic.  Gitwrapping gives a free and quick way to use Scorpio's diagram markdown with your own diagrams.

* Create your diagram specs at the [diagrams forge](http://scorpiodiagrams.com/).  These are text files with the extension .txt (lower case).  Place them in your ./diagrams directory.  

* If you need background images, place them in ./images.

* Create a markdown document that references the diagram files.  Look at the examples in ./wiki to see how.

Push to GitHub and check the files are all there.  Now go to the [GitWrapped page](http://scorpiodiagrams.com/gitwrapped.html) and enter the name of your GitHub repo.  You should now see these files from GitHub, with the text files converted to diagrams.

You can make a GitHub repo with just the ./diagrams ./images and ./wiki subdirectories and serve Gitwrapped annoated images from it.


## Self hosting

> Self hosting gives you more control than gitwrapping.  The webserver will only be serving static content.  The images are constructed client side.

* Put your content in the three directories as described in 'gitwrapping'.  

* Host a copy of the entire tree of this repo, including your replacement version of the three directories, on your server.  Diagram spec files will be fetched and processed as needed.

You can if you like now customise the css and javascript to your liking.  The default config has editing disabled.  You can change that by changing the config variable in index.html.


## Localhost hosting

> Using localhost, you can develop your spec files and markdown files locally using your favourite text editor.

This is the same as self hosting, except you use a light weight local web server e.g: 

```
python -m http.server
```




