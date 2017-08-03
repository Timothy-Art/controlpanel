#' controlpanel
#'
#' Creates a control panel for adjusting factors and weights
#'
#' @param opts a list of options to give the control panel
#' @param factorList a character vector of factors that will be made available in the Add Factor dropdown menu
#' @param multiSelect TRUE/FALSE if you want the user to be able to select more than one panel at a time
#' @return a controlpanel html widget
#' @import htmlwidgets
#' 
#' @export
controlpanel <- function(opts, factorList=c(), multiSelect=FALSE, width = NULL, height = NULL, elementId = NULL) {
  require(rjson)

  data <- toJSON(opts)

  x <- list(
    opts = data,
    factors = factorList,
    multiSelect = multiSelect
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'controlpanel',
    x,
    width = width,
    height = height,
    package = 'controlpanel',
    elementId = elementId
  )
}

#' Shiny output bindings for a controlpanel
#'
#' @param outputId output id of the widget
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#'
#' @export
controlpanelOutput <- function(outputId, width = '100%', height = 'auto'){
  htmlwidgets::shinyWidgetOutput(outputId, 'controlpanel', width, height, package = 'controlpanel')
}

#' Shiny render for controlpanelOutput
#' 
#' @param expr An expression that generates a controlpanel
#' @param env The environment in which to evaluate \code{expr}.
#'   
#' @export
renderControlpanel <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, controlpanelOutput, env, quoted = TRUE)
}
