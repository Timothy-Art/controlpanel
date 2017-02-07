var groups = {};
var precision = 1000;
var ap = new AddPanel();

/*--ControlSlider(options, containerId)--------------------
A class containing the html elements for the add panels
different screens.
Properties:
  stage.............(Object) Containing HTML for each form
  current...........(Number) current stage in the form
Functions:
  createRadio(), createText(), createButton(),
  getNext(), getData()
---------------------------------------------------------*/
function AddPanel() {
  this.stage = [];
  this.current = -1;
}

/*--createRadio()------------------------------------------
Internal function to create a radio button
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
Internal function to create a text input
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
Internal function to create a next button
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
AddPanel.prototype.getNext = function() {
  this.current++;
  if(this.current == 0){
    var span = document.createElement('span');

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
  } else if(this.current = 1) {
    var span = document.createElement('span')

    var i = document.createElement('div');
    if(this.stage[0].children[2][0].checked){
      i.appendChild(document.createTextNode('Name and Weight:'));
    } else {
      i.appendChild(document.createTextNode('Factor and Weight:'));
    };
    i.classList.add('title');

    span.appendChild(i);
    span.appendChild(document.createElement('hr'));

    var form = document.createElement('form');
    if(this.stage[0].children[2][0].checked){
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
AddPanel.prototype.getData = function() {
  var slider = {};

  if (this.stage.length != 2){
    throw("FormIncomplete");
  }

  if (this.stage[0].children[2][0].checked){
    slider["Factors"] = {};
  }

  slider["Name"] = this.stage[1].children[2][0].value;
  slider["Weight"] = Number(this.stage[1].children[2][1].value)/100;
  slider["Locked"] = false;

  return(slider);
};

/*--removeSelf()-------------------------------------------
Removes the add panel from the DOM
---------------------------------------------------------*/
AddPanel.prototype.removeSelf = function() {
  if (this.current < 0){
    return;
  }
  //console.log('removed');
  $(this.stage[this.current]).remove();
}

/*--ControlSlider(options, containerId)--------------------
A class that contains the html elements for the control panel
and subgroups. Initialize with an options object and an
html container id to place the panel in.
Parameters:
  options...........(Object) from a configurations json
  containerId.......(String) div id
Properties:
  panels............(Object) containing the html elements,
                            indexed with the group names
  container.........(String) container id of the control panel
  controls..........(Object) configuration based on the options
  misc..............(Object) extra options
  current...........(String) name of the currently displayed group
Functions:
  buildPanels(), findElement(name), findParent(name),
  retrievePanel(name), drawPanel(name), updateOptions(name)
---------------------------------------------------------*/
function ControlPanel(options, containerId) {
  this.panels = {};
  this.container = containerId;
  this.controls = options.Options;
  this.misc = [options.DateCreated, options.ManagerID, options.ID, options.Name, options.Tickers, options.ProfileName];
  this.current = '';
};

/*--__genName__(names)--------------------------------------
Builds the html name chain for a panel.
Parameters:
  names.............(Array) List of names to chain
Returns:
  (String) HTML elements to add for title.
---------------------------------------------------------*/
ControlPanel.prototype.__genName__ = function(names) {
  prefix = '';
  span = document.createElement('span');
  span.className = 'panel-dir';
  for (var i = names.length-1; i >= 0; i--){
    span.appendChild(document.createTextNode(prefix));
    chain = document.createElement('a');
    chain.appendChild(document.createTextNode(names[i]));
    chain.setAttribute('href', '#');
    span.appendChild(chain);
    prefix = ' > ';
  };
  return(span);
};

