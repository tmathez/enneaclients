/**
 * Unobtrusive scripting adapter for jQuery
 *
 * Requires jQuery 1.4.4 or later.
 * https://github.com/rails/jquery-ujs

 * Uploading file using rails.js
 * =============================
 *
 * By default, browsers do not allow files to be uploaded via AJAX. As a result, if there are any non-blank file fields
 * in the remote form, this adapter aborts the AJAX submission and allows the form to submit through standard means.
 *
 * The `ajax:aborted:file` event allows you to bind your own handler to process the form submission however you wish.
 *
 * Ex:
 *     $('form').live('ajax:aborted:file', function(event, elements){
 *       // Implement own remote file-transfer handler here for non-blank file inputs passed in `elements`.
 *       // Returning false in this handler tells rails.js to disallow standard form submission
 *       return false;
 *     });
 *
 * The `ajax:aborted:file` event is fired when a file-type input is detected with a non-blank value.
 *
 * Third-party tools can use this hook to detect when an AJAX file upload is attempted, and then use
 * techniques like the iframe method to upload the file instead.
 *
 * Required fields in rails.js
 * ===========================
 *
 * If any blank required inputs (required="required") are detected in the remote form, the whole form submission
 * is canceled. Note that this is unlike file inputs, which still allow standard (non-AJAX) form submission.
 *
 * The `ajax:aborted:required` event allows you to bind your own handler to inform the user of blank required inputs.
 *
 * !! Note that Opera does not fire the form's submit event if there are blank required inputs, so this event may never
 *    get fired in Opera. This event is what causes other browsers to exhibit the same submit-aborting behavior.
 *
 * Ex:
 *     $('form').live('ajax:aborted:required', function(event, elements){
 *       // Returning false in this handler tells rails.js to submit the form anyway.
 *       // The blank required inputs are passed to this function in `elements`.
 *       return ! confirm("Would you like to submit the form with missing info?");
 *     });
 */

(function($, undefined) {
  // Shorthand to make it a little easier to call public rails functions from within rails.js
  var rails;

  $.rails = rails = {
    // Link elements bound by jquery-ujs
    linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote]',

		// Select elements bound by jquery-ujs
		selectChangeSelector: 'select[data-remote]',

    // Form elements bound by jquery-ujs
    formSubmitSelector: 'form',

    // Form input elements bound by jquery-ujs
    formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type])',

    // Form input elements disabled during form submission
    disableSelector: 'input[data-disable-with], button[data-disable-with], textarea[data-disable-with]',

    // Form input elements re-enabled after form submission
    enableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled',

    // Form required input elements
    requiredInputSelector: 'input[name][required]:not([disabled]),textarea[name][required]:not([disabled])',

    // Form file input elements
    fileInputSelector: 'input:file',

    // Make sure that every Ajax request sends the CSRF token
    CSRFProtection: function(xhr) {
      var token = $('meta[name="csrf-token"]').attr('content');
      if (token) xhr.setRequestHeader('X-CSRF-Token', token);
    },

    // Triggers an event on an element and returns false if the event result is false
    fire: function(obj, name, data) {
      var event = $.Event(name);
      obj.trigger(event, data);
      return event.result !== false;
    },

    // Default confirm dialog, may be overridden with custom confirm dialog in $.rails.confirm
    confirm: function(message) {
      return confirm(message);
    },

    // Default ajax function, may be overridden with custom function in $.rails.ajax
    ajax: function(options) {
      return $.ajax(options);
    },

    // Submits "remote" forms and links with ajax
    handleRemote: function(element) {
      var method, url, data,
        crossDomain = element.data('cross-domain') || null,
        dataType = element.data('type') || ($.ajaxSettings && $.ajaxSettings.dataType);

      if (rails.fire(element, 'ajax:before')) {

        if (element.is('form')) {
          method = element.attr('method');
          url = element.attr('action');
          data = element.serializeArray();
          // memoized value from clicked submit button
          var button = element.data('ujs:submit-button');
          if (button) {
            data.push(button);
            element.data('ujs:submit-button', null);
          }
        } else if (element.is('select')) {
          method = element.data('method');
          url = element.data('url');
					data = element.serialize();
					if (element.data('params')) data = data + "&" + element.data('params'); 
        } else {
           method = element.data('method');
           url = element.attr('href');
           data = element.data('params') || null; 
        }

        options = {
          type: method || 'GET', data: data, dataType: dataType, crossDomain: crossDomain,
          // stopping the "ajax:beforeSend" event will cancel the ajax request
          beforeSend: function(xhr, settings) {
            if (settings.dataType === undefined) {
              xhr.setRequestHeader('accept', '*/*;q=0.5, ' + settings.accepts.script);
            }
            return rails.fire(element, 'ajax:beforeSend', [xhr, settings]);
          },
          success: function(data, status, xhr) {
            element.trigger('ajax:success', [data, status, xhr]);
          },
          complete: function(xhr, status) {
            element.trigger('ajax:complete', [xhr, status]);
          },
          error: function(xhr, status, error) {
            element.trigger('ajax:error', [xhr, status, error]);
          }
        };
        // Do not pass url to `ajax` options if blank
        if (url) { $.extend(options, { url: url }); }

        rails.ajax(options);
      }
    },

    // Handles "data-method" on links such as:
    // <a href="/users/5" data-method="delete" rel="nofollow" data-confirm="Are you sure?">Delete</a>
    handleMethod: function(link) {
      var href = link.attr('href'),
        method = link.data('method'),
        csrf_token = $('meta[name=csrf-token]').attr('content'),
        csrf_param = $('meta[name=csrf-param]').attr('content'),
        form = $('<form method="post" action="' + href + '"></form>'),
        metadata_input = '<input name="_method" value="' + method + '" type="hidden" />';

      if (csrf_param !== undefined && csrf_token !== undefined) {
        metadata_input += '<input name="' + csrf_param + '" value="' + csrf_token + '" type="hidden" />';
      }

      form.hide().append(metadata_input).appendTo('body');
      form.submit();
    },

    /* Disables form elements:
      - Caches element value in 'ujs:enable-with' data store
      - Replaces element text with value of 'data-disable-with' attribute
      - Adds disabled=disabled attribute
    */
    disableFormElements: function(form) {
      form.find(rails.disableSelector).each(function() {
        var element = $(this), method = element.is('button') ? 'html' : 'val';
        element.data('ujs:enable-with', element[method]());
        element[method](element.data('disable-with'));
        element.attr('disabled', 'disabled');
      });
    },

    /* Re-enables disabled form elements:
      - Replaces element text with cached value from 'ujs:enable-with' data store (created in `disableFormElements`)
      - Removes disabled attribute
    */
    enableFormElements: function(form) {
      form.find(rails.enableSelector).each(function() {
        var element = $(this), method = element.is('button') ? 'html' : 'val';
        if (element.data('ujs:enable-with')) element[method](element.data('ujs:enable-with'));
        element.removeAttr('disabled');
      });
    },

   /* For 'data-confirm' attribute:
      - Fires `confirm` event
      - Shows the confirmation dialog
      - Fires the `confirm:complete` event

      Returns `true` if no function stops the chain and user chose yes; `false` otherwise.
      Attaching a handler to the element's `confirm` event that returns a `falsy` value cancels the confirmation dialog.
      Attaching a handler to the element's `confirm:complete` event that returns a `falsy` value makes this function
      return false. The `confirm:complete` event is fired whether or not the user answered true or false to the dialog.
   */
    allowAction: function(element) {
      var message = element.data('confirm'),
          answer = false, callback;
      if (!message) { return true; }

      if (rails.fire(element, 'confirm')) {
        answer = rails.confirm(message);
        callback = rails.fire(element, 'confirm:complete', [answer]);
      }
      return answer && callback;
    },

    // Helper function which checks for blank inputs in a form that match the specified CSS selector
    blankInputs: function(form, specifiedSelector, nonBlank) {
      var inputs = $(), input,
        selector = specifiedSelector || 'input,textarea';
      form.find(selector).each(function() {
        input = $(this);
        // Collect non-blank inputs if nonBlank option is true, otherwise, collect blank inputs
        if (nonBlank ? input.val() : !input.val()) {
          inputs = inputs.add(input);
        }
      });
      return inputs.length ? inputs : false;
    },

    // Helper function which checks for non-blank inputs in a form that match the specified CSS selector
    nonBlankInputs: function(form, specifiedSelector) {
      return rails.blankInputs(form, specifiedSelector, true); // true specifies nonBlank
    },

    // Helper function, needed to provide consistent behavior in IE
    stopEverything: function(e) {
      $(e.target).trigger('ujs:everythingStopped');
      e.stopImmediatePropagation();
      return false;
    },

    // find all the submit events directly bound to the form and
    // manually invoke them. If anyone returns false then stop the loop
    callFormSubmitBindings: function(form) {
      var events = form.data('events'), continuePropagation = true;
      if (events !== undefined && events['submit'] !== undefined) {
        $.each(events['submit'], function(i, obj){
          if (typeof obj.handler === 'function') return continuePropagation = obj.handler(obj.data);
        });
      }
      return continuePropagation;
    }
  };

  // ajaxPrefilter is a jQuery 1.5 feature
  if ('ajaxPrefilter' in $) {
    $.ajaxPrefilter(function(options, originalOptions, xhr){ if ( !options.crossDomain ) { rails.CSRFProtection(xhr); }});
  } else {
    $(document).ajaxSend(function(e, xhr, options){ if ( !options.crossDomain ) { rails.CSRFProtection(xhr); }});
  }

  $(rails.linkClickSelector).live('click.rails', function(e) {
    var link = $(this);
    if (!rails.allowAction(link)) return rails.stopEverything(e);

    if (link.data('remote') !== undefined) {
      rails.handleRemote(link);
      return false;
    } else if (link.data('method')) {
      rails.handleMethod(link);
      return false;
    }
  });

	$(rails.selectChangeSelector).live('change.rails', function(e) {
    var link = $(this);
    if (!rails.allowAction(link)) return rails.stopEverything(e);

    rails.handleRemote(link);
    return false;
  });	

  $(rails.formSubmitSelector).live('submit.rails', function(e) {
    var form = $(this),
      remote = form.data('remote') !== undefined,
      blankRequiredInputs = rails.blankInputs(form, rails.requiredInputSelector),
      nonBlankFileInputs = rails.nonBlankInputs(form, rails.fileInputSelector);

    if (!rails.allowAction(form)) return rails.stopEverything(e);

    // skip other logic when required values are missing or file upload is present
    if (blankRequiredInputs && rails.fire(form, 'ajax:aborted:required', [blankRequiredInputs])) {
      return rails.stopEverything(e);
    }

    if (remote) {
      if (nonBlankFileInputs) {
        return rails.fire(form, 'ajax:aborted:file', [nonBlankFileInputs]);
      }

      // If browser does not support submit bubbling, then this live-binding will be called before direct
      // bindings. Therefore, we should directly call any direct bindings before remotely submitting form.
      if (!$.support.submitBubbles && rails.callFormSubmitBindings(form) === false) return rails.stopEverything(e);

      rails.handleRemote(form);
      return false;
    } else {
      // slight timeout so that the submit button gets properly serialized
      setTimeout(function(){ rails.disableFormElements(form); }, 13);
    }
  });

  $(rails.formInputClickSelector).live('click.rails', function(event) {
    var button = $(this);

    if (!rails.allowAction(button)) return rails.stopEverything(event);

    // register the pressed submit button
    var name = button.attr('name'),
      data = name ? {name:name, value:button.val()} : null;

    button.closest('form').data('ujs:submit-button', data);
  });

  $(rails.formSubmitSelector).live('ajax:beforeSend.rails', function(event) {
    if (this == event.target) rails.disableFormElements($(this));
  });

  $(rails.formSubmitSelector).live('ajax:complete.rails', function(event) {
    if (this == event.target) rails.enableFormElements($(this));
  });

})( jQuery );


