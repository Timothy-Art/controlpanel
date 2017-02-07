# Control Panel Package for R

Creates a control panel for weighting and organizing financial factors. The current tool allows users to add and remove groups or individual factors and assign weights using either the sliders or numerical inputs. 

To create the control panel, call `controlpanel(opts, factor_list, ...)`

`opts` is a list object that provides instructions on how to create the control panel. An example of how this opts list is structured can be found in the example folder.

`factor_list` is a planned feature for adding in new factors. For now, leave it as NA.

For use with shiny, call the `controlpanelOutput` and `renderControlpanel` functions.

When created in the shiny enivronment, `input$<elementID>_opts` will allow you to access the most recent options list from the control panel. 