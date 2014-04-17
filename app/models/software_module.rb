class SoftwareModule < ActiveRecord::Base
	has_many :offres, :through => :offres_modules
	has_many :offres_modules, :dependent => :destroy
end
