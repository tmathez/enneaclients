class Catalogue < ActiveRecord::Base
	has_many :offres, :through => :offres_catalogues
	has_many :offres_catalogues, :dependent => :destroy
end
