var tester = {};
tester.group_node = null;

// Determine if A and B are equal. A and B can be objects.
tester.is_equal = function(A,B){
  // Quick and dirty
  // Beware of the order of properties {a:,b:}!=={b:,a:}
  return (JSON.stringify(A) === JSON.stringify(B));
};

tester.make_header_onclick = function(header){
  return function(){
    var sibling = header.nextSibling,
        isVisible = (sibling.className.indexOf('show') !== -1);
    if( isVisible ){
      sibling.className = sibling.className.replace(/\bshow\b/g,'hide');
    }else{
      sibling.className = sibling.className.replace(/\bhide\b/g,'show');
    }
  };
};

tester.show_all = function(id){
  var container = document.getElementById(id),
      divs = container.getElementsByTagName('div'),
      l = divs.length,
      i, div;
  for( i=0; i<l; i+=1 ){
    div = divs[i];
    div.className = div.className.replace(/\bhide\b/g,'show');
  }
};

tester.hide_all = function(id){
  var container = document.getElementById(id),
      divs = container.getElementsByTagName('div'),
      l = divs.length,
      i, div;
  for( i=0; i<l; i+=1 ){
    div = divs[i];
    div.className = div.className.replace(/\bshow\b/g,'hide');
  }
};

// Create a dom node. For example:
// tester.dom('div',{className:'pretty'},nodes)
// => <div class="pretty">nodes</div>
tester.dom = function(element,options,content){

  // Create the node
  var node = document.createElement(element),
      opt, i, l;

  // Appy the properties (ie className, style, etc...)
  for( opt in options ){
    if( options.hasOwnProperty(opt) ){
      node[opt] = options[opt];
    }
  }

  // if the content is an array append all as sibling
  if( content instanceof Array ){
    l = content.length;
    for( i=0; i<l; i+=1 ){
      node.appendChild(content[i]);
    }
  } else {
    node.appendChild(content);
  }

  return node;
};

// Returns a dom text node.
tester.text = function(text){
  return document.createTextNode(text);
};

// Returns a slightly clearer copy of the code string
tester.clean_code = function(code){
  // find the amount of indent of the closing '}'
  // and remove that amount of space from the 
  // beginning of every line

  var last_bracket = /([ \t]*)\}$/.exec(code);
  var clean = code, space_regex;

  if( last_bracket ){
    space_regex = new RegExp('^'+last_bracket[1],'gm');
    clean = code.replace(space_regex,'');
  }

  return clean;
};

// Groups the next set of examples/tests together
tester.group = function(id,title,description,parent){

  // Create buttons for showing/hiding everything
  var btn_show = tester.dom('button',{},tester.text('Show All')),
      btn_hide = tester.dom('button',{},tester.text('Hide All'));
  btn_show.onclick = function(){
    tester.show_all(id);
  };
  btn_hide.onclick = function(){
    tester.hide_all(id);
  };

  // Setup the group area
  /*
  if( description !== '' ){
    tester.group_node = tester.dom('div',{className: 'group', id: id.toLowerCase().replace(/\s+/g,'_')},[
      tester.dom('h2',{},[
        tester.text(title),
        btn_show,
        btn_hide
      ]),
      tester.dom('p',{},tester.text(description)),
    ]);
  }else{
    tester.group_node = tester.dom('div',{className: 'group', id: id.toLowerCase().replace(/\s+/g,'_')},[
      tester.dom('h2',{},[
        tester.text(title),
        btn_show,
        btn_hide
      ])
    ]);
  }
  */

  if( description !== '' ){
    tester.group_node = tester.dom('div',{className: 'group', id: id.toLowerCase().replace(/\s+/g,'_')},[
      tester.dom('h2',{},[
        tester.text(title)
      ]),
      btn_show,
      btn_hide,
      tester.dom('p',{},tester.text(description)),
    ]);
  }else{
    tester.group_node = tester.dom('div',{className: 'group', id: id.toLowerCase().replace(/\s+/g,'_')},[
      tester.dom('h2',{},[
        tester.text(title)
      ]),
      btn_show,
      btn_hide
    ]);
  }

  // Add the group to the parent
  parent.appendChild(tester.group_node);
};

// Shows but does not run code
tester.no_run = function(name,description,run){
  var code = tester.clean_code(run.toString());

  var node = tester.dom('div',{className: 'example'},[
    tester.dom('h3',{},tester.text(name)),
    tester.dom('div',{className:'show'},[
      tester.dom('p',{},tester.text(description.replace(/\s+/g,' '))),
      tester.dom('pre',{},tester.text(code))
    ])
  ]);

  var header = node.getElementsByTagName('h3')[0];
  header.onclick = tester.make_header_onclick(header);

  tester.group_node.appendChild(node);
};

// Runs an example
tester.example = function(name,description,run){
  var code = tester.clean_code(run.toString()),
      result, is_error=0;

  // Safely run code
  try{
    result = run();
  }catch(e){
    is_error = 1;
    result = e;
  }

  var node = tester.dom('div',{className: 'example'},[
    tester.dom('h3',{},tester.text(name)),
    tester.dom('div',{className:'show'},[
      tester.dom('p',{},tester.text(description.replace(/\s+/g,' '))),
      tester.dom('pre',{},tester.text(code)),
      tester.dom('p',{}, tester.text('The result is: '+JSON.stringify(result)))
    ])
  ]);

  var header = node.getElementsByTagName('h3')[0];
  header.onclick = tester.make_header_onclick(header);

  tester.group_node.appendChild(node);
};

// Runs a test, making sure the expected result is achieved
tester.test = function(name,description,run,expected){
  var code = tester.clean_code(run.toString()),
      result, result_dom, pass_or_fail, is_error=0;

  // Safely run code
  try{
    result = run();
  }catch(e){
    result = e;
    is_error = 1;
  }

  if( tester.is_equal(result,expected) ){
    pass_or_fail = 'pass';
    result_dom = tester.dom('p',{}, tester.text('Passed, the result is: '+JSON.stringify(result)));
  }else{
    pass_or_fail = 'fail';
    if( is_error ){
      result_dom = tester.dom('p',{}, tester.text('Failed, do to error: '+result));      
    }else{
      result_dom = tester.dom('p',{}, tester.text('Failed, expected '+JSON.stringify(expected)+' but got '+JSON.stringify(result)));
    }
  }

  var node = tester.dom('div',{className: 'test '+pass_or_fail},[
    tester.dom('h3',{},tester.text(name)),
    tester.dom('div', {className: 'show'},[
      tester.dom('p',{},tester.text(description.replace(/\s+/g,' '))),
      tester.dom('pre',{},tester.text(code)),
      result_dom
    ])
  ]);

  var header = node.getElementsByTagName('h3')[0];
  header.onclick = tester.make_header_onclick(header);

  tester.group_node.appendChild(node);
};