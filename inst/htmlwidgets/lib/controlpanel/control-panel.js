var groups = {};
var precision = 1000;
var ap = new AddPanel();
var topPanels = 3;

/*--ControlSlider(options, containerId)--------------------
A class containing the html elements for the add panels
different screens.
Properties:
  stage.............(Object) Containing HTML for each form
  current...........(Number) current stage in the form
Functions:
  createRadio(), createText(), createButton(),
  getNext(), getData(), removeSelf()
---------------------------------------------------------*/
function AddPanel(){
  this.stage = [];
  this.current = -1;
}

/*--createRadio()------------------------------------------
Internal function to create a radio button.
Parameters:
  id................(String) id of radio
  group.............(String) name of radio group it belongs to
  value.............(String) value of radio
  checked...........(Boolean) true or false if checked
Returns:
  (String) HTML docFrag of radio and label
---------------------------------------------------------*/
AddPanel.prototype.createRadio = function(id, group, value, checked){
  var docFrag = document.createDocumentFragment();

  var radio = document.createElement('input');
  radio.setAttribute('id', id);
  radio.setAttribute('type', 'radio');
  radio.setAttribute('name', group);
  radio.setAttribute('value', value);
  radio.checked = checked || false;
  docFrag.appendChild(radio);

  var label = document.createElement('label');
  label.setAttribute('for', id);
  label.appendChild(document.createTextNode(value));
  docFrag.appendChild(label);

  return(docFrag);
};

/*--createRadio()------------------------------------------
Internal function to create a text input.
Parameters:
  id................(String) id of text input
  value.............(String) placeholder text for input
  css...............(Object) key-value of css style to apply
Returns:
  (String) HTML of text input
---------------------------------------------------------*/
AddPanel.prototype.createText = function(id, value, css){
  var text = document.createElement('input');
  text.setAttribute('id', id);
  text.setAttribute('type', 'text');
  text.setAttribute('placeholder', value);
  text.style[Object.keys(css)] = css[Object.keys(css)];

  return(text);
};

/*--createRadio()------------------------------------------
Internal function to create a next button.
Parameters:
  id................(String) id of button
  value.............(String) value (text) of button
Returns:
  (String) HTML of button
---------------------------------------------------------*/
AddPanel.prototype.createButton = function(id, value){
  var button = document.createElement('input');
  button.setAttribute('id', id);
  button.setAttribute('type', 'button');
  button.setAttribute('name', value);
  button.setAttribute('value', value);

  return(button);
};

/*--getNext()----------------------------------------------
Returns the next panel in the list.
Returns:
  (String) HTML object
---------------------------------------------------------*/
AddPanel.prototype.getNext = function(){
  this.current++;
  if(this.current == 0){
    var span = document.createElement('span');

    var cancel = document.createElement('span');
    cancel.setAttribute("alt", "Cancel");
    cancel.setAttribute("title", "Cancel");
    cancel.setAttribute('aria-hidden', "true");
    cancel.className = 'add-cancel fa fa-times';

    span.appendChild(cancel);

    var i = document.createElement('div');
    i.appendChild(document.createTextNode('Add a New Control:'));
    i.className = 'title';

    span.appendChild(i);
    span.appendChild(document.createElement('hr'))

    var form  = document.createElement('form');
    form.appendChild(this.createRadio('r_1', 'group', 'Group', true));
    form.appendChild(this.createRadio('r_2', 'group', 'Factor'));
    form.appendChild(document.createElement('br'));
    form.appendChild(this.createButton('f_3', 'Next'));

    span.appendChild(form);
    span.classList.add('add-content');
    this.stage.push(span);

    result = this.stage[0];
  } else if(this.current = 1){
    var span = document.createElement('span')

    var cancel = document.createElement('span');
    cancel.setAttribute("alt", "Cancel");
    cancel.setAttribute("title", "Cancel");
    cancel.setAttribute('aria-hidden', "true");
    cancel.className = 'add-cancel fa fa-times';

    span.appendChild(cancel);

    var i = document.createElement('div');
    if(this.stage[0].children[3][0].checked){
      i.appendChild(document.createTextNode('Name and Weight:'));
    } else {
      i.appendChild(document.createTextNode('Factor and Weight:'));
    };
    i.classList.add('title');

    span.appendChild(i);
    span.appendChild(document.createElement('hr'));

    var form = document.createElement('form');
    if(this.stage[0].children[3][0].checked){
      form.appendChild(this.createText('f_4', 'Group Name', {width:'135px'}));
    } else {
      form.appendChild(this.createText('f_4', 'Factor', {width:'135px'}));
    };
    form.appendChild(this.createText('f_5', 'Weight', {width:'65px'}));
    form.appendChild(document.createElement('br'));
    form.appendChild(this.createButton('f_6', 'Add'));

    span.appendChild(form);
    span.classList.add('add-content');
    this.stage.push(span);

    result = this.stage[1]
  } else {
    result = false;
  };
  return(result);
};

/*--getData()----------------------------------------------
Returns the data generated form the add forms.
Returns:
  (Object) containing the name, weight...
---------------------------------------------------------*/
AddPanel.prototype.getData = function(){
  var slider = {};

  if (this.stage.length != 2){
    throw("FormIncomplete");
  }

  if (this.stage[0].children[3][0].checked){
    slider["Factors"] = {};
  }

  slider["Name"] = this.stage[1].children[3][0].value;
  slider["Weight"] = Number(this.stage[1].children[3][1].value)/100;
  slider["Locked"] = false;

  return(slider);
};

/*--removeSelf()-------------------------------------------
Removes the add panel from the DOM and triggers the reset
of the parent object.
---------------------------------------------------------*/
AddPanel.prototype.removeSelf = function(){
  //console.log(this.current);
  if (this.current < 0){
    return;
  }
  //console.log('removed');
  var ele = $($(this.stage[this.current])[0].parentNode);
  ele.animate(
    {height: '45px'},
    {duration: 300,
    complete: function(){
      ele.css({'height': 'auto'})
    }}
  )
  //console.log(ele[0].id);
  $('#'+ele[0].id+'>i').css({'margin-left': 'inherit'}).animate({opacity: 1}, {duration: 300});
  ele.removeClass('panel-add-text').addClass('panel-add');

  var content = $(this.stage[this.current])
  content.remove();
  this.current = -1;
}

