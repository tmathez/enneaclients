class Mailing < ActiveRecord::Base
	has_many :envois, :dependent => :destroy
	has_many :suivis, :dependent => :destroy
	belongs_to :type_mailing
	belongs_to :interet
	
	accepts_nested_attributes_for :envois
	
	def clients_count
		count = 0
		for envoi in envois
			count += envoi.clients.length
		end
		count		
	end
	
	def a_contacter
		total = 0
		for envoi in envois
			total += envoi.a_contacter(self.id)
		end 
		total
	end
	
	def a_rappeler
		suivis.where(:etat_id => 2).count
	end
	
	def ne_plus_contacter
		suivis.where(:etat_id => 3).count
	end
	
	def contact_favorable
		suivis.where(:etat_id => 4).count
	end
end