HTMLWidgets.widget({

  name: 'controlpanel',

  type: 'output',

  factory: function(ele, width, height){

    var elementId = ele.id;
    var cp = new ControlPanel({}, elementId);
    var timeout;
    var initialized = false;

    return {
      renderValue: function(x){

        var controls = JSON.parse(x.opts);
        var factors = JSON.parse(x.factors);

        cp.setSelections(factors);
        cp.setControls(controls);
        cp.buildPanels();
        cp.drawPanel("Main");

        if (!initialized){
          initialized = true;

          $('#'+ele.id).data('cp', cp);

          if(HTMLWidgets.shinyMode) {
            $('#'+elementId).on('controlchanged', function(e){
              clearTimeout(timeout);
              timeout = setTimeout(function() {
                //console.log(elementId+'_opts');
                x = JSON.stringify(cp.getOptions());
                Shiny.onInputChange(elementId+'_opts', x);
              }, 500);
            });

            $('#'+elementId).on('controlselection', function(e){
              Shiny.onInputChange(elementId+'_selected', cp.selected);
            });
          };
        };
      },

      resize: function(x){
        return;
      },

      cp: cp
    };
  }
});