jQuery(function($) {
	initialize_observers();
		
	$(window).focus(function(){
		if ($("#pending_evenements").length > 0) {
			var url = document.location.href;
			var controller = url.split("/")[3];
			var action = url.split("/").length > 4 ? [4].split("?")[0] : "";
			if (controller != "clients" && action != "search") {
				$("#pending_evenements").addClass('loading_pending');
				$("#print_events").attr('src','/images/loader.gif');
				$.get("/evenements/refresh", null, function() { $("#pending_evenements").removeClass('loading_pending');$("#print_events").attr('src','/images/print.png'); }, 'script');
			}
		}
	});
});

function initialize_observers() {
	// Je mets la recherche des clients / événements à vide par défaut pour éviter que lors d'un 'précédent' celui-ci me garde la valeur
	$("#clients_search input").val("");
	$("#evenements_search input").val("");

	$("#liste_clients").tablesorter({
		textExtraction:function(s){
    		if($(s).find('img').length == 0) return $(s).text();
    		return $(s).find('img').attr('alt');
    	}	
	});

	
	$('input').each(function(){
		if ($(this).attr('data-observe') != null) {
			$(this).unbind('change').change(function(){
				$.get($(this).attr('data-observe')+'?'+$(this).attr('data-parameter')+'='+$(this).val(), null, null, 'script');
			});
		}
	});
	$('#evenement_resolu').unbind('change').change(function() {
		if ($(this).attr('checked')==true) {
			$(this).parent().removeClass('unsolved').addClass('solved');
		} else {
			$(this).parent().removeClass('solved').addClass('unsolved');
		}
	});
	$('#evenement_facturation').unbind('change').change(function() {
		if ($(this).attr('checked')==true) {
			$('#a_facturer').removeClass('pas_a_facturer').addClass('a_facturer');
		} else {
			$('#a_facturer').removeClass('a_facturer').addClass('pas_a_facturer');
		}
	});
	$('.check_box_solve_evenement').each(function(){
		$(this).unbind('click').click(function(){
			var prefix = $(this).attr('data-from-client')=='true' ? '../' : '';
			if ($(this).attr('checked') == false) {
				if(confirm("Êtes-vous sûr de vouloir annuler la résolution de cet événement ? Ceci supprimera la solution saisie dans celui-ci.")) {
					$.get(prefix+'evenements/'+$(this).val()+'/edit?resolu='+$(this).attr('checked')+'&from_client='+$(this).attr('data-from-client'), null, null, 'script');
				} else {
					$(this).attr('checked',true);
				}
			} else {
				$.get(prefix+'evenements/'+$(this).val()+'/edit?resolu='+$(this).attr('checked')+'&from_client='+$(this).attr('data-from-client'), null, null, 'script');
			}
			
		});
	});
	$('.check_box_facture_evenement').each(function(){
		$(this).unbind('click').click(function(){
			if ($(this).attr('checked') == false) {
				if(confirm("Êtes-vous sûr de vouloir annuler la facturation de cet événement ? Ceci supprimera les informations de facturations saisies.")) {
					$.get('?id='+$(this).val()+'&facturation=1', null, null, 'script');
				} else {
					$(this).attr('checked',true);
				}
			} else {
				$.get('?id='+$(this).val()+'&facturation=2', null, null, 'script');
			}
			
		});
	});
	
	$('textarea').each(function(){
		if ($(this).attr('data-validate') != '') {			
			$(this).unbind('change').change(function(){
				var submit = $('#'+$(this).attr('data-validate'));
				if ($(this).val() != "") {  submit.removeAttr('disabled'); } else { submit.attr('disabled','disabled'); }
			});
		}
	})
	$('#responsable_filter').unbind('change').change(function(){
		window.location.href = 'evenements?selected='+$(this).val();
	});
	$('#is_client_sorba, #is_client_enneasoft').unbind('click').click(function(){
		if ($(this).attr('checked')==true) {
			$(this).parent().parent().parent().removeClass('pas_client');
		} else {
			$(this).parent().parent().parent().addClass('pas_client');
			$(this).parent().parent().parent().find('input[type=text]').each(function() { $(this).val('') });
			$(this).parent().parent().parent().find('input[type=checkbox]').each(function() { $(this).attr('checked', false) });
			$(this).parent().parent().parent().find('select').each(function() { $('#'+$(this).attr('id')+' option[value=false]').attr('selected', "selected") });
		}
	});
	
	$(".date_field").each(function() {
		$(this).keydown(function(e){
			var k = e.keyCode;

			if (k > 57 && k < 96 || k > 105) {
				if (k != 110 && k != 190) {
					e.preventDefault();
				}
			}
		});
		$(this).change(function(){
			checkDate(jQuery(this),true);
		});
	});
	$(".time_field").each(function() {
		$(this).keydown(function(e){
			var k = e.keyCode;

			if (k > 57 && k < 96 || k > 105) {
				if (k != 110 && k != 190) {
					e.preventDefault();
				}
			}
		});
		$(this).change(function(){
			checkDate($(this),false);
		});
	});
	
	$("#refresh_email_preview").each(function(){
		$(this).unbind('click').click(function(){
			$.get('email', { preview: $('#content').val() }, null, 'script');
		});
	});
	
	$(".sortable").live('click', function(){
		$.getScript(this.href);
		return false;
	});

    $("#search_client").keyup(function() {
    	$("#liste_clients > tbody > tr").each(function(){
    		var value = $('td', this).eq(2).children("a").attr('title');
    		var search = $("#search_client").val();
    		if (JSLike(search, value)) {
    			$(this).css('display','table-row');
    		} else {
    			$(this).css('display','none');
    		}
    	});
    });
    
    // Gestion des champs numériques
	$('.numeric_field').keydown(function(e) {
		var key = e.charCode || e.keyCode || 0;
        // allow backspace, tab, delete, arrows, numbers and keypad numbers ONLY
        return (
       	 	key == 8 || 
	        key == 9 ||
	        key == 46 ||
	        (key >= 37 && key <= 40) ||
	        (key >= 48 && key <= 57) ||
	        (key >= 96 && key <= 105) ||
			((key == 110 || key == 190) && $(this).val().indexOf(".") == -1)
		);
	});
	$('.numeric_field').blur(function(event) {
		if ($(this).val() != "") {
			var number = parseFloat($(this).val());
			$(this).val(number.toFixed(2));
		} else {
			$(this).val("");
		}
	}); 
	
	$('#print_clients').click(function(){
		var search = $('#search_client').val();
		var sort = "";
		var order = ""
		
		$('#liste_clients > thead > tr').eq(1).children('th').each(function(){
			if ($(this).attr('id') != null) {
				if ($(this).hasClass('headerSortDown')) {
					order = " ASC";
					sort = $(this).attr('id');
				} else if ($(this).hasClass('headerSortUp')) {
					order = " DESC";
					sort = $(this).attr('id');
				}
			} 
		});
		
		location.href="/clients/print?sort="+sort+order+"&search="+search;
	});
	
	$("#evenement_client_id").unbind('change').change(function(){
		$("#telephone").val($("#evenement_client_id").val());
		$("#remarques").val($("#evenement_client_id").val());
		$("#evenement_tel").val($("#telephone option:selected").text());
		
		var remarques = $("#remarques option:selected").text();
		$("#client_remarques").html(light_rc(remarques).replace("\n","<br/>"));
		
		if (remarques == "") {
			if (!$("#client_remarques").hasClass("hidden")) { $("#client_remarques").addClass("hidden") }
		} else {
			if ($("#client_remarques").hasClass("hidden")) { $("#client_remarques").removeClass("hidden") }
		}
	});
	
	$(".redcloth_me").each(function(){
		$(this).html(light_rc($(this).html()));
	});
	
	$("#client_enneascanning_ts").unbind('change').change(function(){
		if ($(this).attr('checked') == true) {
			$(this).next().next().removeClass('hidden');
		} else {
			$(this).next().next().addClass('hidden');
		}
	});
}

