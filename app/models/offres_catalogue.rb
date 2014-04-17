class OffresCatalogue < ActiveRecord::Base
	belongs_to :offre
	belongs_to :catalogue
end
