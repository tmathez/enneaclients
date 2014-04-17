class ClientsSecteur < ActiveRecord::Base
	belongs_to :client
	belongs_to :secteur
end