// Contrôle de la validité d'une date
function checkDate(element,is_date) {
	var value = element.val();
	var today = new Date();
	var day = today.getDate().toString();
	var month = (today.getMonth()+1).toString();
	var year = today.getFullYear().toString();
	var data_date = element.attr('data-date');

	if (is_date) {		
		var splitted = value.split(".");
		
		if (splitted.length != 3) {
			if (splitted.length > 3) {
				element.val(data_date);
			} else {
				if (splitted.length == 2){
					day = splitted[0];
					month = splitted[1];
					if (day.length == 1) { day = "0"+day }
					if (month.length == 1) { month = "0"+month }
					
					if (isValidDate(day,month,year)) {
						element.val(day+"."+month+"."+year);
					} else {
						element.val(data_date);
					}
				} else if (splitted.length == 1) {
					day = splitted[0];
					if (day.length == 1) { day = "0"+day }
					if (month.length == 1) { month = "0"+month; }
						
					if (isValidDate(day,month,year)) {
						element.val(day+"."+month+"."+year);
					} else {
						element.val(data_date);
					}
				} else {
					element.val(data_date);
				}
			}
		} else {
			day = splitted[0];
			month = splitted[1];
			year = splitted[2];
			if (day.length == 1) { day = "0"+day }
			if (month.length == 1) { month = "0"+month }
			if (year.length == 1) { 
				year = "200"+year;
			} else if(year.length == 2) { 
				year = "20"+year;
			} else if(year.length == 3) {
				year = "2"+year;
		 	}
			if (isValidDate(day,month,year)) {
				element.val(day+"."+month+"."+year);
			} else {
				element.val(data_date);
			}
		}
	} else {
		var splitted = value.replace(".",":").split(":");
		if (splitted.length != 2) {
			if (splitted.length > 2) {
				element.val(data_date);
			} else {
				if (splitted.length == 1) {
					var heure = splitted[0];
					if (heure != "") {
						heure = parseInt(heure, 10);
						if (heure > -1 && heure < 24) {
							heure = heure.toString();
							if (heure.length == 1) { heure = "0"+heure }
							element.val(heure + ":00")
						} else {
							element.val(data_date);
						}
					} else {
						element.val(data_date);
					}
				}
			}
		} else {
			var heure = splitted[0];
			var minute = splitted[1];
			if (heure != "") {
				heure = parseInt(heure, 10);
				minute = parseInt(minute, 10);
				if (heure > -1 && heure < 24 && minute > -1 && minute < 60) {
					heure = heure.toString();
					minute = minute.toString();
					if (heure.length == 1) { heure = "0"+heure }
					if (minute.length == 1) { minute = "0"+minute }
					element.val(heure + ":" + minute)
				} else {
					element.val(data_date);
				}
			} else {
				element.val(data_date);
			}
		}
	}
}