/*--__genNameChain__(name)--------------------------------------
Builds a sequence of names for the path of a given name/id
Parameters:
  name..............(String) name to create chain for
Returns:
  (Array) Sequence of names
---------------------------------------------------------*/
ControlPanel.prototype.__genNameChain__ = function(name, __pos__, __panel__, __chain__) {
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
    } else if (keys[i] !== 'html') {
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
Resets the controls object
Parameters:
  options...........(Object) of options
---------------------------------------------------------*/
ControlPanel.prototype.setControls = function(options) {
  this.controls = options.Options;
  this.misc = [options.DateCreated, options.ManagerID, options.ID, options.Name, options.Tickers, options.ProfileName];
  this.current = '';
};

/*--buildPanels()------------------------------------------
Builds and stores the html elements for all panels/subpanels
based on the options passed in the constructor
---------------------------------------------------------*/
ControlPanel.prototype.buildPanels = function(__iter__, __pos__, __name__) {
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
      balance.className = 'panel-balance';
      var icon = document.createElement('i');
      icon.className = 'fa fa-sliders';
      icon.setAttribute('aria-hidden', 'true');
      balance.appendChild(icon);
      __pos__['html'].appendChild(balance);

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
      groups[__name__[0]][__iter__[i].Name] = {value: __iter__[i].Weight*100*precision, lock: __iter__[i].Locked || false};
      groups[__iter__[i].Name] = {};

      __pos__['html'].appendChild(ControlSlider(__iter__[i].Name, true, __iter__[i].Weight, __iter__[i].Locked || false, __name__[0]=='Main'));
      __pos__[__iter__[i].Name] = {};
      __name__.unshift(__iter__[i].Name)
      this.buildPanels(__iter__[i].Factors, __pos__[__iter__[i].Name], __name__);
      __name__.shift();
    } else {
      groups[__name__[0]][__iter__[i].Name] = {value: __iter__[i].Weight*100*precision, lock: __iter__[i].Locked || false};
      __pos__['html'].appendChild(ControlSlider(__iter__[i].Name, false, __iter__[i].Weight, __iter__[i].Locked || false, __name__[0]=='Main'));
    }
  };
};

