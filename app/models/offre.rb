class Offre < ActiveRecord::Base
	belongs_to :societe
	belongs_to :client
	has_many :software_module, :through => :offres_modules
	has_many :offres_modules, :dependent => :destroy
	has_many :custom_services, :through => :offres_services
	has_many :offres_services, :dependent => :destroy
	has_many :catalogues, :through => :offres_catalogues
	has_many :offres_catalogues, :dependent => :destroy
	
	accepts_nested_attributes_for :offres_modules, :allow_destroy => true, :reject_if => proc { |attributes| attributes['module_id'].blank? }
	accepts_nested_attributes_for :offres_services, :allow_destroy => true, :reject_if => proc { |attributes| attributes['service_id'].blank? }
	accepts_nested_attributes_for :offres_catalogues, :allow_destroy => true, :reject_if => proc { |attributes| attributes['catalogue_id'].blank? }
	
	def total_modules
		tot = 0
		for e in offres_modules
			tot += e.prix
		end
		return tot
	end
	
	def total_licence
		licence_pourcent.blank? ? total_modules * 0.2 : licence_pourcent * 0.2
	end
	
	def total_licences
		total_licence*licences.to_f
	end
	
	def total_rabais
		(total_modules+total_licences) * (rabais_logiciel.to_f / 100)
	end
	
	def total_modules_final
		total_modules+total_licences-total_rabais
	end
	
	def total_services
		tot = 0
		for e in offres_services
			tot += (e.prix_jour.to_f * e.nb_jours.to_f)
		end
		return tot
	end
	
	def total_ht
		total_modules_final + total_services		
	end
	
	def total_tva
		total_ht*0.08
	end
	
	def total_ttc
		total_ht+total_tva
	end
	
	def total_catalogues
		tot = 0
		for e in offres_catalogues
			tot += e.prix.to_f
		end
		return tot		
	end
	
	def total_annuel
		total_catalogues.to_f + contrat.to_f		
	end
end
