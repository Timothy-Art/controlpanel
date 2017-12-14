require(rjson)

#' controlpanel
#'
#' Creates a control panel for adjusting factors and weights
#'
#' @param opts A list of options to give the control panel
#' @param factorList A character vector of factors that will be made available in the Add Factor dropdown menu
#' @param multiSelect TRUE/FALSE if you want the user to be able to select more than one panel at a time
#' @param theme Color theme to apply to the control panel. Available themes are 'default' and 'paper'.
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param elementId Use an explicit element ID for the widget (rather than an automatically generated one).
#'   Useful if you have other JavaScript that needs to explicitly discover and interact with a specific widget instance.
#' @return a controlpanel html widget
#' @import htmlwidgets
#' @import rjson
#'
#' @export
controlpanel <- function(opts, factorList=c(), multiSelect=FALSE, theme='default', width = NULL, height = NULL, elementId = NULL) {
  data <- toJSON(opts)

  x <- list(
    opts = data,
    factors = factorList,
    multiSelect = multiSelect,
    theme = theme
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
#' @param quoted Is expr a quoted expression (with quote())? This is useful if you want to save an expression in a variable.
#'
#' @export
renderControlpanel <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, controlpanelOutput, env, quoted = TRUE)
}