// Validation des dates
function isValidDate(day,month,year){
	var dteDate;
	dteDate=new Date(year,month - 1,day);
	return ((day==dteDate.getDate()) && (month-1==dteDate.getMonth()) && (year==dteDate.getFullYear()));
}

// Replace les count d'événements
function replaceCounts(element1, element2) {
	var count = element1.html().replace(/&nbsp;/g,"");
	// Count à facturer
	var count_afact = (parseInt(count)+1);
	element1.html("&nbsp;&nbsp;"+count_afact.toString()+"&nbsp;&nbsp;");
	// Count facturé
	count = element2.html().replace(/&nbsp;/g,"");
	var count_fact = (parseInt(count)-1);
	element2.html("&nbsp;&nbsp;"+count_fact.toString()+"&nbsp;&nbsp;");
}

// Recherche %Like% SQL
function JSLike(search,str) {
	if (str != null) { 
		if (str.toUpperCase().indexOf(search.toUpperCase()) > -1) { return true; } else { return false; }
	} else { 
		return false;
	}
}

// Light RedCloth

function light_rc(str) {
    var tempStr = str;
    while(tempStr.indexOf("*") !== -1) {
        var firstPos = tempStr.indexOf("*");
        var nextPos = tempStr.indexOf("*",firstPos + 1);
        if(nextPos !== -1) {
            var innerTxt = tempStr.substring(firstPos + 1,nextPos);
            var strongified = '<strong>' + innerTxt + '</strong>';
            tempStr = tempStr.substring(0,firstPos) + strongified + tempStr.substring(nextPos + 1,tempStr.length);
        //get rid of unclosed '**'
        } else {
            tempStr = tempStr.replace('*','');
        }
    }
     while(tempStr.indexOf("_") !== -1) {
        var firstPos = tempStr.indexOf("_");
        var nextPos = tempStr.indexOf("_",firstPos + 1);
        if(nextPos !== -1) {
            var innerTxt = tempStr.substring(firstPos + 1,nextPos);
            var italicized = '<i>' + innerTxt + '</i>';
            tempStr = tempStr.substring(0,firstPos) + italicized + tempStr.substring(nextPos + 2,tempStr.length);
        //get rid of unclosed '*'
        } else {
            tempStr = tempStr.replace('_','');
        }
    }
    return tempStr;
}



