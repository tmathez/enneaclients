class CustomService < ActiveRecord::Base
	has_many :offres, :through => :offres_services
	has_many :offres_services, :dependent => :destroy
end