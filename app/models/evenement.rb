class Evenement < ActiveRecord::Base
	belongs_to :client
	belongs_to :responsable
	belongs_to :tag
	
	validates_presence_of :responsable_id, :client_id, :description, :tag_id
	validates :solution, :solution => true
	
	attr_reader :total
	attr_accessor :tel
	
	def self.search(search,solved)
		if search != ""
			order = solved ? "date_evenement DESC" : "date_evenement"
			searches = search.split
			query = "SELECT evenements.*, clients.id AS client_client_id, clients.nom FROM evenements, clients WHERE ("
			for s in searches
				query += "(UPPER(description) LIKE UPPER('%#{s}%') OR UPPER(solution) LIKE UPPER('%#{s}%') OR UPPER(clients.nom) LIKE UPPER('%#{s}%'))"
				query += " AND "
			end
			query = query[0..query.length-5]
			query += ") AND resolu = #{solved.to_s} AND client_id = clients.id ORDER BY #{order};"
			find_by_sql(query)
			#where("(UPPER(description) LIKE UPPER(?) OR UPPER(solution) LIKE UPPER(?)) AND resolu = ?", "%#{search}%", "%#{search}%", solved)
		else
			nil
		end
	end
	
	def total
		heures * tarif
	end
	
	def tel=(t)
		self.telephone = client.nil? ? nil : (t == client.tel ? nil : t)
	end
	
	def tel
		telephone.nil? ? (client.nil? ? nil : client.tel) : telephone		
	end
end