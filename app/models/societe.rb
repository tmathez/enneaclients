class Societe < ActiveRecord::Base
	belongs_to :client
	has_many :offres
	has_many :textes_standards
end