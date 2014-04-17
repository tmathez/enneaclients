class ClientsInteret < ActiveRecord::Base
	belongs_to :client
	belongs_to :interet
end