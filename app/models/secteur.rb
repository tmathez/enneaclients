class Secteur < ActiveRecord::Base
	has_many :clients_secteurs, :dependent => :destroy
	has_many :clients, :through => :clients_secteurs
end