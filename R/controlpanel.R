#' controlpanel
#'
#' Creates a control panel for adjust factors and weights
#'
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

#' Shiny bindings for controlpanel
#'
#' Output and render functions for using controlpanel within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a controlpanel
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name controlpanel-shiny
#'
#' @export
controlpanelOutput <- function(outputId, width = '100%', height = 'auto'){
  htmlwidgets::shinyWidgetOutput(outputId, 'controlpanel', width, height, package = 'controlpanel')
}

#' @rdname controlpanel-shiny
#' @export
renderControlpanel <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, controlpanelOutput, env, quoted = TRUE)
}