/*--ControlSlider(options, containerId)--------------------
A class that contains the html elements for the control panel
and subgroups. Initialize with an options object and an
html container id to place the panel in.
Parameters:
  options...........(Object) from a configurations json
  containerId.......(String) div id
Properties:
  selected..........(Array) list of the panels selected
  panels............(Object) containing the html elements,
                            indexed with the group names
  container.........(String) container id of the control panel
  controls..........(Object) configuration based on the options
  misc..............(Object) extra options
  current...........(String) name of the currently displayed group
Functions:
  setControls(options), buildPanels(), findElement(name),
  findParent(name), retrievePanel(name), drawPanel(name),
  erasePanel(), clearPanels(), selectPanel(), deselectPanel(),
  addGroup(name, parent), updateOptions(name), getOptions()
---------------------------------------------------------*/
function ControlPanel(options, containerId){
  this.selected = [];
  this.panels = {};
  this.container = containerId;
  this.controls = options.Options;
  this.misc = [options.DateCreated, options.ManagerID, options.ID, options.Name, options.Tickers, options.ProfileName];
  this.current = '';

  $("#"+this.container).data({cp: this});
};

/*--__genName__(names)--------------------------------------
Builds the html name chain for a panel.
Parameters:
  names.............(Array) List of names to chain
Returns:
  (String) HTML elements to add for title.
---------------------------------------------------------*/
ControlPanel.prototype.__genName__ = function(names){
  prefix = '';
  span = document.createElement('span');
  span.className = 'panel-dir';
  for (var i = names.length-1; i >= 0; i--){
    span.appendChild(document.createTextNode(prefix));
    chain = document.createElement('span');
    chain.appendChild(document.createTextNode(names[i]));
    //chain.setAttribute('href', '#');
    span.appendChild(chain);
    prefix = ' > ';
  };
  return(span);
};

/*--__genNameChain__(name)--------------------------------------
Builds a sequence of names for the path of a given name/id.
Parameters:
  name..............(String) name to create chain for
Returns:
  (Array) Sequence of names
---------------------------------------------------------*/
ControlPanel.prototype.__genNameChain__ = function(name, __pos__, __panel__, __chain__){
  if (__pos__ === undefined){
    __pos__ = this.panels;
  };
  if(__panel__ === undefined){
    __panel__ = 'Main'
  };
  if (__chain__ === undefined){
      __chain__ = [];
  };

  var result = false;
  var keys = Object.keys(__pos__)
  //console.log(keys);
  for (i in keys){
    //console.log('key:', keys[i]);
    if (keys[i] === name){
      //console.log('pushing', keys[i]);
      __chain__.push(keys[i]);
      result = __chain__;
    } else if (keys[i] !== 'html'){
      //console.log('rec', keys[i]);
      result = this.__genNameChain__(name, __pos__[keys[i]], keys[i], __chain__);
    };
    if (result){
      //console.log('pushing', keys[i]);
      result.push(__panel__);
      return(result);
    };
  };
  return(result);
};

/*--setControls(options)-----------------------------------
Resets the controls object with new options.
Parameters:
  options...........(Object) of options
---------------------------------------------------------*/
ControlPanel.prototype.setControls = function(options){
  this.controls = options.Options;
  this.misc = [options.DateCreated, options.ManagerID, options.ID, options.Name, options.Tickers, options.ProfileName];
  this.current = '';
};

/*--buildPanels()------------------------------------------
Builds and stores the html elements for all panels/subpanels
based on the options passed in the constructor.
---------------------------------------------------------*/
ControlPanel.prototype.buildPanels = function(__iter__, __pos__, __name__){
  //console.log("Iteration:", __name__, "\nState:", this.panels);
  //console.log("Name", __name__);

  if (__iter__ == undefined){
    //console.log('start');
    __iter__ = this.controls;
    __pos__ = this.panels;
    __name__ = ["Main"];
    groups[__name__[0]] = {};
  };

  for (var i = 0; i < __iter__.length; i++){
    //console.log(__iter__[i], __pos__);
    if (__pos__['html'] === undefined){
      //console.log('starting html');
      __pos__['html'] = document.createElement('div');
      __pos__['html'].setAttribute('id', __name__[0]);
      __pos__['html'].className = 'panel-item-group';

      var title = this.__genName__(__name__);
      __pos__['html'].appendChild(title);

      var balance = document.createElement('span');
      balance.setAttribute('alt', 'Balance Factors');
      balance.setAttribute('title', 'Balance Factors');
      balance.setAttribute('id', __name__[0]+'-balance')
      balance.className = 'panel-balance balance-btn';
      var icon = document.createElement('i');
      icon.className = 'fa fa-sliders';
      icon.setAttribute('aria-hidden', 'true');
      balance.appendChild(icon);
      __pos__['html'].appendChild(balance);

      var reset = document.createElement('span');
      reset.setAttribute('alt', 'Balance All');
      reset.setAttribute('title', 'Balance All');
      reset.setAttribute('id', 'slider-reset');
      reset.className = 'panel-balance';
      var icon = document.createElement('i');
      icon.className = 'fa fa-refresh';
      icon.setAttribute('aria-hidden', 'true');
      reset.appendChild(icon);
      __pos__['html'].appendChild(reset);

      var add = document.createElement('div');
      add.className = 'panel-item panel-add';
      add.setAttribute('id', __name__[0]+'-add');
      var icon = document.createElement('i');
      icon.className = 'fa fa-plus-square-o';
      icon.setAttribute('aria-hidden', 'true');
      add.appendChild(icon);
      span.appendChild(add);

      __pos__['html'].appendChild(add);
    }

    if (__iter__[i].Factors !== undefined){
      groups[__name__[0]][__iter__[i].Name] = {value: __iter__[i].Weight*100*precision, lock: __iter__[i].Locked || false, flipped: __iter__[i].Flipped || false};
      groups[__iter__[i].Name] = {};

      __pos__['html'].appendChild(ControlSlider(__iter__[i].Name, true, __iter__[i].Weight, __iter__[i].Locked || false, __iter__[i].Flipped || false, __name__[0]=='Main'));
      __pos__[__iter__[i].Name] = {};
      __name__.unshift(__iter__[i].Name)
      this.buildPanels(__iter__[i].Factors, __pos__[__iter__[i].Name], __name__);
      __name__.shift();
    } else {
      groups[__name__[0]][__iter__[i].Name] = {value: __iter__[i].Weight*100*precision, lock: __iter__[i].Locked || false, flipped: __iter__[i].Flipped || false};
      __pos__['html'].appendChild(ControlSlider(__iter__[i].Name, false, __iter__[i].Weight, __iter__[i].Locked || false, __iter__[i].Flipped || false, __name__[0]=='Main'));
    }
  };
};

