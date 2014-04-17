class Suivi < ActiveRecord::Base
	belongs_to :client
	belongs_to :mailing
	belongs_to :etat
	
	# Retourne le nom complet du contact
	def contact
		"#{small_title(contact_titre.to_s)} #{contact_prenom.to_s} #{contact_nom.to_s}".strip		
	end
end