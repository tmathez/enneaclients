class Envoi < ActiveRecord::Base
	belongs_to :mailing
	has_many :envois_clients, :dependent => :destroy
	has_many :clients, :through => :envois_clients
	
	accepts_nested_attributes_for :clients
	
	def a_contacter(mailing_id)
		envois_clients.where(:etat_id => 1).count
	end
	
	def a_rappeler(mailing_id)
		envois_clients.where(:etat_id => 2).count
	end
	
	def ne_plus_contacter(mailing_id)
		envois_clients.where(:etat_id => 3).count
	end
	
	def contact_favorable(mailing_id)
		envois_clients.where(:etat_id => 4).count
	end
	
	def has_suivi?
		return envois_clients.where("last_suivi IS NOT NULL").count > 0
	end
end