/*--findElement(name)--------------------------------------
Finds and returns a controls object given a name/id.
Parameters:
  name..............(String) id of the element
Returns:
  (Object) Found control
---------------------------------------------------------*/
ControlPanel.prototype.findElement = function(name){
  recFind = function(pos, name){
    //console.log('recursion', pos);
    if (pos === undefined){
      return(false);
    };
    pointer = false;
    for (i in pos){
      if (pos[i].Name === name){
        //console.log('found');
        return(pos[i]);
      } else {
        pointer = recFind(pos[i].Factors, name, pos[i].Name);
      }
      if (pointer != false){
        return(pointer);
      }
    }
    return(pointer);
  };

  if (name === "Main"){
    return(this.controls);
  }

  var pointer = false;
  //console.log(this.controls);

  for (i in this.controls){
    if (this.controls[i].Name === name){
      return(this.controls[i]);
    } else {
      pointer = recFind(this.controls[i].Factors, name);
    };

    if (pointer != false){
      return(pointer);
    };
  };
  return(pointer);
};

/*--findParent(name)----------------------------------------
Returns parent controls object of a given element name.
Parameters:
  name..............(String) id of the element
Returns:
  (Object) Parent control
---------------------------------------------------------*/
ControlPanel.prototype.findParent = function(name){
  recFind = function(pos, name){
    //console.log('recursion', pos);
    if (pos === undefined){
      return(false);
    };
    pointer = false;
    for (i in pos){
      if (pos[i].Name === name){
        //console.log('found');
        return(pos);
      } else {
        pointer = recFind(pos[i].Factors, name, pos[i].Name);
      }
      if (pointer != false){
        return(pointer);
      }
    }
    return(pointer);
  };

  var pointer = false;
  //console.log(this.controls);

  for (i in this.controls){
    if (this.controls[i].Name === name){
      return(this.controls);
    } else {
      pointer = recFind(this.controls[i].Factors, name);
    };

    if (pointer != false){
      return(pointer);
    };
  };
  return(pointer);
};

/*--retrievePanel(name)------------------------------------
Returns the panels object of a requested panel.
Parameters:
  name..............(String) id of the panel requested
Returns:
  (Object) Panels object
---------------------------------------------------------*/
ControlPanel.prototype.retrievePanel = function(name, __pos__){
  if(this.panels === undefined){
    throw ("Please buildPanels first!");
  };
  if(__pos__ === undefined){
    __pos__ = this
  }

  if (name === "Main"){
    return(this.panels);
  };

  var keys = Object.keys(__pos__)
  var result = false;
  for (i in keys){
    if (keys[i] === name){
      return (__pos__[keys[i]]);
    } else if (keys[i] !== 'html'){
      result = (this.retrievePanel(name, __pos__[keys[i]]));
    }

    if(result != false){
      return(result);
    }
  }
  return(result);
};

/*--drawPanel(name, anim)----------------------------------
Draws the requested panel to the ControlPanel container.
Parameters:
  name..............(String) id of the panel to show
  anim..............(Boolean) whether to play a transition,
                              defaults to true
---------------------------------------------------------*/
ControlPanel.prototype.drawPanel = function(name, anim){
  if (anim === undefined){
    anim = true;
  }
  if (name === undefined){
    throw('No panel name given');
  }

  if (name === this.current){
    return;
  } else if (this.current === ''){
    $("#"+this.container).html(this.retrievePanel(name).html);
    this.current = name;
    return;
  }

  //console.log(this.container);
  con = this.container;
  c = $("#"+con);
  ele = $("#"+con+">.panel-item-group .panel-item");
  new_ele = this.retrievePanel(name).html;
  if(new_ele === false){
    return;
  } else {
    this.current = name;
  }
  //console.log('current: '+this.current);

  if (!anim){
    c.html(new_ele);
    return;
  }

  ele.animate({'opacity': 0}, 1000, animDone());

  function animDone(){
    //console.log('callback');
    ele.css({opacity: 1});
    c.html(new_ele);
    ele = $("#"+con+">.panel-item-group .panel-item");
    ele.css({opacity: 0})
    ele.animate({opacity: 1}, 300);
  };
};

/*--erasePanel()-------------------------------------------
Erases the current panel from the ControlPanel container.
---------------------------------------------------------*/
ControlPanel.prototype.erasePanel = function(){
  $("#"+this.container).empty();
  $("#"+this.container).data({cp: this});
  this.current = '';
};

/*--clearPanels()------------------------------------------
Clears the panel object so that it can be rebuilt.
---------------------------------------------------------*/
ControlPanel.prototype.clearPanels = function(){
  this.panels = {};
  this.current = '';
};

/*--selectPanel(name)--------------------------------------
Adds a panel to the selected array if it does not already
exist.
Parameters:
  name...............(String) id of panel to select
  silent.............(Boolean) whether to trigger events
---------------------------------------------------------*/
ControlPanel.prototype.selectPanel = function(name, silent){
  if (this.selected.indexOf(name) >= 0){
    return;
  } else {
    this.selected.push(name);
  }

  if (!silent){
    $('#'+this.container).trigger('controlselection');
    $('#'+this.container).trigger('controlselect');
  }
};

