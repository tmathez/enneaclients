#encoding: UTF-8
module OffresHelper
	def value_for_record(offre,field,offre_field)
		offre.new_record? ? (offre.client_id.nil? ? nil : @offre.client[field]) : @offre[offre_field]
	end
end
