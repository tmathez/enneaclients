class EnvoisClient < ActiveRecord::Base
	belongs_to :client
	belongs_to :envoi
end