/*--deselectPanel(name)------------------------------------
Removes a panel from the selected array if it exists.
Parameters:
  name...............(String) id of panel to deselect
  silent.............(Boolean) whether to trigger events
---------------------------------------------------------*/
ControlPanel.prototype.deselectPanel = function(name, silent){
  if (this.selected.indexOf(name) < 0){
    return;
  } else {
    this.selected.splice(this.selected.indexOf(name), 1);
  }

  if (!silent){
    $('#'+this.container).trigger('controlselection');
    $('#'+this.container).trigger('controldeselect');
  };
};

/*--addGroup(name, parent)---------------------------------
Adds a new group to the panel. Will insert at a specified
parent which otherwise defaults to the current panel.
Parameters:
  name..............(String) id of the new group
  parent............(String) id of the parent panel
---------------------------------------------------------*/
ControlPanel.prototype.addGroup = function(name, parent){
  if (parent === undefined){
    parent = this.current
  }

  var opts = this.findElement(parent);
  var pointer = this.retrievePanel(parent);

  opts.unshift({Factors: [], Name: name, Weight: 0});

  pointer[name] = {}
  pointer = pointer[name];

  pointer['html'] = document.createElement('div');
  pointer['html'].setAttribute('id', name);
  pointer['html'].className = 'panel-item-group';

  //console.log(this.__genNameChain__(name));
  var title = this.__genName__(this.__genNameChain__(name));
  //console.log(title);
  pointer['html'].appendChild(title);

  var balance = document.createElement('span');
  balance.setAttribute('alt', 'Balance Factors');
  balance.setAttribute('title', 'Balance Factors');
  balance.setAttribute('id', name+'-balance');
  balance.className = 'panel-balance';
  var icon = document.createElement('i');
  icon.className = 'fa fa-sliders';
  icon.setAttribute('aria-hidden', 'true');
  balance.appendChild(icon);
  pointer['html'].appendChild(balance);

  var add = document.createElement('div');
  add.className = 'panel-item panel-add';
  add.setAttribute('id', name+'-add');
  var icon = document.createElement('i');
  icon.className = 'fa fa-plus-square-o';
  icon.setAttribute('aria-hidden', 'true');
  add.appendChild(icon);
  span.appendChild(add);

  pointer['html'].appendChild(add);
};

/*--updateOptions(name)----------------------------------------
Updates the options for a given panel based on the input
sliders. If no name is given, the function defaults to the
current panel attribute.
Parameters:
  name..............(String) id of the panel to update
  silent.............(Boolean) whether to trigger events
---------------------------------------------------------*/
ControlPanel.prototype.updateOptions = function(name, silent){
  if (name === undefined){
    name = this.current
    //console.log(name, this.current)
    if(name === ''){
      return;
    }
  }
  //console.log(name);
  if (name === "Main"){
    var opts = this.controls;
    var pan = this.panels.html;
  } else {
    var opts = this.findElement(name).Factors;
    var pan = this.retrievePanel(name).html;
  }

  //console.log(opts);
  //console.log(pan);

  var marked = [];

  for (var i = 0; i < pan.childNodes.length; i++){
    if(pan.childNodes[i].classList.contains('panel-item')){
      var p = pan.childNodes[i].id;
      if (p.substr(p.length-4, p.length) !== '-add'){
        //console.log(p);
        var poi = -1

        for (var j in opts){
          if (opts[j].Name === p){
            poi = j;
          };
        };

        if (poi >= 0){
          opts[poi].Weight = Number($('#'+p+'-slider-num').val())/100;
          opts[poi].Locked = $('#'+p+'>.panel-lock').hasClass('fa-lock');
          opts[poi].Flipped = $('#'+p+'>.panel-flip').hasClass('fa-minus');
        } else {
          opts.unshift({
            Name: p,
            Weight: Number($('#'+p+'-slider-num').val())/100,
            Locked: $('#'+p+'>.panel-lock').hasClass('fa-lock'),
            Flipped: $('#'+p+'>.panel-flip').hasClass('fa-minus')
          });
          //console.log(opts);
          poi = '0';
        };
        marked.push(poi);
      };
    };
  };

  var keys = Object.keys(opts);
  //console.log(marked, keys);

  for (i in keys){
    //console.log(i);
    if (marked.indexOf(keys[i]) == -1){
      opts.splice(Number([keys[i]]), 1);
    };
  };

  //console.log(opts);
  //console.log(this.controls);
  if (!silent){
    //console.log('not silent');
    $('#'+this.container).trigger('controlchanged');
  };
};

/*--getOptions()-------------------------------------------
Returns an options object based on the current state of the
ControlPanel.
Returns:
  (Object) Options
---------------------------------------------------------*/
ControlPanel.prototype.getOptions = function(){
  var d = new Date();
  d.getTime();

  return out = {
    ManagerID: this.misc[1],
    ID: this.misc[2],
    Name: this.misc[3],
    ProfileName: this.misc[5],
    DateCreated: d.toISOString().replace('T', ' ').replace(/\..*$/, ''),
    Tickers: this.misc[4],
    Options: this.controls
  };
};