/*--findElement(name)--------------------------------------
Finds and returns a control given a name/id
Parameters:
  name..............(String) id of the element
Returns:
  (Object) Found control
---------------------------------------------------------*/
ControlPanel.prototype.findElement = function(name) {
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
Returns parent of a given element name
Parameters:
  name..............(String) id of the element
Returns:
  (Object) Parent panel
---------------------------------------------------------*/
ControlPanel.prototype.findParent = function(name) {
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
Returns html element of a requested panel
Parameters:
  name..............(String) id of the panel requested
Returns:
  (Object) Panel element
---------------------------------------------------------*/
ControlPanel.prototype.retrievePanel = function(name, __pos__) {
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

/*--drawPanel(name)----------------------------------------
Draws the requested panel to the ControlPanel container
Parameters:
  name..............(String) id of the panel to show
---------------------------------------------------------*/
ControlPanel.prototype.drawPanel = function (name) {
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

/*--addGroup(name, parent)---------------------------------
Adds a new group to the panel. Will insert at a specified
parent which otherwise defaults to the current panel.
Parameters:
  name..............(String) id of the new group
  parent............(String) id of the parent panel
---------------------------------------------------------*/
ControlPanel.prototype.addGroup = function (name, parent) {
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
---------------------------------------------------------*/
ControlPanel.prototype.updateOptions = function (name) {
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
        } else {
          opts.unshift({Name: p, Weight: Number($('#'+p+'-slider-num').val())/100})
        };
        marked.push(poi);
      };
    };
  };

  var keys = Object.keys(opts);
  //console.log(marked, keys);

  for (i in keys) {
    //console.log(i);
    if (marked.indexOf(keys[i]) == -1){
      opts.splice(Number([keys[i]]), 1);
    };
  };

  //console.log(opts);
  //console.log(this.controls);
  $('#'+this.container).trigger('controlchanged');
};

/*--getOptions()-------------------------------------------
Returns an options object based on the current state of the
ControlPanel.
Returns:
  (Object) Options
---------------------------------------------------------*/
ControlPanel.prototype.getOptions = function() {
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
A function to build and return a control slider html element
Parameters:
  name..............(String) id for the slider
  group.............(Boolean) true if it's a group
  weight............(Number) value of the slider and num-input
  locked............(Boolean) if the slider is locked
  topLevel..........(Boolean) if the slider is part of
                              the top level
Returns:
  (String) HTML element of the slider
---------------------------------------------------------*/
function ControlSlider(name, group, weight, locked, topLevel){
  if(group === undefined){
    group = false;
  }
  if(weight === undefined){
    weight = 0;
  }
  if(locked === undefined){
    locked = false;
  }
  if(topLevel === undefined){
    topLevel = false;
  }

  slider = document.createElement("div");
  slider.setAttribute("id", name);
  slider.className = 'panel-item';
  slider.className += group ? ' panel-group' : '';
  slider.className += topLevel ? ' panel-top' : '';

  destroy_button: {
    div = document.createElement("div");
    div.setAttribute("id", name+"-destroy");
    div.setAttribute("alt", "Remove Factor");
    div.setAttribute("title", "Remove Factor");
    div.className = 'panel-destroy';
    div.appendChild(document.createTextNode("\u2716"));
  }

  slider.appendChild(div);

  lock_button: {
    div = document.createElement("div");
    div.setAttribute("id", name+"-lock");
    div.setAttribute("alt", "Lock Factor");
    div.setAttribute("title", "Lock Factor");
    div.className = 'panel-lock';
    if(locked){
      div.className += ' locked'
    }
    lock_icon: {
        i = document.createElement("i");
        if(locked){
          i.className = 'fa fa-lock'
        } else {
          i.className = "fa fa-unlock-alt";
        }
        i.setAttribute('aria-hidden', "true");
    }
    div.appendChild(i);
  }

  slider.appendChild(div);

  label: {
    div = document.createElement("label");
    div.setAttribute("id", name+"-slider-label");
    if (group){
      icon = document.createElement("i");
      icon.className = 'fa fa-plus-circle';
      icon.setAttribute('aria-hidden', 'true');
      div.appendChild(icon);
    }
    div.appendChild(document.createTextNode(name));
  }

  slider.appendChild(div);

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
    div.setAttribute("max", "100");
    div.setAttribute("min", "0");
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
  change............(Object) containing the [0] group name,
                            [1] slider name, [2] new value
---------------------------------------------------------*/
function balanceGroups(groupName, sliderName, update){
  //console.log(groupName, sliderName, update);
  update = Number(update);
  groups[groupName][sliderName].value = update;
  var min = 0,
      max = 100*precision;

  var keys = Object.keys(groups[groupName]);
  var diff_total = 100*precision;
  for (var i = 0; i < keys.length; i++) {
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
  //console.log(diff_total);
  if (diff_total != 0){
    $("#"+sliderName+"-slider").val((update + diff_total)/precision);
    $("#"+sliderName+"-slider-num").val((update + diff_total)/precision);
    groups[groupName][sliderName].value = update + diff_total;
  }
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
  topLevel..........(Boolean) if the new slider is part of
                              the top level
---------------------------------------------------------*/
function addSlider(group, name, isGroup, weight, locked, topLevel){
  if (isGroup === undefined){
    isGroup = false;
  };
  if (weight === undefined){
    weight = 0;
  };
  if (locked === undefined){
    locked = false;
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
  panel.insertBefore(ControlSlider(name, isGroup, weight, locked, topLevel), panel.childNodes[3]);
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
  if (!(name in groups[group])) {
    throw ("InvalidSlider");
  };

  if(!groups[group][name].lock){
    balanceGroups(group, name, 0);
    if(groups[group][name].value != 0){
      key = Object.keys(groups[group])
      for (i in key){
        groups[group][key[i]].lock = false;
      };
      balanceGroups(group, name, 0);
      for (i in key){
        if (key[i] != name){
          groups[group][key[i]].lock = true;
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

  /*--panel-balance onclick function-----------------------
  Re-balances all unlocked sliders
  -------------------------------------------------------*/
  $("body").on("click", ".panel-balance", function(e){
    //console.log('balanced', this.id.substr(0, this.id.length-8));
    resetGroups(this.id.substr(0, this.id.length-8));
  });

  /*--panel-destroy onclick function--------------------------
  Removes the slider panel.
  -------------------------------------------------------*/
  $("body").on("click", ".panel-destroy", function(e){
    ele = this.id.substr(0, this.id.length-8);
    group = this.parentNode.parentNode.id;

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
    ele = $("#" + this.id);
    group = this.parentNode.parentNode.id;
    //console.log(group);

    if (ele.hasClass('locked')){
      ele.removeClass('locked');
      $('#' + this.id + '>.fa').addClass('fa-unlock-alt');
      $('#' + this.id + '>.fa').removeClass('fa-lock');

      $('#' + this.id.substr(0, this.id.length-5) + '>input').prop('disabled', false);
      groups[group][this.id.substr(0, this.id.length-5)].lock = false;
    } else {
      ele.addClass('locked');
      $('#' + this.id + '>.fa').removeClass('fa-unlock-alt');
      $('#' + this.id + '>.fa').addClass('fa-lock');

      $('#' + this.id.substr(0, this.id.length-5) + '>input').prop('disabled', true);
      groups[group][this.id.substr(0, this.id.length-5)].lock = true;
    };

    //console.log(groups);
  });

  /*--panel-add onclick function---------------------------
  Opens up a dialogue to add a new item to a panel
  -------------------------------------------------------*/
  $("body").on("click", ".panel-add", function(e){
    //console.log(this.id);
    ele = $("#"+this.id);

    if(ele.attr('disabled')) {
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
        form.animate({opacity: '1'}, {duration: 200});
      }
    })
  });

  /*--add-content keydown function-------------------------
  Allows users to hit enter on text fields to submit form
  -------------------------------------------------------*/
  $("body").on("keydown", ".add-content>form>input", function(e) {
    if (e.keyCode == 13){
      $(".add-content>form>input[type=button]").trigger('click');
    }
  })

  /*--add-content>button click function--------------------
  Handles when the user hits next on the add form
  -------------------------------------------------------*/
  $("body").on("click", ".add-content>form>input[type=button]", function(e) {
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
      if (!verify[0]) {
        //console.log(verify);
        $('#'+ele[0].id+'>.add-content').append(
          $("<span id='add-error'>Invalid " + (verify[1] == "Weight" ?
            "weight, please use numbers only." :
            "name, please use a unique name.") + "</span>")
        );
      } else {
        $('#'+ele[0].id+'>.add-content').remove();
        $('#'+ele[0].id+'>i').css({'margin-left': 'inherit', 'opacity': 1});
        ele.removeClass('panel-add-text').addClass('panel-add');
        ele.css({'height': 'auto'});
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
    var ele = e.currentTarget.id.substr(0, e.currentTarget.id.length-13)
    console.log(ele);
    var cp = $("#"+ele)[0].parentNode.parentNode.id;
    cp = $("#"+cp).data('cp');
    console.log(cp);
    cp.drawPanel(e.currentTarget.id.substr(0, e.currentTarget.id.length-13));
  })

  /*--panel-dir onclick function---------------------------
  Swaps the panel back to whatever was selected in the top
  directory
  -------------------------------------------------------*/
  $("body").on("click", ".panel-dir>a", function(e){
    var ele = $(e.currentTarget)[0].parentNode.parentNode.parentNode.id;
    var cp = $("#"+ele).data('cp');
    cp.drawPanel(e.target.text);
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

    balanceGroups(group, e.target.id.substr(0, e.target.id.length-7), Number(this.value)*precision);
    cp.updateOptions();
  });

  /*--slider-num onkeydown function------------------------
  handles the ENTER key for the number input. This will blur
  the input and trigger a change event for this input.
  This will also handle when the user enters a number that is
  greater than 100.
  -------------------------------------------------------*/
  $("body").on("keydown", ".slider-num", function(e){
    if(e.keyCode === 13){
      e.target.blur();
      $(e.target.id).trigger('change');
      if(this.value > 100) {
        this.value = 100;
      };
    };
  });

  /*--slider-num onchange function-------------------------
  updates the slider element based on the number input and
  re-balances the sliders in the group.
  -------------------------------------------------------*/
  $("body").on("change", ".slider-num", function(e){
    var group = this.parentNode.parentNode.id;
    var slider = $('#' + e.target.id.substr(0, e.target.id.length-4));
    var value = Math.min(100, Number(this.value))*precision;
    slider.val(value/precision);

    balanceGroups(group, e.target.id.substr(0, e.target.id.length-11), value);
  });
})