(function(c){c.Autocompleter=function(a,d){this.cacheData_={};this.cacheLength_=0;this.selectClass_="jquery-autocomplete-selected-item";this.lastSelectedValue_=this.lastProcessedValue_=this.lastKeyPressed_=this.keyTimeout_=null;this.active_=!1;this.finishOnBlur_=!0;if(!a||!(a instanceof jQuery)||a.length!==1||a.get(0).tagName.toUpperCase()!=="INPUT")alert("Invalid parameter for jquery.Autocompleter, jQuery object with one element with INPUT tag expected");else{a.attr("autocomplete","off");this.options=
typeof d==="string"?{url:d}:d;this.options.minChars=parseInt(this.options.minChars,10);if(isNaN(this.options.minChars)||this.options.minChars<1)this.options.minChars=2;this.options.maxItemsToShow=parseInt(this.options.maxItemsToShow,10);if(isNaN(this.options.maxItemsToShow)||this.options.maxItemsToShow<1)this.options.maxItemsToShow=10;this.options.maxCacheLength=parseInt(this.options.maxCacheLength,10);if(isNaN(this.options.maxCacheLength)||this.options.maxCacheLength<1)this.options.maxCacheLength=
10;this.dom={};this.dom.$elem=a;this.options.inputClass&&this.dom.$elem.addClass(this.options.inputClass);this.dom.$results=c("<div></div>").hide();this.options.resultsClass&&this.dom.$results.addClass(this.options.resultsClass);this.dom.$results.css({position:"absolute"});c("body").append(this.dom.$results);var b=this;a.keydown(function(a){b.lastKeyPressed_=a.keyCode;switch(b.lastKeyPressed_){case 38:return a.preventDefault(),b.active_?b.focusPrev():b.activate(),!1;case 40:return a.preventDefault(),
b.active_?b.focusNext():b.activate(),!1;case 9:if(b.active_&&(b.selectCurrent(),b.options.preventDefaultTab))return a.preventDefault(),!1;break;case 13:if(b.active_&&(b.selectCurrent(),b.options.preventDefaultReturn))return a.preventDefault(),!1;break;case 27:if(b.active_)return a.preventDefault(),b.finish(),!1;break;default:b.activate()}});a.blur(function(){b.finishOnBlur_&&setTimeout(function(){b.finish()},200)})}};c.Autocompleter.prototype.position=function(){var a=this.dom.$elem.offset();this.dom.$results.css({top:a.top+
this.dom.$elem.outerHeight(),left:a.left})};c.Autocompleter.prototype.cacheRead=function(a){var d,b,c,f,h;if(this.options.useCache){a=String(a);d=a.length;for(b=this.options.matchSubset?1:d;b<=d;){f=this.options.matchInside?d-b:0;for(h=0;h<=f;){c=a.substr(0,b);if(this.cacheData_[c]!==void 0)return this.cacheData_[c];h++}b++}}return!1};c.Autocompleter.prototype.cacheWrite=function(a,d){if(this.options.useCache)return this.cacheLength_>=this.options.maxCacheLength&&this.cacheFlush(),a=String(a),this.cacheData_[a]!==
void 0&&this.cacheLength_++,this.cacheData_[a]=d,this.cacheData_[a];return!1};c.Autocompleter.prototype.cacheFlush=function(){this.cacheData_={};this.cacheLength_=0};c.Autocompleter.prototype.callHook=function(a,d){var b=this.options[a];if(b&&c.isFunction(b))return b(d,this);return!1};c.Autocompleter.prototype.activate=function(){var a=this,d=parseInt(this.options.delay,10);if(isNaN(d)||d<=0)d=250;this.keyTimeout_&&clearTimeout(this.keyTimeout_);this.keyTimeout_=setTimeout(function(){a.activateNow()},
d)};c.Autocompleter.prototype.activateNow=function(){var a=this.dom.$elem.val();if(a!==this.lastProcessedValue_&&a!==this.lastSelectedValue_&&a.length>=this.options.minChars)this.lastProcessedValue_=a,this.fetchData(a)};c.Autocompleter.prototype.fetchData=function(a){if(this.options.data)this.filterAndShowResults(this.options.data,a);else{var d=this;this.fetchRemoteData(a,function(b){d.filterAndShowResults(b,a)})}};c.Autocompleter.prototype.fetchRemoteData=function(a,d){var b=this.cacheRead(a);if(b)d(b);
else{var e=this;this.dom.$elem.addClass(this.options.loadingClass);var f=function(b){var c=!1;b!==!1&&(c=e.parseRemoteData(b),e.cacheWrite(a,c));e.dom.$elem.removeClass(e.options.loadingClass);d(c)};c.ajax({url:this.makeUrl(a),success:f,error:function(){f(!1)}})}};c.Autocompleter.prototype.setExtraParam=function(a,d){var b=c.trim(String(a));if(b){if(!this.options.extraParams)this.options.extraParams={};this.options.extraParams[b]!==d&&(this.options.extraParams[b]=d,this.cacheFlush())}};c.Autocompleter.prototype.makeUrl=
function(a){var d=this,b=this.options.url,e=c.extend({},this.options.extraParams);this.options.queryParamName===!1?b+=encodeURIComponent(a):e[this.options.queryParamName]=a;if(this.options.limitParamName&&this.options.maxItemsToShow)e[this.options.limitParamName]=this.options.maxItemsToShow;var f=[];c.each(e,function(a,b){f.push(d.makeUrlParam(a,b))});f.length&&(b+=b.indexOf("?")===-1?"?":"&",b+=f.join("&"));return b};c.Autocompleter.prototype.makeUrlParam=function(a,d){return[a,encodeURIComponent(d)].join("=")};
c.Autocompleter.prototype.parseRemoteData=function(a){for(var d=[],b,c,f,h=String(a).replace("\r\n",this.options.lineSeparator).split(this.options.lineSeparator),a=0;a<h.length;a++){f=h[a].split(this.options.cellSeparator);c=[];for(b=0;b<f.length;b++)c.push(unescape(f[b]));b=c.shift();d.push({value:unescape(b),data:c})}return d};c.Autocompleter.prototype.filterAndShowResults=function(a,d){this.showResults(this.filterResults(a,d),d)};c.Autocompleter.prototype.filterResults=function(a,d){var b=[],e,
f,h,g,i;for(h=0;h<a.length;h++){g=a[h];i=typeof g;if(i==="string")e=g,f={};else if(c.isArray(g))e=g[0],f=g.slice(1);else if(i==="object")e=g.value,f=g.data;e=String(e);e>""&&(typeof f!=="object"&&(f={}),this.options.filterResults?(g=this.matchStringConvertor(d),i=this.matchStringConvertor(e),this.options.matchCase||(g=g.toLowerCase(),i=i.toLowerCase()),g=i.indexOf(g),g=this.options.matchInside?g>-1:g===0):g=!0,g&&b.push({value:e,data:f}))}this.options.sortResults&&(b=this.sortResults(b,d));if(this.options.maxItemsToShow>
0&&this.options.maxItemsToShow<b.length)b.length=this.options.maxItemsToShow;return b};c.Autocompleter.prototype.sortResults=function(a,d){var b=this,e=this.options.sortFunction;c.isFunction(e)||(e=function(a,d,c){return b.sortValueAlpha(a,d,c)});a.sort(function(a,b){return e(a,b,d)});return a};c.Autocompleter.prototype.sortValueAlpha=function(a,d){a=String(a.value);d=String(d.value);this.options.matchCase||(a=a.toLowerCase(),d=d.toLowerCase());if(a>d)return 1;if(a<d)return-1;return 0};c.Autocompleter.prototype.matchStringConvertor=
function(a,d,b){var e=this.options.matchStringConvertor;c.isFunction(e)&&(a=e(a,d,b));return a};c.Autocompleter.prototype.showResults=function(a,d){var b=a.length;if(b===0)return this.finish();var e=this,f=c("<ul></ul>"),h,g,i,j=!1,k=!1;for(h=0;h<b;h++)g=a[h],i=c("<li>"+this.showResult(g.value,g.data)+"</li>"),i.data("value",g.value),i.data("data",g.data),i.click(function(){var a=c(this);e.selectItem(a)}).mousedown(function(){e.finishOnBlur_=!1}).mouseup(function(){e.finishOnBlur_=!0}),f.append(i),
j===!1&&(j=String(g.value),k=i,i.addClass(this.options.firstItemClass)),h===b-1&&i.addClass(this.options.lastItemClass);this.position();this.dom.$results.html(f).show();f=this.dom.$results.outerWidth()-this.dom.$results.width();this.dom.$results.width(this.dom.$elem.outerWidth()-f);c("li",this.dom.$results).hover(function(){e.focusItem(this)},function(){});(this.autoFill(j,d)||this.options.selectFirst||this.options.selectOnly&&b==1)&&this.focusItem(k);this.active_=!0};c.Autocompleter.prototype.showResult=
function(a,d){return c.isFunction(this.options.showResult)?this.options.showResult(a,d):a};c.Autocompleter.prototype.autoFill=function(a,d){var b,c,f,h;if(this.options.autoFill&&this.lastKeyPressed_!==8&&(b=String(a).toLowerCase(),c=String(d).toLowerCase(),f=a.length,h=d.length,b.substr(0,h)===c))return this.dom.$elem.val(a),this.selectRange(h,f),!0;return!1};c.Autocompleter.prototype.focusNext=function(){this.focusMove(1)};c.Autocompleter.prototype.focusPrev=function(){this.focusMove(-1)};c.Autocompleter.prototype.focusMove=
function(a){for(var d=c("li",this.dom.$results),a=parseInt(a,10),b=0;b<d.length;b++)if(c(d[b]).hasClass(this.selectClass_)){this.focusItem(b+a);return}this.focusItem(0)};c.Autocompleter.prototype.focusItem=function(a){var d=c("li",this.dom.$results);d.length&&(d.removeClass(this.selectClass_).removeClass(this.options.selectClass),typeof a==="number"?(a=parseInt(a,10),a<0?a=0:a>=d.length&&(a=d.length-1),a=c(d[a])):a=c(a),a&&a.addClass(this.selectClass_).addClass(this.options.selectClass))};c.Autocompleter.prototype.selectCurrent=
function(){var a=c("li."+this.selectClass_,this.dom.$results);a.length===1?this.selectItem(a):this.finish()};c.Autocompleter.prototype.selectItem=function(a){var c=a.data("value"),a=a.data("data"),b=this.displayValue(c,a);this.lastSelectedValue_=this.lastProcessedValue_=b;this.dom.$elem.val(b).focus();this.setCaret(b.length);this.callHook("onItemSelect",{value:c,data:a});this.finish()};c.Autocompleter.prototype.displayValue=function(a,d){return c.isFunction(this.options.displayValue)?this.options.displayValue(a,
d):a};c.Autocompleter.prototype.finish=function(){this.keyTimeout_&&clearTimeout(this.keyTimeout_);this.dom.$elem.val()!==this.lastSelectedValue_&&(this.options.mustMatch&&this.dom.$elem.val(""),this.callHook("onNoMatch"));this.dom.$results.hide();this.lastProcessedValue_=this.lastKeyPressed_=null;this.active_&&this.callHook("onFinish");this.active_=!1};c.Autocompleter.prototype.selectRange=function(a,c){var b=this.dom.$elem.get(0);b.setSelectionRange?(b.focus(),b.setSelectionRange(a,c)):this.createTextRange&&
(b=this.createTextRange(),b.collapse(!0),b.moveEnd("character",c),b.moveStart("character",a),b.select())};c.Autocompleter.prototype.setCaret=function(a){this.selectRange(a,a)};c.fn.autocomplete=function(a){typeof a==="string"&&(a={url:a});var d=c.extend({},c.fn.autocomplete.defaults,a);return this.each(function(){var a=c(this),e=new c.Autocompleter(a,d);a.data("autocompleter",e)})};c.fn.autocomplete.defaults={inputClass:"acInput",loadingClass:"acLoading",resultsClass:"acResults",selectClass:"acSelect",
queryParamName:"q",limitParamName:"limit",extraParams:{},lineSeparator:"\n",cellSeparator:"|",minChars:2,maxItemsToShow:10,delay:400,useCache:!0,maxCacheLength:10,matchSubset:!0,matchCase:!1,matchInside:!0,mustMatch:!1,selectFirst:!1,selectOnly:!1,showResult:null,preventDefaultReturn:!0,preventDefaultTab:!1,autoFill:!1,filterResults:!0,sortResults:!0,sortFunction:null,onItemSelect:null,onNoMatch:null,onFinish:null,matchStringConvertor:null}})(jQuery);


