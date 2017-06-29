
var ui = {};

ui.view = function(data){
	var view = [[NSView alloc] initWithFrame:NSMakeRect(data.x || 0, data.y || 0, data.width || 315, data.height || 50)];
	this.add = function(item){
		var child = item.get();
		[view addSubview:child];
	};
	this.remove = function(item){
		var child = item.get();
		[child removeFromSuperview];
	};
	this.get = function(){
		return view;
	};
};

ui.createRow = function(data){
	var row = [[NSView alloc] initWithFrame:NSMakeRect(data.x || 0, data.y || 0, 315, 50)];
	var dropdown = ui.dropdown(data);
	var label = ui.label(data);
	var divider = new ui.divider().get();

	[row addSubview:label];
	[row addSubview:dropdown];
	[row addSubview:divider];

	this.select = function(id){
		[dropdown selectItemAtIndex:id];
	};
	this.selectWithTitle = function(id){
		[dropdown selectItemWithTitle:id];
	}
	this.selectWithIndex = function(id){
		[dropdown selectItemAtIndex:id];
	}
	this.selectWithValue = function(value, key){
		var keyID;
		if(key){
			for(var i in data.values){
				if(data.values[i][key]==value){
					keyID = i;
					break;
				}
			}
		}else{
			keyID = data.values.indexOf(value);
		}
		[dropdown selectItemAtIndex:keyID];
	}
	this.enable = function(id, value){
		if(Number.isInteger(id)){
			[[dropdown itemAtIndex:id] setEnabled:value];
		}else{
			[[dropdown itemWithTitle:id] setEnabled:value];
		}
	};
	this.index = function(){
		return [dropdown indexOfSelectedItem];
	};
	this.value = function(){ 
		var values = data.values ? data.values : data.items;
		return values[[dropdown indexOfSelectedItem]]; //[dropdown titleOfSelectedItem];
	};
	this.getTitleByValue = function(value){
		return data.items[data.values.indexOf(value)];
	};
	this.setLabel = function(value){
		[label setStringValue:value];
	};
	this.get = function(){
		return row;
	};
};

ui.createInputRow = function(data){
	var row = [[NSView alloc] initWithFrame:NSMakeRect(data.x || 0, data.y || 0, 315, 50)];
	var label = ui.label(data);
	var divider = new ui.divider().get();

	var input = [[NSTextField alloc] initWithFrame:NSMakeRect(122,20,45,25)];
	var label2 = ui.label({
		label:{
			x: 174,
			title: 'sec'
		}
	});

	[row addSubview:label];
	[row addSubview:input];
	[row addSubview:divider];
	[row addSubview:label2];

	this.value = function(value){
		if(value){
			[input setStringValue:value];
		}else{
			return [input doubleValue];
		}
	};
	this.get = function(){
		return row;
	};
};

ui.dropdown = function(data){
	var dropdown = [[NSPopUpButton alloc] initWithFrame:NSMakeRect(120,22,157,25)];
	for(var v in data.items){
		[dropdown addItemWithTitle:@" "];
   		[[dropdown lastItem] setTitle:data.items[v]];
	}
	// [dropdown setBordered:false];
	[dropdown setAutoenablesItems:false];
	[dropdown selectItemAtIndex:data.index];
	[dropdown setFont:[NSFont systemFontOfSize:11]];


	if(data.onchange){
		dropdown.setCOSJSTargetFunction(data.onchange);
	}
	return dropdown;
};

ui.label = function(data){

	var data = data.label ? data.label : {};
	var label = [[NSTextField alloc] initWithFrame:NSMakeRect(data.x || 0, data.y || 17, data.width || 120, data.height || 25)];
	[label setStringValue:data.title];
	if(data.bold){
		[label setFont:[NSFont boldSystemFontOfSize:(data.size || 11)]];
	}else{
		[label setFont:[NSFont systemFontOfSize:11]];
	}
	if(data.white){
		[label setTextColor:[NSColor whiteColor]];
	}
	
	[label setBezeled:false];
	[label setDrawsBackground:false];
	[label setEditable:false];
	[label setSelectable:false];
	return label;
};

ui.divider = function(data){
	var data = data && data.divider ? data.divider : {};
    var divider = [[NSBox alloc] initWithFrame:NSMakeRect(data.x || 0, data.y || 0, 275, 20)];
    [divider setBoxType:2];
	this.get = function(){
		return divider;
	};
    // return divider;
};
ui.image = function(image){
	return NSImage.alloc().initWithContentsOfFile(cont.plugin.urlForResourceNamed(image).path());
};
ui.button = function(data){
	var button = [[NSButton alloc] initWithFrame:NSMakeRect(data.x || 0, data.y || 0, data.width || 0,data.height || 0)];
	var windowP = data.window;
	[button setTitle:data.title]
	[button setBezelStyle:NSRoundedBezelStyle]
	[button sizeToFit]

	[button setFrame:NSMakeRect(data.x || 0, data.y || 0, data.width || [button frame].size.width, [button frame].size.height)]
	if(data.title=='OK'){
		[button setKeyEquivalent:"\r"] // return key
	}
	  button.setAction("callAction:");
	  button.setCOSJSTargetFunction(function(sender) {
	  	log('### clicked!!!');
	  	data.event();
	  	coscript.setShouldKeepAround(false);
	  });
	return button;
};

var mywin;
var windowP;


