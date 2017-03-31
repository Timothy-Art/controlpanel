# Control Panel Package for R
---

Creates a control panel for weighting and organizing financial factors. The current tool allows users to add and remove groups or individual factors and assign weights using either the sliders or numerical inputs.

## Installation

Install the package using `devtools::install_github('Timothy-Art/controlpanel')`.

## The Control Panel Widget

#### Global Controls

Along the top left of the control panel container, there is a directory of the current node. Click on any of the text elements, to head back up the tree. On the top right side of the control panel, there are two buttons. The first is a `Balance All`, which will unlock all factors and rebalance across all of the panels. The second is `Balance Factors`, which will leave locked factors alone and balance the rest of the panel.

#### Segment Controls

In each panel, at the top, there is an `Add` segment which, when clicked, will begin the process for adding a new factor or group. When adding a new factor/group, the name must be unique, and when adding a factor, in particular, the name should be linked to some data column name. The weight can be left blank when adding a new factor and it will default to 0. You can cancel this process at any time by pressing the `x` button in the top right.

Each segment has a number of different features. Along the top of each segment, there are a number of controls. From left to right there is:

1. Select - Click to toggle a segment's selected state.
2. Lock - Click to toggle a segment's locked state. When locked, the slider and numerical inputs will be disabled, and users will be prevented from flipping or deleting the segment.
3. Invert - Click to toggle a segment's flipped state. This will tell the back end to invert the data.
4. Delete - Removes the segment.

Segments also feature a slider and the number on the side can be clicked for numerical input. Sliders in the same panel will balance (to the best that they can) themselves automatically. To prevent this from happening, you can lock the segment. Groups of factors can also be clicked to dive into the group. Upon this, the panel will refresh with the contents of the clicked group. Groups and factors at the top level, will not display a slider or numerical input.

#### Control Panel Features

Each panel can have a combination of both factors and groups, and supports any number of the two in each panel. Keep in mind, however, that all segments must weigh in at 100% and the number of rounded digits is limited to 4 decimal places, so 1000 segments may not be feasible.

The control panel can also be nested as deep as you would like. However, each layer adds on a level of abstraction, making calculations harder to track.

## Usage

To create the control panel, call `controlpanel(opts, factor_list, ...)`

`opts` is a list object that provides instructions on how to create the control panel. An example of how this opts list is structured can be found in the example folder.

`factor_list` is a planned feature for adding in new factors. For now, leave it as NA.

## Shiny

For use with shiny, call the `controlpanelOutput` and `renderControlpanel` functions.

When created in a shiny environment, `input$<elementID>_opts` allows you to access the most recent options list from the control panel. `input$<elementID>_selected` gives you access to the list of selected panels.