(function($){$.extend({tablesorter:new
function(){var parsers=[],widgets=[];this.defaults={cssHeader:"header",cssAsc:"headerSortUp",cssDesc:"headerSortDown",cssChildRow:"expand-child",sortInitialOrder:"asc",sortMultiSortKey:"shiftKey",sortForce:null,sortAppend:null,sortLocaleCompare:true,textExtraction:"simple",parsers:{},widgets:[],widgetZebra:{css:["even","odd"]},headers:{},widthFixed:false,cancelSelection:true,sortList:[],headerList:[],dateFormat:"us",decimal:'/\.|\,/g',onRenderHeader:null,selectorHeaders:'thead th',debug:false};function benchmark(s,d){log(s+","+(new Date().getTime()-d.getTime())+"ms");}this.benchmark=benchmark;function log(s){if(typeof console!="undefined"&&typeof console.debug!="undefined"){console.log(s);}else{alert(s);}}function buildParserCache(table,$headers){if(table.config.debug){var parsersDebug="";}if(table.tBodies.length==0)return;var rows=table.tBodies[0].rows;if(rows[0]){var list=[],cells=rows[0].cells,l=cells.length;for(var i=0;i<l;i++){var p=false;if($.metadata&&($($headers[i]).metadata()&&$($headers[i]).metadata().sorter)){p=getParserById($($headers[i]).metadata().sorter);}else if((table.config.headers[i]&&table.config.headers[i].sorter)){p=getParserById(table.config.headers[i].sorter);}if(!p){p=detectParserForColumn(table,rows,-1,i);}if(table.config.debug){parsersDebug+="column:"+i+" parser:"+p.id+"\n";}list.push(p);}}if(table.config.debug){log(parsersDebug);}return list;};function detectParserForColumn(table,rows,rowIndex,cellIndex){var l=parsers.length,node=false,nodeValue=false,keepLooking=true;while(nodeValue==''&&keepLooking){rowIndex++;if(rows[rowIndex]){node=getNodeFromRowAndCellIndex(rows,rowIndex,cellIndex);nodeValue=trimAndGetNodeText(table.config,node);if(table.config.debug){log('Checking if value was empty on row:'+rowIndex);}}else{keepLooking=false;}}for(var i=1;i<l;i++){if(parsers[i].is(nodeValue,table,node)){return parsers[i];}}return parsers[0];}function getNodeFromRowAndCellIndex(rows,rowIndex,cellIndex){return rows[rowIndex].cells[cellIndex];}function trimAndGetNodeText(config,node){return $.trim(getElementText(config,node));}function getParserById(name){var l=parsers.length;for(var i=0;i<l;i++){if(parsers[i].id.toLowerCase()==name.toLowerCase()){return parsers[i];}}return false;}function buildCache(table){if(table.config.debug){var cacheTime=new Date();}var totalRows=(table.tBodies[0]&&table.tBodies[0].rows.length)||0,totalCells=(table.tBodies[0].rows[0]&&table.tBodies[0].rows[0].cells.length)||0,parsers=table.config.parsers,cache={row:[],normalized:[]};for(var i=0;i<totalRows;++i){var c=$(table.tBodies[0].rows[i]),cols=[];if(c.hasClass(table.config.cssChildRow)){cache.row[cache.row.length-1]=cache.row[cache.row.length-1].add(c);continue;}cache.row.push(c);for(var j=0;j<totalCells;++j){cols.push(parsers[j].format(getElementText(table.config,c[0].cells[j]),table,c[0].cells[j]));}cols.push(cache.normalized.length);cache.normalized.push(cols);cols=null;};if(table.config.debug){benchmark("Building cache for "+totalRows+" rows:",cacheTime);}return cache;};function getElementText(config,node){var text="";if(!node)return"";if(!config.supportsTextContent)config.supportsTextContent=node.textContent||false;if(config.textExtraction=="simple"){if(config.supportsTextContent){text=node.textContent;}else{if(node.childNodes[0]&&node.childNodes[0].hasChildNodes()){text=node.childNodes[0].innerHTML;}else{text=node.innerHTML;}}}else{if(typeof(config.textExtraction)=="function"){text=config.textExtraction(node);}else{text=$(node).text();}}return text;}function appendToTable(table,cache){if(table.config.debug){var appendTime=new Date()}var c=cache,r=c.row,n=c.normalized,totalRows=n.length,checkCell=(n[0].length-1),tableBody=$(table.tBodies[0]),rows=[];for(var i=0;i<totalRows;i++){var pos=n[i][checkCell];rows.push(r[pos]);if(!table.config.appender){var l=r[pos].length;for(var j=0;j<l;j++){tableBody[0].appendChild(r[pos][j]);}}}if(table.config.appender){table.config.appender(table,rows);}rows=null;if(table.config.debug){benchmark("Rebuilt table:",appendTime);}applyWidget(table);setTimeout(function(){$(table).trigger("sortEnd");},0);};function buildHeaders(table){if(table.config.debug){var time=new Date();}var meta=($.metadata)?true:false;var header_index=computeTableHeaderCellIndexes(table);$tableHeaders=$(table.config.selectorHeaders,table).each(function(index){this.column=header_index[this.parentNode.rowIndex+"-"+this.cellIndex];this.order=formatSortingOrder(table.config.sortInitialOrder);this.count=this.order;if(checkHeaderMetadata(this)||checkHeaderOptions(table,index))this.sortDisabled=true;if(checkHeaderOptionsSortingLocked(table,index))this.order=this.lockedOrder=checkHeaderOptionsSortingLocked(table,index);if(!this.sortDisabled){var $th=$(this).addClass(table.config.cssHeader);if(table.config.onRenderHeader)table.config.onRenderHeader.apply($th);}table.config.headerList[index]=this;});if(table.config.debug){benchmark("Built headers:",time);log($tableHeaders);}return $tableHeaders;};function computeTableHeaderCellIndexes(t){var matrix=[];var lookup={};var thead=t.getElementsByTagName('THEAD')[0];var trs=thead.getElementsByTagName('TR');for(var i=0;i<trs.length;i++){var cells=trs[i].cells;for(var j=0;j<cells.length;j++){var c=cells[j];var rowIndex=c.parentNode.rowIndex;var cellId=rowIndex+"-"+c.cellIndex;var rowSpan=c.rowSpan||1;var colSpan=c.colSpan||1
var firstAvailCol;if(typeof(matrix[rowIndex])=="undefined"){matrix[rowIndex]=[];}for(var k=0;k<matrix[rowIndex].length+1;k++){if(typeof(matrix[rowIndex][k])=="undefined"){firstAvailCol=k;break;}}lookup[cellId]=firstAvailCol;for(var k=rowIndex;k<rowIndex+rowSpan;k++){if(typeof(matrix[k])=="undefined"){matrix[k]=[];}var matrixrow=matrix[k];for(var l=firstAvailCol;l<firstAvailCol+colSpan;l++){matrixrow[l]="x";}}}}return lookup;}function checkCellColSpan(table,rows,row){var arr=[],r=table.tHead.rows,c=r[row].cells;for(var i=0;i<c.length;i++){var cell=c[i];if(cell.colSpan>1){arr=arr.concat(checkCellColSpan(table,headerArr,row++));}else{if(table.tHead.length==1||(cell.rowSpan>1||!r[row+1])){arr.push(cell);}}}return arr;};function checkHeaderMetadata(cell){if(($.metadata)&&($(cell).metadata().sorter===false)){return true;};return false;}function checkHeaderOptions(table,i){if((table.config.headers[i])&&(table.config.headers[i].sorter===false)){return true;};return false;}function checkHeaderOptionsSortingLocked(table,i){if((table.config.headers[i])&&(table.config.headers[i].lockedOrder))return table.config.headers[i].lockedOrder;return false;}function applyWidget(table){var c=table.config.widgets;var l=c.length;for(var i=0;i<l;i++){getWidgetById(c[i]).format(table);}}function getWidgetById(name){var l=widgets.length;for(var i=0;i<l;i++){if(widgets[i].id.toLowerCase()==name.toLowerCase()){return widgets[i];}}};function formatSortingOrder(v){if(typeof(v)!="Number"){return(v.toLowerCase()=="desc")?1:0;}else{return(v==1)?1:0;}}function isValueInArray(v,a){var l=a.length;for(var i=0;i<l;i++){if(a[i][0]==v){return true;}}return false;}function setHeadersCss(table,$headers,list,css){$headers.removeClass(css[0]).removeClass(css[1]);var h=[];$headers.each(function(offset){if(!this.sortDisabled){h[this.column]=$(this);}});var l=list.length;for(var i=0;i<l;i++){h[list[i][0]].addClass(css[list[i][1]]);}}function fixColumnWidth(table,$headers){var c=table.config;if(c.widthFixed){var colgroup=$('<colgroup>');$("tr:first td",table.tBodies[0]).each(function(){colgroup.append($('<col>').css('width',$(this).width()));});$(table).prepend(colgroup);};}function updateHeaderSortCount(table,sortList){var c=table.config,l=sortList.length;for(var i=0;i<l;i++){var s=sortList[i],o=c.headerList[s[0]];o.count=s[1];o.count++;}}function multisort(table,sortList,cache){if(table.config.debug){var sortTime=new Date();}var dynamicExp="var sortWrapper = function(a,b) {",l=sortList.length;for(var i=0;i<l;i++){var c=sortList[i][0];var order=sortList[i][1];var s=(table.config.parsers[c].type=="text")?((order==0)?makeSortFunction("text","asc",c):makeSortFunction("text","desc",c)):((order==0)?makeSortFunction("numeric","asc",c):makeSortFunction("numeric","desc",c));var e="e"+i;dynamicExp+="var "+e+" = "+s;dynamicExp+="if("+e+") { return "+e+"; } ";dynamicExp+="else { ";}var orgOrderCol=cache.normalized[0].length-1;dynamicExp+="return a["+orgOrderCol+"]-b["+orgOrderCol+"];";for(var i=0;i<l;i++){dynamicExp+="}; ";}dynamicExp+="return 0; ";dynamicExp+="}; ";if(table.config.debug){benchmark("Evaling expression:"+dynamicExp,new Date());}eval(dynamicExp);cache.normalized.sort(sortWrapper);if(table.config.debug){benchmark("Sorting on "+sortList.toString()+" and dir "+order+" time:",sortTime);}return cache;};function makeSortFunction(type,direction,index){var a="a["+index+"]",b="b["+index+"]";if(type=='text'&&direction=='asc'){return"("+a+" == "+b+" ? 0 : ("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : ("+a+" < "+b+") ? -1 : 1 )));";}else if(type=='text'&&direction=='desc'){return"("+a+" == "+b+" ? 0 : ("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : ("+b+" < "+a+") ? -1 : 1 )));";}else if(type=='numeric'&&direction=='asc'){return"("+a+" === null && "+b+" === null) ? 0 :("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : "+a+" - "+b+"));";}else if(type=='numeric'&&direction=='desc'){return"("+a+" === null && "+b+" === null) ? 0 :("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : "+b+" - "+a+"));";}};function makeSortText(i){return"((a["+i+"] < b["+i+"]) ? -1 : ((a["+i+"] > b["+i+"]) ? 1 : 0));";};function makeSortTextDesc(i){return"((b["+i+"] < a["+i+"]) ? -1 : ((b["+i+"] > a["+i+"]) ? 1 : 0));";};function makeSortNumeric(i){return"a["+i+"]-b["+i+"];";};function makeSortNumericDesc(i){return"b["+i+"]-a["+i+"];";};function sortText(a,b){if(table.config.sortLocaleCompare)return a.localeCompare(b);return((a<b)?-1:((a>b)?1:0));};function sortTextDesc(a,b){if(table.config.sortLocaleCompare)return b.localeCompare(a);return((b<a)?-1:((b>a)?1:0));};function sortNumeric(a,b){return a-b;};function sortNumericDesc(a,b){return b-a;};function getCachedSortType(parsers,i){return parsers[i].type;};this.construct=function(settings){return this.each(function(){if(!this.tHead||!this.tBodies)return;var $this,$document,$headers,cache,config,shiftDown=0,sortOrder;this.config={};config=$.extend(this.config,$.tablesorter.defaults,settings);$this=$(this);$.data(this,"tablesorter",config);$headers=buildHeaders(this);this.config.parsers=buildParserCache(this,$headers);cache=buildCache(this);var sortCSS=[config.cssDesc,config.cssAsc];fixColumnWidth(this);$headers.click(function(e){var totalRows=($this[0].tBodies[0]&&$this[0].tBodies[0].rows.length)||0;if(!this.sortDisabled&&totalRows>0){$this.trigger("sortStart");var $cell=$(this);var i=this.column;this.order=this.count++%2;if(this.lockedOrder)this.order=this.lockedOrder;if(!e[config.sortMultiSortKey]){config.sortList=[];if(config.sortForce!=null){var a=config.sortForce;for(var j=0;j<a.length;j++){if(a[j][0]!=i){config.sortList.push(a[j]);}}}config.sortList.push([i,this.order]);}else{if(isValueInArray(i,config.sortList)){for(var j=0;j<config.sortList.length;j++){var s=config.sortList[j],o=config.headerList[s[0]];if(s[0]==i){o.count=s[1];o.count++;s[1]=o.count%2;}}}else{config.sortList.push([i,this.order]);}};setTimeout(function(){setHeadersCss($this[0],$headers,config.sortList,sortCSS);appendToTable($this[0],multisort($this[0],config.sortList,cache));},1);return false;}}).mousedown(function(){if(config.cancelSelection){this.onselectstart=function(){return false};return false;}});$this.bind("update",function(){var me=this;setTimeout(function(){me.config.parsers=buildParserCache(me,$headers);cache=buildCache(me);},1);}).bind("updateCell",function(e,cell){var config=this.config;var pos=[(cell.parentNode.rowIndex-1),cell.cellIndex];cache.normalized[pos[0]][pos[1]]=config.parsers[pos[1]].format(getElementText(config,cell),cell);}).bind("sorton",function(e,list){$(this).trigger("sortStart");config.sortList=list;var sortList=config.sortList;updateHeaderSortCount(this,sortList);setHeadersCss(this,$headers,sortList,sortCSS);appendToTable(this,multisort(this,sortList,cache));}).bind("appendCache",function(){appendToTable(this,cache);}).bind("applyWidgetId",function(e,id){getWidgetById(id).format(this);}).bind("applyWidgets",function(){applyWidget(this);});if($.metadata&&($(this).metadata()&&$(this).metadata().sortlist)){config.sortList=$(this).metadata().sortlist;}if(config.sortList.length>0){$this.trigger("sorton",[config.sortList]);}applyWidget(this);});};this.addParser=function(parser){var l=parsers.length,a=true;for(var i=0;i<l;i++){if(parsers[i].id.toLowerCase()==parser.id.toLowerCase()){a=false;}}if(a){parsers.push(parser);};};this.addWidget=function(widget){widgets.push(widget);};this.formatFloat=function(s){var i=parseFloat(s);return(isNaN(i))?0:i;};this.formatInt=function(s){var i=parseInt(s);return(isNaN(i))?0:i;};this.isDigit=function(s,config){return/^[-+]?\d*$/.test($.trim(s.replace(/[,.']/g,'')));};this.clearTableBody=function(table){if($.browser.msie){function empty(){while(this.firstChild)this.removeChild(this.firstChild);}empty.apply(table.tBodies[0]);}else{table.tBodies[0].innerHTML="";}};}});$.fn.extend({tablesorter:$.tablesorter.construct});var ts=$.tablesorter;ts.addParser({id:"text",is:function(s){return true;},format:function(s){return $.trim(s.toLocaleLowerCase());},type:"text"});ts.addParser({id:"digit",is:function(s,table){var c=table.config;return $.tablesorter.isDigit(s,c);},format:function(s){return $.tablesorter.formatFloat(s);},type:"numeric"});ts.addParser({id:"currency",is:function(s){return/^[£$€?.]/.test(s);},format:function(s){return $.tablesorter.formatFloat(s.replace(new RegExp(/[£$€]/g),""));},type:"numeric"});ts.addParser({id:"ipAddress",is:function(s){return/^\d{2,3}[\.]\d{2,3}[\.]\d{2,3}[\.]\d{2,3}$/.test(s);},format:function(s){var a=s.split("."),r="",l=a.length;for(var i=0;i<l;i++){var item=a[i];if(item.length==2){r+="0"+item;}else{r+=item;}}return $.tablesorter.formatFloat(r);},type:"numeric"});ts.addParser({id:"url",is:function(s){return/^(https?|ftp|file):\/\/$/.test(s);},format:function(s){return jQuery.trim(s.replace(new RegExp(/(https?|ftp|file):\/\//),''));},type:"text"});ts.addParser({id:"isoDate",is:function(s){return/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(s);},format:function(s){return $.tablesorter.formatFloat((s!="")?new Date(s.replace(new RegExp(/-/g),"/")).getTime():"0");},type:"numeric"});ts.addParser({id:"percent",is:function(s){return/\%$/.test($.trim(s));},format:function(s){return $.tablesorter.formatFloat(s.replace(new RegExp(/%/g),""));},type:"numeric"});ts.addParser({id:"usLongDate",is:function(s){return s.match(new RegExp(/^[A-Za-z]{3,10}\.? [0-9]{1,2}, ([0-9]{4}|'?[0-9]{2}) (([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(AM|PM)))$/));},format:function(s){return $.tablesorter.formatFloat(new Date(s).getTime());},type:"numeric"});ts.addParser({id:"shortDate",is:function(s){return/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(s);},format:function(s,table){var c=table.config;s=s.replace(/\-/g,"/");if(c.dateFormat=="us"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,"$3/$1/$2");}else if(c.dateFormat=="uk"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,"$3/$2/$1");}else if(c.dateFormat=="dd/mm/yy"||c.dateFormat=="dd-mm-yy"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/,"$1/$2/$3");}return $.tablesorter.formatFloat(new Date(s).getTime());},type:"numeric"});ts.addParser({id:"time",is:function(s){return/^(([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(am|pm)))$/.test(s);},format:function(s){return $.tablesorter.formatFloat(new Date("2000/01/01 "+s).getTime());},type:"numeric"});ts.addParser({id:"metadata",is:function(s){return false;},format:function(s,table,cell){var c=table.config,p=(!c.parserMetadataName)?'sortValue':c.parserMetadataName;return $(cell).metadata()[p];},type:"numeric"});ts.addWidget({id:"zebra",format:function(table){if(table.config.debug){var time=new Date();}var $tr,row=-1,odd;$("tr:visible",table.tBodies[0]).each(function(i){$tr=$(this);if(!$tr.hasClass(table.config.cssChildRow))row++;odd=(row%2==0);$tr.removeClass(table.config.widgetZebra.css[odd?0:1]).addClass(table.config.widgetZebra.css[odd?1:0])});if(table.config.debug){$.tablesorter.benchmark("Applying Zebra widget",time);}}});})(jQuery);