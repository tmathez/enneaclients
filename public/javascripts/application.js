// Animation du background
(function($) {
    if(!document.defaultView || !document.defaultView.getComputedStyle){
        var oldCurCSS = jQuery.curCSS;
        jQuery.curCSS = function(elem, name, force){
            if(name === 'background-position'){
                name = 'backgroundPosition';
            }
            if(name !== 'backgroundPosition' || !elem.currentStyle || elem.currentStyle[ name ]){
                return oldCurCSS.apply(this, arguments);
            }
            var style = elem.style;
            if ( !force && style && style[ name ] ){
                return style[ name ];
            }
            return oldCurCSS(elem, 'backgroundPositionX', force) +' '+ oldCurCSS(elem, 'backgroundPositionY', force);
        };
    }

    var oldAnim = $.fn.animate;
    $.fn.animate = function(prop){
        if('background-position' in prop){
            prop.backgroundPosition = prop['background-position'];
            delete prop['background-position'];
        }
        if('backgroundPosition' in prop){
            prop.backgroundPosition = '('+ prop.backgroundPosition;
        }
        return oldAnim.apply(this, arguments);
    };

    function toArray(strg){
        strg = strg.replace(/left|top/g,'0px');
        strg = strg.replace(/right|bottom/g,'100%');
        strg = strg.replace(/([0-9\.]+)(\s|\)|$)/g,"$1px$2");
        var res = strg.match(/(-?[0-9\.]+)(px|\%|em|pt)\s(-?[0-9\.]+)(px|\%|em|pt)/);
        return [parseFloat(res[1],10),res[2],parseFloat(res[3],10),res[4]];
    }

    $.fx.step. backgroundPosition = function(fx) {
        if (!fx.bgPosReady) {
            var start = $.curCSS(fx.elem,'backgroundPosition');

            if(!start){//FF2 no inline-style fallback
                start = '0px 0px';
            }

            start = toArray(start);

            fx.start = [start[0],start[2]];

            var end = toArray(fx.options.curAnim.backgroundPosition);
            fx.end = [end[0],end[2]];

            fx.unit = [end[1],end[3]];
            fx.bgPosReady = true;
        }
        //return;
        var nowPosX = [];
        nowPosX[0] = ((fx.end[0] - fx.start[0]) * fx.pos) + fx.start[0] + fx.unit[0];
        nowPosX[1] = ((fx.end[1] - fx.start[1]) * fx.pos) + fx.start[1] + fx.unit[1];           
        fx.elem.style.backgroundPosition = nowPosX[0]+' '+nowPosX[1];

    };
})(jQuery);


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
			if ($(this).attr('id') == 'is_client_enneasoft') {
				$("#client_numero_enneasoft").val($("#next_numero_enneasoft").val());
			}
		} else {
			$(this).parent().parent().parent().addClass('pas_client');
			$(this).parent().parent().parent().find('input[type=text]').each(function() { 
				if ($(this).attr('id') != 'next_numero_enneasoft') { $(this).val('') }
			});
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
		$("#no_support").val($("#evenement_client_id").val());
		$("#evenement_telephone").val($("#telephone option:selected").text());
		
		var remarques = $("#remarques option:selected").text();
		$("#client_remarques").html(light_rc(remarques).replace("\n","<br/>"));
		
		if (remarques == "") {
			if (!$("#client_remarques").hasClass("hidden")) { $("#client_remarques").addClass("hidden") }
		} else {
			if ($("#client_remarques").hasClass("hidden")) { $("#client_remarques").removeClass("hidden") }
		}
		
		if ($("#no_support option:selected").text() == "0") {
			if (!$(".no_support_for_you").hasClass("hidden")) { $(".no_support_for_you").addClass("hidden") }
		} else {
			if ($(".no_support_for_you").hasClass("hidden")) { $(".no_support_for_you").removeClass("hidden") }
			switch($("#no_support option:selected").text()) {
				case "1":
					$(".no_support_for_you > span").html("Les supports sont bloqués pour ce client.");
					break;
				case "2":
					$(".no_support_for_you > span").html("Ce client ne dispose pas de contrat maintenance Sorba.");
					break;
				case "3":
					$(".no_support_for_you > span").html("Ce client ne dispose pas de contrat maintenance enneasoft.");
					break;
				case "4":
					$(".no_support_for_you > span").html("Ce client ne dispose ni de contrat maintenance Sorba, ni enneasoft.");
					break;
			}
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
	
	$(".show_all_solved").unbind('click').click(function(){
		$(this).css('background','transparent');
		$(this).html('<img src="/images/loader.gif" />');
	});
	
	if ($(".module").length > 0 || $(".textes_elements").length > 0) {
		$("textarea").autogrow();
	}
	
	$(".module input[type=checkbox], .service input[type=checkbox], .catalogue input[type=checkbox]").change(function(){
		if ($(this).attr('checked')) {
			$(this).parent().parent().css('background','#EFF4F7');
			$(this).parent().parent().css('border-bottom-color','#CCC');
			// On défini si c'est coché
			$(this).next('input').val($(this).parent().parent().children('input').val());
			// On et on met la valeur _destroy à false
			$(this).next().next().val(false);
		} else {
			$(this).parent().parent().css('background','#FFF');
			$(this).parent().parent().css('border-bottom-color','#EEE');
			// On vide l'id si ce n'est pas coché
			$(this).next('input').val("");
			// On et on met la valeur _destroy à true
			$(this).next().next().val(true);
		}
		
		calculOffre();
	}).trigger('change');
	$("#offre_licences").change(function(){
		calculOffre();
	}).trigger('change');
	$("#form_offre .numeric_field").change(function(){
		calculOffre();
	}).trigger('change');
	$("#form_offre .nb_jours").change(function(){
		var input = $(this).parent().prev().prev().children("input");
		if (parseFloat($(this).val()) > 0) {
			input.attr("checked", "checked").trigger('change');
		} else {
			input.removeAttr("checked").trigger('change');
		}
	});
	$(".edit_texte_standard").unbind('click').click(function(){
		$(this).css('display','none');
		$(this).next().css('display','inline');
		$(this).next().next().css('display','inline');
		
		if ($(this).parent().parent().attr('id').indexOf("module") > -1) {
			$(this).parent().prev().children('input').removeAttr('readonly');
			$(this).parent().prev().prev().children('textarea').removeAttr('readonly');
			$(this).parent().prev().prev().prev().children('input').removeAttr('readonly');
		} else if ($(this).parent().parent().attr('id').indexOf("service") > -1) {
			$(this).parent().prev().children('input').removeAttr('readonly');
			$(this).parent().prev().prev().children('textarea').removeAttr('readonly');
		}
	});
	$(".cancel_texte_standard").unbind('click').click(function(){
		$(this).prev().css('display','inline');
		$(this).css('display','none');
		$(this).next().css('display','none');
		
		if ($(this).parent().parent().attr('id').indexOf("module") > -1) {
			$(this).parent().prev().children('input').val($(this).parent().prev().children('input:last').val());
			$(this).parent().prev().children('input').attr('readonly',true);
			$(this).parent().prev().prev().children('textarea').val($.trim($(this).parent().prev().prev().children('span').html()));
			$(this).parent().prev().prev().children('textarea').attr('readonly',true);
			$(this).parent().prev().prev().prev().children('input').val($(this).parent().prev().prev().prev().children('input:last').val());
			$(this).parent().prev().prev().prev().children('input').attr('readonly',true);
		} else if ($(this).parent().parent().attr('id').indexOf("service") > -1) {
			$(this).parent().prev().children('input').val($(this).parent().prev().children('input:last').val());
			$(this).parent().prev().children('input').attr('readonly',true);
			$(this).parent().prev().prev().children('textarea').val($.trim($(this).parent().prev().prev().children('span').html()));
			$(this).parent().prev().prev().children('textarea').attr('readonly',true);
		}
		
		$(this).parent().parent().children('textarea').trigger('change');
	});
	$(".save_texte_standard").unbind('click').click(function(){
		$(this).prev().prev().css('display','inline');
		$(this).prev().css('display','none');
		$(this).css('display','none');
		
		if ($(this).parent().parent().attr('id').indexOf("module") > -1) {
			$(this).parent().prev().children('input:last').val($(this).parent().prev().children('input').val());
			$(this).parent().prev().children('input').attr('readonly',true);
			$(this).parent().prev().prev().children('span').html($(this).parent().prev().prev().children('textarea').val());
			$(this).parent().prev().prev().children('textarea').attr('readonly',true);
			$(this).parent().prev().prev().prev().children('input:last').val($(this).parent().prev().prev().prev().children('input').val());
			$(this).parent().prev().prev().prev().children('input').attr('readonly',true);
		} else if ($(this).parent().parent().attr('id').indexOf("service") > -1) {
			$(this).parent().prev().children('input:last').val($(this).parent().prev().children('input').val());
			$(this).parent().prev().children('input').attr('readonly',true);
			$(this).parent().prev().prev().children('span').html($(this).parent().prev().prev().children('textarea').val());
			$(this).parent().prev().prev().children('textarea').attr('readonly',true);
		}
		
		$(this).parent().parent().children('textarea').trigger('change');
		$(this).parent().parent().effect("highlight", {}, 1000);
		$(this).parent().parent().parent().submit();
	});
	
	$(".edit_textes_societe").unbind('click').click(function(){
		$(".texte_standard input, .texte_standard textarea").removeAttr('readonly');
		$(this).css('display','none');
		$(this).next().css('display','inline');
		$(this).next().next().css('display','inline');
		$("#textes_standards_societe_id").attr('disabled',true);
	});
	$(".cancel_textes_societe").unbind('click').click(function(){
		$(".texte_standard input, .texte_standard textarea").attr('readonly',true);
		$(this).parent().prev().prev().css('display','inline');
		$(this).parent().prev().css('display','none');
		$(this).parent().css('display','none');
		
		$(".texte_standard input[type=text]").each(function(){
			$(this).val($(this).next().val());
		});
		
		$(".texte_standard textarea").each(function(){
			$(this).val($.trim($(this).next().html()));
			$(this).trigger('change');
		});
		$("#textes_standards_societe_id").attr('disabled',false);
	});
	$(".save_textes_societe").unbind('click').click(function(){
		$(".texte_standard input, .texte_standard textarea").attr('readonly',true);
		$(this).prev().css('display','inline');
		$(this).css('display','none');
		$(this).next().css('display','none');
		
		$(".texte_standard input[type=hidden]").each(function(){
			$(this).val($(this).prev().val());
		});
		
		$(".texte_standard span").each(function(){
			$(this).html($(this).prev().val());
		});
		
		$(".texte_standard input, .texte_standard textarea").effect("highlight", {}, 1000);
		$(".texte_standard").parent().submit();
		$("#textes_standards_societe_id").attr('disabled',false);
	});
	
	$("#textes_standards_societe_id").unbind('change').change(function(){
		$.get("/textes_standards/"+$(this).val()+"/edit", null, null, 'script');
	});
		// Si on click sur le body on masque la flêche et la liste
	$("body").unbind('click').click(function(){
		if ($("#show_adresse_client_list").css('display') == 'block') {
			$("#show_adresse_client_list").fadeOut();
		}
	});
	// Changement du client de l'offre
	$("#change_adresse_offre").unbind('click').click(function(e){
		if ($("#show_adresse_client_list").css('display') == 'none') {
			$("#show_adresse_client_list").css($(this).offset());
			$("#show_adresse_client_list").css('top','55px');
			$("#show_adresse_client_list").css('left', parseInt($("#show_adresse_client_list").css('left'))-150);
			$("#show_adresse_client_list").fadeIn();
		} else {
			$("#show_adresse_client_list").fadeOut();
		}
		e.stopPropagation();
	});
	$("#show_adresse_client_list").unbind('click').click(function(e){
		e.stopPropagation();
	});
	$("#show_adresse_client_list select").unbind('change').change(function(e){
		e.stopPropagation();
		$.get("/offres/change_client?id="+$(this).val(), null, null, 'script');
	});

	$("#filter_contrats").unbind('change').change(function(){
		if ($("#contrats:visible").length > 0) { $("#contrats").hide(); } else { $("#contrats").show(); }
	});

	$("#filter_products").unbind('change').change(function(){
		if ($("#products:visible").length > 0) { $("#products").hide(); } else { $("#products").show(); }
	});
	
	// Recherche du lieu par le NPA
	$("#client_npa").unbind('change').change(function(){
		$.ajax({
			url: "http://api.geonames.org/postalCodeSearchJSON",
			dataType: "jsonp",
			data: {
				postalcode: $(this).val(),
				country: "CH",
				maxRows: 1,
				username: "enneasoft"
			},
			success: function( data ) {
				$("#client_lieu").val($.map( data.postalCodes, function( item ) {
					return item.placeName;
				}));
				$("#client_canton").val($.map( data.postalCodes, function( item ) {
					return item.adminCode1;
				}));
			}
		});
	});	
	
	// Affiche ou masque un élément en fonction de la coche de l'élément actuel
	$("input[type=checkbox]").each(function(){
		var element = $(this).attr("data-show-hide");
		if (element != undefined) {
			$(this).unbind('change').change(function(){
				if ($(this).attr('checked')) { $("#"+element).show(); } else { $("#"+element).hide(); }
			});
		}
	});
	
	// Masque le bouton "rafraîchir" quand on clique dessus pour afficher le chargement
	$(".edit_mailing .button_link").unbind('click').click(function(){
		if (($("#clients table").length > 0 && confirm("Cette action supprimera toute séléction de client que vous auriez pu faire et appliquera les filtres définis, voulez-vous continuer ?")) || $("#clients table").length == 0) {
			$(this).hide();
			$("#loading_refresh").show();
			$.ajax({
				url: "/envois/refresh_clients?attribute="+get_attribute(),
				type: "POST",
				dataType: "script",
				data: $("#new_mailing, #new_envoi, .edit_envoi").serialize().replace("_method=put","_method=post"), // Nécessaire de remplacer la méthode put en post
				success: function() {
					$("#loading_refresh").hide();
					$(".edit_mailing .button_link").show();	
				},
				error: function() {
					alert("Problème d'accès à la base de données, veuillez réessayer.");
					$("#loading_refresh").hide();
					$(".edit_mailing .button_link").show();	
				}
			});
		}		
	});
	// Masque les filtres "contrat maintenance" et "produits" si on choisir autre chose que le filtre "Client" dans la liste des filtres
	$("#filtre_interesses").unbind('change').change(function(){
		if ($(this).val() == 'false') {
			$("#filtre_clients").show();
		} else {
			$("#filtre_clients").hide();	
		}
	});
	// Ferme la fenêtre de suivi et pointe sur le bon client
	$("a").each(function(){
		if ($(this).attr('data-close') != undefined) {
			$(this).unbind('click').click(function(){
				$("#"+$(this).attr('data-close')).css('display','none');
				$("#overlay").css('display','none');
			})
		}
	});
	// Genère le lien vers l'ajout de client et passe en argument la liste des clients déjà séléctionnés
	$("#add_client_link").each(function(){
		var clients = "";
		$("#clients_for_envoi tr").each(function(){
			clients += $(this).attr('id')+",";
		});
		
		$(this).unbind('click').click(function(){
			$.ajax({
				url: "/envois/add_client?attribute="+get_attribute(),
				type: "POST",
				dataType: "script",
				data: { "existing_client" : clients }
			});
		});
	});
	// Recherche les clients à ajouter
	$("#add_client .button_link").unbind('click').click(function(){
		search_add_client();
	});
	$("#search_add_client").unbind('submit').submit(function(){
		search_add_client();
		return false;
	});
	function search_add_client() {
		$("#add_client .button_link").hide();
		$("#loading_refresh").show();
		
		$.ajax({
			url: "/envois/add_client",
			type: "POST",
			dataType: "script",
			data: $("#search_add_client").serialize(),
			success: function(){
				$("#add_client .button_link").show();
				$("#loading_refresh").hide();
			}, 
			error: function(){
				$("#add_client .button_link").show();
				$("#loading_refresh").hide();
			}
		});
	}
	// Requête d'ajout des clients
	$("#submit_add_clients").unbind('click').click(function(){
		var clients = ""
		$("#results .client").each(function(){
			if ($("input", $(this)).attr('checked')) {
				clients += $(this).attr('id')+",";
			}			
		});
		
		if (clients.length > 0) {
			$.ajax({
				url: "/envois/add_client?attribute="+get_attribute(),
				type: "POST",
				dataType: "script",
				data: { "selected_clients" : clients }
			});
		} else {
			alert("Séléctionner au moins un client pour pouvoir l'ajouter à l'envoi en cours.")
		}
		
		return false;
	});
	// Récupère l'attribut pour le nouvel envoi ou l'envoi modifier
	function get_attribute() {
		var attr = "envoi";
		if (window.location.pathname.indexOf('envois') == -1) { attr = "mailing[envois_attributes]["+$("#envoi_id").val()+"]"; }
		return attr;
	}
	// Lance le filtre sur les clients listé dans l'envoi lorsqu'on change la séléction
	$("#filtre_show_clients").unbind('change').change(function(){
		$("#show_clients_filter").hide();
		$("#loading_refresh").show();
		
		$.ajax({
			url: location.href,
			type: "GET",
			dataType: "script",
			data: { "filtre" : $(this).val() },
			success: function() {
				$("#show_clients_filter").show();
				$("#loading_refresh").hide();
			},
			error: function(){
				$("#show_clients_filter").show();
				$("#loading_refresh").hide();
			}
		});
	});
	// Affiche - masque le chargement lors du changement de section dans la vue d'un client
	$(".show_client_menu a").unbind('click').click(function(){
		// On vide les sections
		$("#show_sections > div").hide().html('');
		// Et on affiche le loader
		$("#loading_change_section").css('display','block');
	});
	
	// Switch : interessé client
	$(".switch.interesse").unbind('click').click(function(){
		if ($(this).css('background-position') == "0px 0px") {
			$(this).animate({ backgroundPosition: '-83px 0px' }, 300);
			$(this).next('input').val(false);
			$(".show_client_menu").show();
			$("#form_client_client").show();
			$("#form_client_interesse").hide();
		} else {
			$(this).animate({ backgroundPosition: '0px 0px' }, 300);
			$(this).next('input').val(true);
			$(".show_client_menu").hide();
			$("#form_client_client").hide();
			$("#form_client_interesse").show();
			$(".show_client_menu > li:first").removeClass('selected').addClass('selected');
			$(".show_client_menu > li:last").removeClass('selected');
		}
	});
	
	$(".edit_client_menu > li").unbind('click').click(function(){
		if (!$(this).hasClass('selected')) { 
			$(this).parent().children('li').removeClass('selected');
			$(this).addClass('selected');
			$("#form_client_client").hide();
			$("#form_client_interesse").hide();
			$("#"+$(this).attr('data-div')).show();
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

function calculOffre() {
	var tot = 0, tot_modules = 0, tot_services = 0;
	$(".module input[type=checkbox]").each(function(){
		if ($(this).attr('checked')) {
			tot += parseFloat($(this).parent().next().next().next().children('input').val());
		}
	});

	$("#total_modules").val(numeric(tot));
	var tot_for_licence = $("#offre_licence_pourcent").val() == "" ? tot : parseFloat($("#offre_licence_pourcent").val());
	var tot_licence = tot_for_licence * 0.2;
	$("#total_licence").html(tot_licence);
	$("#total_licences").val(numeric(parseFloat($("#offre_licences").val())*tot_licence));
	tot += parseFloat($("#offre_licences").val())*tot_licence;
	$("#total_rabais").val(numeric((parseFloat($("#offre_rabais_logiciel").val())/100)*tot));
	tot -= (parseFloat($("#offre_rabais_logiciel").val())/100)*tot;
	$("#total_final_modules").val(numeric(tot));
	tot_modules = tot
	
	$(".service input[type=checkbox]").each(function(){
		var jours = $(this).parent().next().next().children('input').val(), 
		    taux = $(this).parent().next().next().next().children('input').val(),
		    total = $(this).parent().next().next().next().next().children('input')
		
		total.val(numeric(parseFloat(jours)*parseFloat(taux)));
		  
		if ($(this).attr('checked')) {
			tot_services += parseFloat(total.val());
		}
	});
	
	$("#total_final_services").val(numeric(tot_services));
	tot += tot_services
	
	$("#total_recap_modules").val(numeric(tot_modules));
	$("#total_recap_services").val(numeric(tot_services));
	$("#total_recap_ht").val(numeric(tot));
	$("#total_recap_tva").val(numeric(tot*0.08));
	$("#total_recap_ttc").val(numeric(tot+(tot*0.08)));
}

function numeric(value) {
	var number = 0;
	if (value != "") {
		number = (Math.round(parseFloat(value)*20)/20).toFixed(2);
	} else {
		number = parseFloat(0).toFixed(2);
	}
	return number;
}

