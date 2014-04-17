module EvenementsHelper
	def get_email(evenements)
		client = 0
		s = ""
		h = false
		for evenement in evenements 
			if evenement.resolu && evenement.facturation < 1
				s += "h3. Supports OK\n" if h == false
				h = true
				s += "* *{color:darkred}"+evenement.client.nom.to_s+"*\n"  if client != evenement.client.id
				s += evenement.description.to_s + "\n" 
				s += "%{color:green}"+evenement.solution.to_s.gsub(/%/,"&#37;") + "%\n" if !evenement.solution.blank?
				client = evenement.client.id
			end
		end
		client = 0
		h = false
		for evenement in evenements 
			if evenement.resolu && evenement.facturation == 1
				s += "\nh3. A facturer\n" if h == false
				h = true
				s += "* *{color:darkred}"+evenement.client.nom.to_s+"*\n"  if client != evenement.client.id
				s += evenement.description.to_s + "\n" 
				s += "%{color:green}"+evenement.solution.to_s + "%\n"
  				s += "*Facturer : "+format_number((evenement.heures.nil? ? 0 : evenement.heures.to_s),"'")+"h. &agrave; "+format_number(evenement.tarif.to_s,"'")+"Fr.*"
				client = evenement.client.id
			end
		end
		client = 0
		h = false
		for evenement in evenements 
			if !evenement.resolu
				s += "\n\nh3. En attente\n" if h == false
				h = true
				s += "* *{color:darkred}"+evenement.client.nom.to_s+"*\n"  if client != evenement.client.id
				s += evenement.description.to_s + "\n" 
				client = evenement.client.id
			end
		end
		return s
	end
end