/*--ControlSlider(name)------------------------------------
A function to build and return a control slider html element.
Parameters:
  name..............(String) id for the slider
  group.............(Boolean) true if it's a group
  weight............(Number) value of the slider and num-input
  locked............(Boolean) if the slider is locked
  flipped...........(Boolean) if the slider is flipped
  topLevel..........(Boolean) if the slider is part of
                              the top level
Returns:
  (String) HTML element of the slider
---------------------------------------------------------*/
function ControlSlider(name, group, weight, locked, flipped, topLevel){
  if (group === undefined){
    group = false;
  };
  if (weight === undefined){
    weight = 0;
  };
  if (locked === undefined){
    locked = false;
  };
  if (flipped === undefined){
    flipped = false;
  };
  if (topLevel === undefined){
    topLevel = false;
  };

  slider = document.createElement("div");
  slider.setAttribute("id", name);
  slider.className = 'panel-item';
  slider.className += group ? ' panel-group' : '';
  slider.className += topLevel ? ' panel-top' : '';

  destroy_button: {
    div = document.createElement("div");
    div.setAttribute("id", name+"-destroy");
    div.setAttribute("alt", "Delete");
    div.setAttribute("title", "Delete");
    div.setAttribute('aria-hidden', "true");
    div.className = 'panel-destroy panel-button-x fa fa-times';
    //div.appendChild(document.createTextNode("\u2716"));
  }

  slider.appendChild(div);

  flip_button: {
    div = document.createElement("div");
    div.setAttribute("id", name+"-flip");
    div.setAttribute('aria-hidden', "true");
    div.className = 'panel-flip panel-button'
    if(!flipped){
      div.className += ' fa fa-plus';
      div.setAttribute("alt", "Invert");
      div.setAttribute("title", "Invert");
    } else {
      div.className += ' fa fa-minus';
      div.setAttribute("alt", "Normal");
      div.setAttribute("title", "Normal");
    }
  }

  slider.appendChild(div);


  lock_button: {
    div = document.createElement("div");
    div.setAttribute("id", name+"-lock");
    div.setAttribute('aria-hidden', "true");
    div.className = 'panel-lock panel-button';
    if(locked){
      div.className += ' locked fa fa-lock'
      div.setAttribute("alt", "Unlock");
      div.setAttribute("title", "Unlock");
    } else {
      div.className += ' fa fa-unlock-alt'
      div.setAttribute("alt", "Lock");
      div.setAttribute("title", "Lock");
    }
  }

  slider.appendChild(div);

  select_button: {
    div = document.createElement("div");
    div.setAttribute("id", name+"-select");
    div.setAttribute("alt", "Select");
    div.setAttribute("title", "Select");
    div.setAttribute('aria-hidden', "true");
    div.className = 'panel-select panel-button fa fa-circle-o';
  }

  slider.appendChild(div);

  label: {
    div = document.createElement("label");
    div.className = 'scroll-label';
    div.setAttribute("id", name+"-slider-label");
    div.setAttribute("alt", name);
    div.setAttribute("title", name);
    if (group){
      icon = document.createElement("i");
      icon.className = 'fa panel-button fa-plus-circle';
      icon.setAttribute('aria-hidden', 'true');
      div.appendChild(icon);
    }
    var text = document.createElement("span");
    text.appendChild(
      document.createTextNode(name)
    );
    div.appendChild(text);
  }

  slider.appendChild(div);

  /*power: {
    div = document.createElement("span");
    div.setAttribute("id", name+"-power");
    div.setAttribute("alt", "Turn Off");
    div.setAttribute("title", "Turn Off");
    div.setAttribute('aria-hidden', "true");
    div.className = 'panel-power fa fa-power-off';
  }

  slider.appendChild(div);*/

  slider: {
    div = document.createElement("input");
    div.setAttribute("id", name+"-slider");
    div.setAttribute("type", "range");
    div.setAttribute("max", "100");
    div.setAttribute("min", "0");
    div.setAttribute("value", weight*100);
    div.setAttribute("name", name+"-slider");
    if (locked){
      div.disabled = true;
    }
    div.className = 'panel-slider';
  }

  slider.appendChild(div);

  number_input: {
    div = document.createElement("input");
    div.setAttribute("id", name+"-slider-num");
    div.setAttribute("type", "text");
    div.setAttribute("value", weight*100);
    if (locked){
      div.disabled = true;
    }
    div.className = 'slider-num';
  }

  slider.appendChild(div);
  inputTypeNumberPolyfill.polyfillElement(div);

  return(slider);
}

/*--resetGroups()------------------------------------------
Resets all unlocked sliders in each group to equal values.
If an array of groups is provided, will only reset those.
Parameters:
  group.............(Array) groups names
---------------------------------------------------------*/
function resetGroups(group){
  var reset = typeof group === "undefined" ? Object.keys(groups) : [group];

  for (i in reset){
    var keys = [];
    var total = 0;
    //console.log('group:', groups[reset[i]])
    for (j in groups[reset[i]]){
      !groups[reset[i]][j].lock ? keys.push(j) : null;
      total += !groups[reset[i]][j].lock ? groups[reset[i]][j].value : 0;
    }
    //console.log(keys);

    var weight = total/keys.length;
    //console.log(weight);
    for (j in keys){
      //console.log(keys[j]);
      groups[reset[i]][keys[j]].value = weight;
      $("#"+keys[j]+"-slider").val(weight/precision);
      $("#"+keys[j]+"-slider-num").val(weight/precision);
    }
  }
}

/*--balanceGroups(change)----------------------------------
Balances the unlocked sliders.
Parameters:
  groupName..........(String) name of group to balance
  sliderName.........(String) name of slider being changed
  update.............(Number) new value of changed slider
Returns:
  (Boolean) if change was made to slider
---------------------------------------------------------*/
function balanceGroups(groupName, sliderName, update){
  //console.log(groupName, sliderName, update);
  var old = groups[groupName][sliderName].value;

  update = Number(update);
  groups[groupName][sliderName].value = update;
  var min = 0,
      max = 100*precision;

  var keys = Object.keys(groups[groupName]);
  var diff_total = 100*precision;
  for (var i = 0; i < keys.length; i++){
    diff_total -= groups[groupName][keys[i]].value;
  };
  var index = keys.indexOf(sliderName);
  //console.log(groups);
  //console.log("diff_total:", diff_total, "index:", index);

  for (var i = 0; i < 2 * keys.length; i++){
    if (keys[index] != sliderName && !groups[groupName][keys[index]].lock){
      var slider = $("#"+keys[index]+"-slider");
      var label = $("#"+keys[index]+"-slider-num")
      var val = groups[groupName][keys[index]].value;
      var newVal = Math.floor(diff_total / Math.max(1, keys.length - i));
      newVal = Math.min(Math.max(val + newVal, min), max);
      slider.val(newVal/precision);
      label.val(newVal/precision);
      groups[groupName][keys[index]].value = newVal;
      diff_total -= (newVal - val);
      //console.log("slider:", keys[index], "newVal:", newVal, "change:", newVal-val, "diff_total:", diff_total);
      if (diff_total == 0){
        break;
      }
    }
    index = (keys.length + index + 1) % keys.length;
  }
  //console.log('diff_total', diff_total);
  if (diff_total != 0){
    $("#"+sliderName+"-slider").val((update + diff_total)/precision);
    $("#"+sliderName+"-slider-num").val((update + diff_total)/precision);
    groups[groupName][sliderName].value = update + diff_total;
  }

  return(groups[groupName][sliderName].value != old);
}

