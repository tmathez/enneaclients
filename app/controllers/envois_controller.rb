#encoding: UTF-8
class EnvoisController < ApplicationController
	def show
		where = !params[:filtre].blank? ? "etat_id = #{params[:filtre]}" : ""
		@envoi = Envoi.find(params[:id])
		@mailing = @envoi.mailing
		@filtres = filtre_to_hash(@envoi.filtre)
		@clients = @envoi.clients.where(where).order("envois_clients.etat_id, envois_clients.last_suivi, clients.nom")
		
		respond_to do |format|
			format.html
			format.js
			format.xml { render :xml => @clients }		
			format.xls do
		      render :xls => @envoi.clients,
		                     :columns => [ :nom, :titre, :contact_prenom, :contact_nom, :rue, :npa, :lieu ],
		                     :headers => %w[ Société Titre Prénom Nom Rue NPA Lieu ]
		    end
		end
	end
	
	def new
		@envoi = Envoi.new(:mailing_id => params[:mailing_id])		
		@filtres = {}
	end
	
	def create
		@envoi = Envoi.new(params[:envoi])
		
		if @envoi.save
			redirect_to mailing_path(@envoi.mailing)
		else
			render :new			
		end		
	end
	
	def edit
		@envoi = Envoi.find(params[:id])
		@mailing = @envoi.mailing
		@filtres = filtre_to_hash(@envoi.filtre)
		@clients = @envoi.clients.order("clients.nom")
	end
	
	def update
		if params[:done].present?
			@envoi = Envoi.find(params[:id])
			@envoi.update_attribute(:termine, params[:done])
		else
			params[:envoi][:client_ids] ||= []
			
			@envoi = Envoi.find(params[:id])
			
			if @envoi.update_attributes(params[:envoi])
				redirect_to mailing_envoi_path(@envoi.mailing, @envoi)
			else
				render :edit			
			end
		end				
	end
	
	def destroy
		@envoi = Envoi.find(params[:id])
		mailing = @envoi.mailing
		@envoi.destroy
		
		redirect_to mailing_path(mailing)
	end
	
	# Actions personnalisées
	def refresh_clients
		select = "SELECT DISTINCT clients.* FROM clients"
		where = " WHERE "
		where += "interesse = %s AND " % params[:filtre][:interesses] if !params[:filtre][:interesses].blank? # Filtre les intéressé ou les clients si le filtre est défini
		if params[:filtre][:has_secteur].present? && params[:filtre][:secteur].present? # Si des domaines d'activités ont été définis
			select += " JOIN clients_secteurs ON clients_secteurs.client_id = clients.id"
			for secteur in params[:filtre][:secteur]
				#where += "(SELECT count(secteur_id) FROM clients_secteurs WHERE client_id = clients.id AND clients_secteurs.secteur_id = #{secteur.to_s}) > 0 OR "
				where += "clients_secteurs.secteur_id = #{secteur} OR "
			end
			where = where[0..where.length-5]+" AND "
		end
		if params[:filtre][:has_interet].present? && params[:filtre][:interet].present? # Si des intérêts particuliers ont été définis
			select += " JOIN clients_interets ON clients_interets.client_id = clients.id"
			for interet in params[:filtre][:interet]
				#where += "(SELECT count(interet_id) FROM clients_interets WHERE client_id = clients.id AND clients_interets.interet_id = #{interet.to_s}) > 0 OR "
				where += "clients_interets.interet_id = #{interet} OR "				
			end
			where = where[0..where.length-5]+" AND "
		end
		if params[:filtre][:has_lieu].present? # Si des filtres géorgraphiques ont été définis
			where += "canton = '#{params[:filtre][:lieu_canton]}' AND " if !params[:filtre][:lieu_canton].blank? # Si on a spécifié un canton
			where += "npa >= '#{params[:filtre][:lieu_npa_de]}' AND " if !params[:filtre][:lieu_npa_de].blank? # Si on a spécifié un NPA de départ
			where += "npa <= '#{params[:filtre][:lieu_npa_a]}' AND " if !params[:filtre][:lieu_npa_a].blank? # Si on a spécifié un NPA de départ
		end
		if params[:filtre][:interesses] == 'false' # N'appliquer ces filtres que si on a choisi les 'clients' et non les intéressés
			if params[:filtre][:has_contrat].present? # Si des filtres par contrat maintenance ont été définis
				where += "sorba = #{params[:filtre][:contrat_sorba]} AND " if !params[:filtre][:contrat_sorba].blank?
  				where += "enneasoft = #{params[:filtre][:contrat_enneasoft]} AND " if !params[:filtre][:contrat_enneasoft].blank?
			end
			if params[:filtre][:has_produit].present? # Si des filtres par produit ont été définis
				version = (params[:filtre][:produit_version_epdf].include?(">") || params[:filtre][:produit_version_epdf].include?("<") ? params[:filtre][:produit_version_epdf] : "= #{params[:filtre][:produit_version_epdf]}")
	  			where += "numero #{params[:filtre][:produit_sorba] == 'true' ? "> 0" : "IS NULL"} AND " if !params[:filtre][:produit_sorba].blank?
	  			where += "\"enneascanningSorba\" = #{params[:filtre][:produit_enneascanning]} AND "  if !params[:filtre][:produit_enneascanning].blank?
	  			where += "\"enneascanningPdf\" = #{params[:filtre][:produit_enneascanning_pdf]} AND "  if !params[:filtre][:produit_enneascanning_pdf].blank?
	  			where += "autre #{params[:filtre][:produit_autres] == 'true' ? "<>" : "="} '' AND "  if !params[:filtre][:produit_autres].blank?
	  			where += "version_epdf #{version} AND " if !params[:filtre][:produit_version_epdf].blank?
			end
		end
		@filtre = filtres_to_string(params[:filtre])
		where = where == " WHERE " ? "" : where[0..where.length-6]
		@clients = Client.find_by_sql(select+where+" ORDER BY nom")
	end
	
	def add_client
		if !params[:search].blank?
			clients = array_to_query(params[:existing_client])
			query = "SELECT id, nom, npa, lieu FROM clients WHERE #{clients} UPPER(nom) LIKE UPPER('%#{params[:search]}%') ORDER BY nom;"
			@clients = Client.find_by_sql(query)
		elsif params[:selected_clients].present?
			where = array_to_query(params[:selected_clients],"=","OR")
			where = where[0..where.length-5]
			@clients = Client.where(where).order('nom')
		else
			@clients = nil
		end
	end
	
	private
	
	def filtres_to_string(params)
		filtre = ""
		for p in params
			filtre += "#{p[0]}=#{p[1]};" if !p[1].blank?		
		end
		filtre
	end
	
	def filtre_to_hash(filtre)
		hash = {}
		for s in filtre.split(";") # On sépare par ";" pour un resultat du genre : ["interesse=true", "canton=JU"]
			f = s.split("=")
			param = { f[0] => f[1] }
			hash.merge!(f[0] => f[1])
		end
		hash
	end
	
	def array_to_query(clients,operator="<>",condition="AND")
		query = ""
		for client_id in clients.split(",")
			query += "id #{operator} #{client_id} #{condition} " if !client_id.blank?			
		end		
		query
	end
end