ui.alert = function(data){


	var inner;

	if(windowP && windowP.isShown()){
		log('Panel already shown');
		return;
	}

	if(data.type=='popover'){
		windowP = NSPopover.alloc().init();
		inner = [[NSView alloc] initWithFrame:NSMakeRect(0, 0, 340, 420)];
	}else{
		windowP = NSPanel.alloc().init();
	}
	
	mywin = windowP;

	var buttons = [[NSView alloc] initWithFrame:NSMakeRect(0, 0, 340, 100)];
	buttons.setWantsLayer(true);
	var buttonPositions = [235, 150, 20];
	for(var i in data.buttons){
		var button = ui.button({
			title: data.buttons[i].label,
			event: data.buttons[i].event,
			x: buttonPositions[i],
			y: 8,
			width: 90,
			window: windowP,
			inner: inner
		})
		[buttons addSubview:button];
    }

    // Header
    var headerImg = ui.image('logo.png');
	var headerfixer = [[NSView alloc] initWithFrame:NSMakeRect(30, 300, 30, 30)]
	headerfixer.setWantsLayer(true);
	headerfixer.setLayerContentsPlacement(1);
	[headerfixer layer].contents = headerImg;

	// Header text
	var headerText = [[NSView alloc] initWithFrame:NSMakeRect(85, 265, 240, 65)];
	headerText.setWantsLayer(true);

	var title = ui.label({
		label: {
			title: data.message,
			x: 0,
			y: 40,
			size: 15,
			bold: true,
			white: false
		}
	});
	var layerTitle = ui.label({
		label: {
			title: data.info,
			x: 0,
			y: 0,
			size: 11,
			width: 220,
			height: 30,
			bold: false,
			white: false
		}
	});

	[headerText addSubview:title];
	[headerText addSubview:layerTitle];


	// // Code for footer
	var footer = [[NSView alloc] initWithFrame:NSMakeRect(0, 50, 340, 350)]
	footer.setWantsLayer(true);
	var panel = [CALayer layer];
	[panel setFrame:CGRectMake(0, 0, 100, 100)];
	[panel setBackgroundColor:CGColorCreateGenericRGB(256/256, 256/256, 256/256, 1)];
	[footer setLayer:panel]

	var line = [[NSView alloc] initWithFrame:NSMakeRect(0, 50, 340, 2)]
	line.setWantsLayer(true);
	var panel2 = [CALayer layer];
	[panel2 setFrame:CGRectMake(0, 0, 100, 100)];
	[panel2 setBackgroundColor:CGColorCreateGenericRGB(80/256, 227/256, 194/256, 1)];
	[line setLayer:panel2]


	// [[window contentView] addSubview:footer];
	// [[window contentView] addSubview:line positioned:NSWindowAbove relativeTo:footer];
	// [[window contentView] addSubview:buttons positioned:NSWindowAbove relativeTo:footer];
	// [[window contentView] addSubview:headerfixer positioned:NSWindowAbove relativeTo:footer];

	// data.accessory.setWantsLayer(true);
	// [[window contentView] addSubview:headerText positioned:NSWindowAbove relativeTo:footer];
 //    [[window contentView] addSubview:data.accessory positioned:NSWindowAbove relativeTo:footer]



    // Panel
			if(data.type != 'popover'){
				windowP.setStyleMask(NSTitledWindowMask + NSFullSizeContentViewWindowMask); //NSTitledWindowMask + 
				windowP.setBackgroundColor(NSColor.colorWithRed_green_blue_alpha(230/255, 230/255, 230/255, 1));
				windowP.setTitleVisibility(NSWindowTitleHidden);
				windowP.setTitlebarAppearsTransparent(true);
				windowP.setFrame_display(NSMakeRect(0, 0, 380, 400), false);
				windowP.setMovableByWindowBackground(true);
				windowP.setHasShadow(true);
				windowP.setLevel(NSFloatingWindowLevel);
				windowP.becomesKeyOnlyIfNeeded = false;
				windowP.floatingPanel = true;
				windowP.setAnimationBehavior(5);

				windowP.center();
				[windowP setWorksWhenModal:true];
				windowP.makeKeyAndOrderFront(nil);

				var contentView = windowP.contentView();
				data.accessory.setWantsLayer(true);
				contentView.addSubview(footer);
				contentView.addSubview(data.accessory);
				contentView.addSubview(headerfixer);
				contentView.addSubview(headerText);
				contentView.addSubview(buttons);
				contentView.addSubview(line);
			}else{

				// Popup
			    
				var viewController = [[NSViewController alloc] initWithNibName:nil bundle:nil];

			    viewController.view = inner;

			    coscript.setShouldKeepAround(false);
			    
				inner.addSubview(data.accessory);
				inner.addSubview(headerfixer);
				inner.addSubview(headerText);
				inner.addSubview(buttons);
				inner.addSubview(line);

				[windowP becomeFirstResponder];
			    [windowP setContentSize:NSMakeSize(340, 360)];
		        [windowP setAnimates:true];
		        [windowP setContentViewController:viewController];

		        [windowP setBehavior:NSPopoverBehaviorTransient];
		        

		        var layer = data.layer;
			    var rL = [layer absoluteRect];
			    var v = [view frame];
			    var so = [doc scrollOrigin];
			    var zv = [doc zoomValue];

			    var o = rL.origin();
			    var s = rL.size();

			    var x = (o.x*zv)+so.x;
			    var y = (o.y*zv)+so.y;
			    var w = s.width*zv;
			    var h = s.height*zv;


			    var bounds = NSMakeRect(x, y, w, h); 


	    		[windowP showRelativeToRect:bounds ofView:view preferredEdge:NSMaxXEdge];

	    		coscript.setShouldKeepAround(true);

	    		coscript.scheduleWithRepeatingInterval_jsFunction(1,function() {
	    			vis = windowP.isShown();
	    			if(!vis){
						[NSApp endSheet:windowP];
						log('endedsss');
	    				coscript.setShouldKeepAround(false);
	    			}
				});

			}



	return windowP;
};