/*--addSlider(group, name)---------------------------------
Adds a new slider with the given name to the given group
and places it in the DOM. If the group doesn't exist,
it will be created instead.
Parameters:
  group.............(String) name of the group to add to
  name..............(String) name of the slider
  isGroup...........(Boolean) if new slider is a group
  weight............(Number) value of new slider weight (in decimal)
  locked............(Boolean) if the new slider starts locked
  flipped...........(Boolean) if the new slider starts flipped
  topLevel..........(Boolean) if the new slider is part of
                              the top level
---------------------------------------------------------*/
function addSlider(group, name, isGroup, weight, locked, flipped, topLevel){
  if (isGroup === undefined){
    isGroup = false;
  };
  if (weight === undefined){
    weight = 0;
  };
  if (locked === undefined){
    locked = false;
  };
  if (flipped === undefined){
    flipped = false;
  };
  if (topLevel === undefined){
    topLevel = false;
  };

  if (!(group in groups)){
    //console.log(group);
    groups[group] = {};

    var div = document.createElement('div');
    div.setAttribute('id', group);
    div.className = 'panel-item-group';
    var title = document.createElement('span');
    title.className = 'panel-dir';
    title.appendChild(document.createTextNode(group));
    div.appendChild(title);
    document.getElementById('control-content').appendChild(div);
  }
  groups[group][name] = {value: weight*100*precision, lock: locked};
  var panel = document.getElementById(group)
  panel.insertBefore(ControlSlider(name, isGroup, weight, locked, flipped, topLevel), panel.childNodes[4]);
  balanceGroups(group, name, weight*100*precision);

  //console.log(groups);
}

/*--removeSlider(group, name)---------------------------------
Removes a slider with the given name from the given group.
Parameters:
  group.............(String) name of the group to add to
  name..............(String) name of the slider
---------------------------------------------------------*/
function removeSlider(group, name){
  if(!(group in groups)){
    throw ("InvalidGroup");
  };
  if (!(name in groups[group])){
    throw ("InvalidSlider");
  };

  // Check if the slider is locked before removing
  if(!groups[group][name].lock){
    // Set the value of the slider to 0 first
    balanceGroups(group, name, 0);

    // Checking if the slider is not 0 (because of locked sliders)
    if (groups[group][name].value != 0){
      //console.log('removed slider cannot be made 0')
      key = Object.keys(groups[group])
      locked = []

      // Unlocking all sliders
      for (i in key){
        // Checking if slider is locked. Unlocking and push to array if true.
        if (groups[group][key[i]].lock){
          //console.log('unlocking', key[i]);
          locked.push(key[i]);
          groups[group][key[i]].lock = false;
        };
        // Setting the removed group to 0.
        if (key[i] == name){
          groups[group][name].lock = true;
          groups[group][name].value = 0;
        }

      };
      // reset groups to be balanced
      resetGroups(group, name, 0);

      // Re-locking sliders
      for (i in locked){
        if (locked[i] != name){
          groups[group][locked[i]].lock = true;
          //console.log('locking', locked[i]);
        };
      };
    };
    delete groups[group][name];
    $("#"+name).remove();

    if (Object.keys(groups[group]).length == 0){
      delete groups[group];
      $("#"+group).remove();
    }
  } else {
    alert('Slider is locked!\nPlease unlock to delete.');
  };
}

/*--verifyControl(control)---------------------------------
Checks if the new control is valid or not. Makes sure the
name/id is unique and the weight is a number.
Parameters:
  control...........(Object) the new control object
  panel.............(ControlPanel) the control panel to check in
Returns:
  (Array) indicating [0](Boolean) if valid and [1] the error
---------------------------------------------------------*/
function verifyControl(control, panel){
  //console.log(control);

  if (isNaN(control.Weight)){
    return([false, "Weight"]);
  };
  if (panel.findElement(control.Name) !== false || control.Name === '' || control.Name === undefined){
    return([false, "Name"])
  };

  return([true]);
}

