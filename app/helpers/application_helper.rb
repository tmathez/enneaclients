#encoding: utf-8

module ApplicationHelper	
	def sortable(column,title = nil)
		title ||= column.titleize
		direction = column == sort_column && sort_direction == "asc" ? "desc" : "asc"
		arrow = direction == "asc" ? "▲" : "▼" if column == sort_column
		link_to(title, params.merge(:sort => column, :direction => direction), { :class => "sortable" })+(" <span class='light'>#{arrow.to_s}</span>").html_safe
	end
	
	def format_number(value,separator)
		value = value.nil? ? 0 : value
		value = '%.2f' % value
		value.to_s.gsub(/(\d)(?=(\d\d\d)+(?!\d))/,"\\1"+separator)
	end
	
	def imgBool(value,text=false)
		if text
			return value ? "Oui".html_safe : "Non".html_safe
		else
			return value ? "<img src='/images/checked.png' alt='Oui' />".html_safe : ""
		end
	end
	
	def date_field(object,method,date,options = {})
		name = method.to_s != "" ? object+"["+method+"]" : object
		tag :input, { :type => "text", :name => name, :id => sanitize_to_id(name),
					  :value => date.nil? ? "" : date.strftime("%d.%m.%Y"), 
					  :class => "date_field" }.update(options.stringify_keys)
	end
	
	def time_field(object,method,date,options = {})
		name = object+"["+method+"]"
		tag :input, { :type => "text", :name => name, :id => sanitize_to_id(name),
					  :value => date.nil? ? "" : date.strftime("%H:%M"), 
					  :class => "time_field" }.update(options.stringify_keys)
	end
	
	def format_date(date,heure = false)
		if !date.nil?
			if heure
				if date.strftime("%H").to_f + date.strftime("%M").to_f == 0
					return ""
				else
					return date.strftime("%H:%M")
				end
			else
				if date.strftime("%d").to_f + date.strftime("%m").to_f + date.strftime("%Y").to_f == 1902
					return ""
				else
					return date.strftime("%d.%m.%Y")
				end
			end
		else
			return ""				
		end	
	end
	
	def format_date_texte(date)
		if date.nil?
			return ""
		else
			mois = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","decembre"][date.strftime("%m").to_i-1]
			return "#{date.strftime("%d").to_i.to_s} #{mois} #{date.strftime("%Y")}"
		end		
	end
	
	def e(text,masculin=true,alt_text="Non sp&eacute;cifi&eacute;")
		text = text.strftime("%d.%m.%Y") if text.class == Date 
		return (text.nil? || text.blank? ? (masculin ? "<span class='light'>#{alt_text}</span>" : "<span class='light'>#{alt_text}e</span>") : text.to_s).html_safe
	end
	
	def light_rc(text)
		s = ""
		i = false
		b = false
		text.each_char { |c|
			t = "" 		
			if c == "*"
				if !b
					t = "<b>"
					b = true
				else
					t = "</b>"
					b = false
				end
			elsif c == "_"
				if !i
					t = "<i>"
					i = true
				else
					t = "</i>"
					i = false
				end
			else
				t = c
			end
			s += t
		}
		return s		
	end
	
	def local_ip(ip)
		return ip[0..9] != "192.168.2." ? false : true
	end
	
	def business_days_between(date1, date2)
	  business_days = 0
	  date = date2
	  while date > date1
	   business_days = business_days + 1 unless date.saturday? or date.sunday?
	   date = date - 1.day
	  end
	  business_days
	end

	
	class CustomFormBuilder < ActionView::Helpers::FormBuilder
		def text_field(method,options={})
			column = @object.class.columns.select{|c| c.name == method.to_s }[0]
			if !column.nil?
				case column.type
					when :float
						options.merge!(:class => "numeric_field", :placeholder => "0.00")			
				end
			end
			super(method, options)		
		end
	end
	
	def subdomain(request)
		return request.subdomain.blank? ? "clients" : request.subdomain
	end
	
	def subdomain_extension
		return request.subdomain == "prospect" ? "_prospect" : "" 		
	end
	
	# Renvoit true si on est en prospect et false si on est en client - subdomain
	def prospect
		return request.subdomain == "prospect" ? true : false		
	end
	
	def small_title(titre)
		case titre.downcase
			when "monsieur"
				"M."
			when "madame"
				"Mme"
			when "mademoiselle"
				"Mlle"
			else
				""			
		end		
	end
	
	def cantons
		return [
				"AG",
				"AI",
				"AR",
				"BE",
				"BL",
				"BS",
				"FR",
				"GE",
				"GL",
				"GR",
				"JU",
				"LU",
				"NE",
				"NW",
				"OW",
				"SG",
				"SH",
				"SO",
				"SZ",
				"TG",
				"TI",
				"UR",
				"VD",
				"VS",
				"ZG",
				"ZH"
		]
	end
	
	def select_tag_bool(name,selected_val=nil)
		 select_tag name, "<option value='' #{'selected' if selected_val.nil?}></option><option value='true' #{'selected' if selected_val == 'true'}>Avec</option><option value='false' #{'selected' if selected_val == 'false'}>Sans</option>".html_safe
	end
	
	def record_to_hash(record)
		hash = {}
		record.class.columns.each {|column| hash[column.name] = record[column.name] }
		hash
		#hash = {}
		#record.instance_variables.each {|var| hash[var.to_s.delete("@")] = record.instance_variable_get(var) }
		#hash
	end
	
	def record_to_params(record)
		params = ""
		record.instance_variables.each {|var| params += "#{var.to_s.delete("@")}=#{record.instance_variable_get(var)}&".strip if var.to_s.delete("@") != "changed_attributes" }
		params
	end
end