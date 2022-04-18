# SCORPIO

Scorpio turns textual specifications into diagrams.

Screenshots and examples at [scorpio diagrams](http://scorpiodiagrams.com/)

This repo illustrates how to use GitHub to store marked up images for display as Scorpio diagrams (gitwrapping).  It also *in the next few days* will have the JavaScript code to use for self hosting.

## Sub directories

+ *./images/* - subdirectory has png images which become annotated
+ *./diagrams/* - contains the specs for the annotations
+ *./wiki/* - is for the documents the diagrams are embedded in.

See ./docs/Usage.md for more details of how to use.

## The build step

There is no build step.

The text and diagrams are all renedered client side using JavaScript.  

## License

Scorpio diagrams software in this repo is licensed with the MIT license. The documentation in this repo, in the ./docs/ subdirectory is under the MIT license too.

The examples in this repo in the subdirectories ./images/, ./diagrams/ and ./wiki/ are MIT licensed or more permissively.  My intention is that all actual images in ./images/ will be public domain.  See ./images/rights.md

This repo includes a copy of a version of the LaTeX to html renderer, [KaTeX](https://github.com/KaTeX/KaTeX).  That is MIT licensed too.  See their repo for more details of their module.

