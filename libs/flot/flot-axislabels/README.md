flot-axislabels: Axis Labels plugin for flot
============================================

* Original author: Xuan Luo
* Contributions: Mark Cote
* Contribultions: Michael Kabugi

[flot-axislabels](https://github.com/mikeslim7/flot-axislabels) In addition to the contributions by Mark (https://github.com/markrcote/flot-axislabels)
has added support for Flot 1.1 by changing the opts var to be as below:

    var opts = axis.options// Flot 0.7
              || plot.getOptions()[axisName]// Flot 0.6
              || plot.getOptions();	// Flot 1.1
              
This change has been done in the two sectiond it appers and the rest of Mark's script remains the same.

Before this change, the script was exiting as the variable opts was undefined. This is because the Flot 0.7 and Flot 0.6
methods return nothing.


Example
-------

    var placeholder = $("#placeholder");
    var plot = $.plot(placeholder, [{
            data : graphdata,
        }], {
            yaxis : {
                show : true,
                axisLabel : 'bar',
                position: 'left',
            },
            xaxis : {
                show : true,
                axisLabel : 'foo',
            }
        });


Usage
-----

flot-axislabel adds several options to the axis objects.  The two main ones
are

* axisLabel (string): the text you want displayed as the label
* axisLabelPadding (int): padding, in pixels, between the tick labels and the
  axis label (default: 2)

By default, if supported, flot-axislabels uses CSS transforms.  You can force
either canvas or HTML mode by setting axisLabelUseCanvas or axisLabelUseHtml,
respectively, to true.

Canvas mode supports two other options:

* axisLabelFontSizePixels (int): the size, in pixels, of the font (default: 14)
* axisLabelFontFamily (string): the font family of the font (default:
  sans-serif)


Compatibility
-------------

flot-axislabels should work with recent versions of Firefox, Chrome, Opera,
and Safari.  It also works with IE 8 and 9.  The canvas option does *not*
seem to work with IE 8, even with excanvas.


License
-------

flot-axislabels is released under the terms of [the MIT License](http://www.opensource.org/licenses/MIT).

