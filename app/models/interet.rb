class Interet < ActiveRecord::Base
	has_many :clients_interets, :dependent => :destroy
	has_many :clients, :through => :clients_interets
	# A voir
	has_many :mailings
end