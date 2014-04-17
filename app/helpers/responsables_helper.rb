module ResponsablesHelper
	def select_options(selected)
		s = "<option value='0' "+('selected="selected"' if selected == 0).to_s+">Tout le monde &nbsp;</option>"
		for responsable in Responsable.where(inactive:false).order(:prenom)
			s += "<option value='"+responsable.id.to_s+"' "+('selected="selected"' if selected == responsable.id.to_s).to_s+">"+responsable.prenom.to_s+"</option>"
		end	
		return s.html_safe
	end
end