/*--Event Handlers for the Control Panel-----------------*/
$(document).ready(function(){
  /*-------------------------------------------------------
  Building the initial groups object from the sliders
  -------------------------------------------------------
  var panels = $('.panel-item-group')
  for (i = 0; i < panels.length; i++){
    groups[panels[i].id] = {};

    items = $('#' + panels[i].id + '>.panel-item');

    for (j = 0; j < items.length; j++){
      groups[panels[i].id][items[j].id] = {};
      groups[panels[i].id][items[j].id]['value'] = $('#' + items[j].id + '>.panel-slider').attr('value')*precision;
      groups[panels[i].id][items[j].id]['lock'] = $('#' + items[j].id + '>.panel-lock').hasClass('locked');;
    };
  };*/
  //console.log(groups);

  /*--panel-reset onclick function-----------------------
  Re-balances all unlocked sliders.
  -------------------------------------------------------*/
  $("body").on("click", "#slider-reset", function(e){
    var cp = this.parentNode.parentNode.id;
    cp = $("#"+cp).data('cp');

    var controls = cp.controls;
    var current = cp.current;
    var keys = Object.keys(groups)
    var poi;

    console.log(keys);

    for (i in keys){
      var temp = keys[i];
      //console.log(temp);
      poi = cp.findElement(temp);

      if (temp != "Main"){
        //console.log('Not Main');
        poi = poi.Factors;
      }
      console.log('poi', poi);
      resetGroups(temp);
      newVal = 1 / poi.length;

      for (j in poi){
        //console.log(j);
        poi[j].Locked = false;
        poi[j].Weight = newVal;
      };
    };

    cp.erasePanel();
    cp.clearPanels();
    cp.buildPanels();

    cp.drawPanel(current, anim=false);
    cp.updateOptions();
  });


  /*--panel-balance onclick function-----------------------
  Re-balances all unlocked sliders.
  -------------------------------------------------------*/
  $("body").on("click", ".balance-btn", function(e){
    //console.log('balanced', this.id.substr(0, this.id.length-8));
    resetGroups(this.id.substr(0, this.id.length-8));

    var cp = this.parentNode.parentNode.id;
    cp = $("#"+cp).data('cp');
    cp.updateOptions();
  });

  /*--panel-destroy onclick function--------------------------
  Removes the slider panel.
  -------------------------------------------------------*/
  $("body").on("click", ".panel-destroy", function(e){
    var ele = this.id.substr(0, this.id.length-8);
    var group = this.parentNode.parentNode.id;

    var cp = $("#"+group)[0].parentNode.id;
    cp = $("#"+cp).data('cp');

    removeSlider(group, ele);
    cp.updateOptions();
  });

  /*--panel-lock onclick function--------------------------
  Locks the inputs of a panel when clicking the lock button
  and toggles the lock state in the groups object.
  -------------------------------------------------------*/
  $("body").on("click", ".panel-lock", function(e){
    //console.log(this.id);
    var ele = $("#" + this.id);
    var group = this.parentNode.parentNode.id;
    //console.log(group);
    var cp = $("#"+group)[0].parentNode.id;
    cp = $("#"+cp).data('cp');

    if (ele.hasClass('locked')){
      ele.removeClass('locked');
      ele.addClass('fa-unlock-alt');
      ele.removeClass('fa-lock');
      ele.attr("alt", "Lock");
      ele.attr("title", "Lock");

      $('#' + this.id.substr(0, this.id.length-5) + '>input').prop('disabled', false);

      $('#' + this.id.substr(0, this.id.length-5) + '>.panel-destroy').removeClass('disabled');
      $('#' + this.id.substr(0, this.id.length-5) + '>.panel-flip').removeClass('disabled');
      groups[group][this.id.substr(0, this.id.length-5)].lock = false;
    } else {
      ele.addClass('locked');
      ele.removeClass('fa-unlock-alt');
      ele.addClass('fa-lock');
      ele.attr("alt", "Unlock");
      ele.attr("title", "Unlock");

      $('#' + this.id.substr(0, this.id.length-5) + '>input').prop('disabled', true);

      $('#' + this.id.substr(0, this.id.length-5) + '>.panel-destroy').addClass('disabled');
      $('#' + this.id.substr(0, this.id.length-5) + '>.panel-flip').addClass('disabled');
      groups[group][this.id.substr(0, this.id.length-5)].lock = true;
    };

    cp.updateOptions(name=group,silent=true);
    //console.log(groups);
  });

  /*--panel-flip onclick function--------------------------
  Sets the flipped property of a factor or group
  -------------------------------------------------------*/
  $("body").on("click", ".panel-flip", function(e){
    //console.log(this.id);
    var ele = $("#" + this.id);
    var group = this.parentNode.parentNode.id;
    //console.log(group);
    var cp = $("#"+group)[0].parentNode.id;
    cp = $("#"+cp).data('cp');

    if(ele.hasClass('disabled')){
      alert('Slider is locked!\nPlease unlock to flip factor.')
      return;
    }

    if (ele.hasClass('fa-minus')){
      ele.addClass('fa-plus');
      ele.removeClass('fa-minus');
      ele.attr("alt", "Invert");
      ele.attr("title", "Invert");

      groups[group][this.id.substr(0, this.id.length-5)].flipped = false;
    } else {
      ele.removeClass('fa-plus');
      ele.addClass('fa-minus');
      ele.attr("alt", "Normal");
      ele.attr("title", "Normal");

      groups[group][this.id.substr(0, this.id.length-5)].flipped = true;
    };

    cp.updateOptions();
    //console.log(groups);
  });

  /*--panel-select onclick function------------------------
  Sets the flipped property of a factor or group
  -------------------------------------------------------*/
  $("body").on("click", ".panel-select", function(e){
    //console.log(this.id);
    var ele = $("#" + this.id);
    var group = this.parentNode.parentNode.id;
    //console.log(group);
    var cp = $("#"+group)[0].parentNode.id;
    cp = $("#"+cp).data('cp');

    if (ele.hasClass('fa-circle-o')){
      ele.addClass('fa-circle');
      ele.removeClass('fa-circle-o');
      ele.attr("alt", "Deselect");
      ele.attr("title", "Deselect");

      cp.selectPanel(ele[0].id.substr(0, ele[0].id.length-7));
    } else {
      ele.removeClass('fa-circle');
      ele.addClass('fa-circle-o');
      ele.attr("alt", "Select");
      ele.attr("title", "Select");

      cp.deselectPanel(ele[0].id.substr(0, ele[0].id.length-7));
    };
  });

  /*--panel-add onclick function---------------------------
  Opens up a dialogue to add a new item to a panel.
  -------------------------------------------------------*/
  $("body").on("click", ".panel-add", function(e){
    //console.log(this.id);
    var ele = $("#"+this.id);

    if(ele.attr('disabled')){
      return;
    } else {
      ele.attr('disabled', true);
    }

    ap.removeSelf();
    ap = new AddPanel()

    $("#"+this.id+">i").animate({
      marginLeft: "-100%", opacity: "0"
    }, {
      duration: 200
    });

    ele.animate({
      height: '220px'
    }, {
      duration: 300,
      complete: function(){
        ele.removeClass('panel-add');
        ele.addClass('panel-add-text');

        form = $(ap.getNext());

        ele.append(form.css({opacity: 0}));
        ele.attr('disabled', false);
        ele.css({height: 'auto'});
        form.animate({opacity: '1'}, {duration: 200});
      }
    })
  });

  /*--add-content keydown function-------------------------
  Allows users to hit enter on text fields to submit form.
  -------------------------------------------------------*/
  $("body").on("keydown", ".add-content>form>input", function(e){
    if (e.keyCode == 13){
      $(".add-content>form>input[type=button]").trigger('click');
    }
  })

  /*--add-content>cancel click function--------------------
  Handles when the user hits cancel on the add form.
  -------------------------------------------------------*/
  $("body").on("click", ".add-content>.add-cancel", function(e){
    console.log('cancel');
    ap.removeSelf();
  });

  /*--add-content>button click function--------------------
  Handles when the user hits next on the add form.
  -------------------------------------------------------*/
  $("body").on("click", ".add-content>form>input[type=button]", function(e){
    var ele = $("#"+this.parentNode.parentNode.parentNode.id);
    var cp = ele[0].parentNode.parentNode.id;
    //console.log(cp);
    cp = $("#"+cp).data('cp');
    //console.log(cp);

    //console.log(ele[0].id);
    if (this.id == 'f_3'){
      var form = $(ap.getNext());

      $('#'+ele[0].id+'>.add-content').remove();
      ele.append(form.css({opacity: 0}));
      form.animate({opacity: '1'}, {duration: 200});
      //console.log(ap);
    } else if (this.id == 'f_6'){
      newControl = ap.getData();
      verify = verifyControl(newControl, cp);
      var errPage = $('#'+ele[0].id+'>.add-content>#add-error');
      typeof errPage !== 'undefined' ? errPage.remove() : null;
      if (!verify[0]){
        //console.log(verify);
        $('#'+ele[0].id+'>.add-content').append(
          $("<span id='add-error'>Invalid " + (verify[1] == "Weight" ?
            "weight, please use numbers only." :
            "name, please use a unique name.") + "</span>")
        );
      } else {
        ap.removeSelf();
        //console.log(newControl.Weight);
        //console.log(ele[0].id.substr(0, ele[0].id.length-4) == 'Main');
        addSlider(ele[0].id.substr(0, ele[0].id.length-4), newControl.Name,
                  newControl.Factors, newControl.Weight, false,
                  ele[0].id.substr(0, ele[0].id.length-4) == 'Main');

        if (newControl.Factors !== undefined){
          cp.addGroup(newControl.Name, ele[0].id.substr(0, ele[0].id.length-4));
        };
        //console.log(cp);
        cp.updateOptions();
      }
    }

    //console.log("next");
  })

  /*--panel-group onclick function-------------------------
  Swaps the panel forward to what is in a group.
  -------------------------------------------------------*/
  $("body").on("click", ".panel-group>label", function(e){
    ap.removeSelf();
    var ele = e.currentTarget.id.substr(0, e.currentTarget.id.length-13)

    $($('#'+ele+'>.scroll-label')[0].lastChild).stop().css({"left": 0});
    //console.log(ele);
    var cp = $("#"+ele)[0].parentNode.parentNode.id;
    cp = $("#"+cp).data('cp');
    //console.log(cp);
    cp.drawPanel(ele);
  })

  $("body").on("mouseenter", ".scroll-label",
  function(e){
    var label = $(this);
    var text = $(this.lastChild);
    var diff = text.width() - label.width();

    var animateLabel = function(){
      text.animate({
        left: "-="+String(diff)
      }, {
        duration: (text.width()-label.width())*25,
        easing: 'linear'
      })
    }

    //console.log(diff)
    if (diff > 0){
        animateLabel()
    }

  }).on("mouseleave", ".scroll-label",
  function(e){
    //console.log('stop');
    $(this.lastChild).stop().css({"left": 0});
  })

  /*--panel-dir onclick function---------------------------
  Swaps the panel back to whatever was selected in the top
  directory.
  -------------------------------------------------------*/
  $("body").on("click", ".panel-dir>span", function(e){
    ap.removeSelf();
    var ele = $(e.currentTarget)[0].parentNode.parentNode.parentNode.id;
    var cp = $("#"+ele).data('cp');
    //console.log(e.currentTarget.innerHTML);
    cp.drawPanel(e.currentTarget.innerHTML);
  })

  /*--panel-slider oninput function------------------------
  updates the number input on the right and re-balances the
  sliders in the group.
  -------------------------------------------------------*/
  $("body").on("input", ".panel-slider", function(e){
    var ele = e.currentTarget.id.substr(0, e.currentTarget.id.length-7)
    //console.log(ele);
    var cp = $("#"+ele)[0].parentNode.parentNode.id;
    cp = $("#"+cp).data('cp');
    //console.log(e);
    var group = this.parentNode.parentNode.id;
    var label = $('#' + e.target.id + '-num');
    label.val(this.value);

    silent = balanceGroups(group, e.target.id.substr(0, e.target.id.length-7), Number(this.value)*precision);
    //console.log(silent);
    cp.updateOptions(group, !silent);
  });

  /*--slider-num onkeydown function------------------------
  handles the ENTER key for the number input. This will blur
  the input and trigger a change event for this input.
  This will also handle when the user enters a number that is
  greater than 100.
  -------------------------------------------------------*/
  $("body").on("keydown", ".slider-num", function(e){
    if (e.keyCode === 13){
      if(Number(this.value) > 100){
        this.value = 100;
      };
      this.blur();
      $(this).trigger('change');
    } else if (e.keyCode === 190){
      if (this.value.indexOf('.') === -1){
        var cursor = this.selectionStart;
        this.value = this.value.slice(0, cursor) + '.' + this.value.slice(cursor);
        this.selectionStart = cursor+1;
        this.selectionEnd = cursor+1;
      }
    };
  });

  /*--slider-num onblur function--------------------------
  triggers a change event when blurred.
  -------------------------------------------------------*/
  /*$("body").on("blur", ".slider-num", function(e){
    $(this).trigger('change');
  })*/

  /*--slider-num onchange function-------------------------
  updates the slider element based on the number input and
  re-balances the sliders in the group.
  -------------------------------------------------------*/
  $("body").on("change", ".slider-num", function(e){
    //console.log(Number(this.value));
    var group = this.parentNode.parentNode.id;
    var slider = $('#' + e.target.id.substr(0, e.target.id.length-4));
    var value = Math.min(100, Number(this.value))*precision;

    var cp = $("#"+group)[0].parentNode.id;
    cp = $("#"+cp).data('cp');

    slider.val(value/precision);

    silent = balanceGroups(group, e.target.id.substr(0, e.target.id.length-11), value);
    //console.log('slider-num', silent);
    cp.updateOptions(group, !silent);
  });
})
