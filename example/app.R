library(shiny)
library(shinydashboard)
library(shinyjs)
library(controlpanel)
library(rjson)

# Define UI for application that draws a histogram
ui <- fluidPage(
  useShinyjs(),
  controlpanelOutput('test'),
  textOutput('hello')
)

# Define server logic required to draw a histogram
server <- function(input, output, session) {
  opts <- fromJSON(file='options.json')

  output$test <- renderControlpanel(
    controlpanel(opts=opts, factorList = c("Hello", "World"), multiSelect = TRUE, theme='default')
  )

  obj <- eventReactive(input$test_opts, {
    test <<- fromJSON(input$test_opts)
    fromJSON(input$test_opts)
  })

  observeEvent(obj(), {
    print(obj())
  })
}

# Run the application
shinyApp(ui = ui, server = server)

