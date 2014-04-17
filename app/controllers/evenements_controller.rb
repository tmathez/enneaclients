class EvenementsController < ApplicationController
	before_filter :check_remote_ip
	
	def index
		session[:responsable_id] = params[:selected] if !params[:selected].nil?
		
		if params[:limit]
			if session[:responsable_id] != "0" && !session[:responsable_id].nil?
				@solved  = Evenement.where(:resolu => true, :responsable_id => session[:responsable_id]).order("date_evenement DESC, client_id").offset(20)
				@solved_length = Evenement.where(:resolu => true, :responsable_id => session[:responsable_id]).length
			else
				@solved  = Evenement.where(:resolu => true).order("date_evenement DESC, client_id").offset(20)
				@solved_length = Evenement.where(:resolu => true).length
			end
		else
			if session[:responsable_id] != "0" && !session[:responsable_id].nil?
				@pending = Evenement.where(:resolu => false, :responsable_id => session[:responsable_id]).order("date_evenement, client_id")
				@solved  = Evenement.where(:resolu => true, :responsable_id => session[:responsable_id]).order("date_evenement DESC, client_id").limit(20)
				@solved_length = Evenement.where(:resolu => true, :responsable_id => session[:responsable_id]).length
				session[:responsable] = Responsable.find(session[:responsable_id]).prenom
			else
				@pending = Evenement.where(:resolu => false).order("date_evenement, client_id")
				@solved  = Evenement.where(:resolu => true).order("date_evenement DESC, client_id").limit(20)
				@solved_length = Evenement.where(:resolu => true).length
				session[:responsable] = "Tout le monde"
			end
		end
			
		respond_to do |format|
			format.html
			format.js
		end
	end
	
	def show
		@evenement = Evenement.find(params[:id])
		
		respond_to do |format|
			format.html
		end
	end
	
	def new
		@evenement = Evenement.new
		@evenement.responsable_id = session[:responsable_id] if session[:responsable_id] != "0" && !session[:responsable_id].nil?
		@evenement.client_id = params[:client_id] if !params[:client_id].nil?
		@remarques = !params[:client_id].nil? ? Client.find(params[:client_id]).remarques : nil
		@no_support = !params[:client_id].nil? ? Client.find(params[:client_id]).blocked_support : 0
		
		respond_to do |format|
			format.html
		end
	end
	
	def create
		@evenement = Evenement.new(params[:evenement])
		
		respond_to do |format|
			if @evenement.save
				format.html { redirect_to (params[:client_id].nil? ? evenements_path : client_path(@evenement.client.id)) }
			else
				format.html { render :action => "new" }
			end
		end
	end
	
	def edit
		@evenement = Evenement.find(params[:id])
		@remarques = @evenement.client.remarques
		
		if params[:resolu] == "false"
			@evenement.update_attribute(:resolu, params[:resolu])
			@evenement.update_attribute(:solution, nil)
			respond_to do |format|
				format.js
			end
		else
			respond_to do |format|
				format.html
				format.js
			end
		end
	end
	
	def update
		@evenement = Evenement.find(params[:id])
		
		respond_to do |format|
			if @evenement.update_attributes(params[:evenement])
				format.html { redirect_to (params[:facturation].nil? ? (params[:from_client] == "true" || !params[:client_id].nil? ? client_path(@evenement.client.id) : evenements_path) : facturation_evenements_path) }
			else
				format.html { render :action => "edit" }
			end
		end
	end
	
	def destroy
		@evenement = Evenement.find(params[:id])
		@evenement.destroy
		
		respond_to do |format|
			format.js
		end
	end
	
	# ACTIONS PERSONNALISEES
	
	def refresh
		if params[:client_id]
			@pending = Evenement.where(:resolu => false, :client_id => params[:client_id]).order("date_evenement, client_id")
		else
			if session[:responsable_id] != "0" && !session[:responsable_id].nil?
				@pending = Evenement.where(:resolu => false, :responsable_id => session[:responsable_id]).order("date_evenement, client_id")
				session[:responsable] = Responsable.find(session[:responsable_id]).prenom
			else
				@pending = Evenement.where(:resolu => false).order("date_evenement, client_id")
				#@solved  = Evenement.where(:resolu => true).order("date_evenement DESC, client_id")
				session[:responsable] = "Tout le monde"
			end
		end
		
		respond_to do |format|
			format.js
		end
	end
	
	def facturation
		if params[:facturation].nil?
			@facturer = Evenement.where(:facturation => 1).order(:date_evenement)
			@factures = Evenement.where(:facturation => 2).order("date_evenement DESC")
			
			respond_to do |format|
				format.html
			end
		else
			@evenement = Evenement.find(params[:id])
			@evenement.update_attribute(:facturation, 1) if params[:facturation] == "1"
			respond_to do |format|
				format.js
			end
		end
	end
	
	def search
		@pending = Evenement.search(params[:search],false) #.order("date_evenement, client_id")
		@solved = Evenement.search(params[:search],true) #.order("date_evenement DESC, client_id")
		
		respond_to do |format|
			format.html
		end
	end
	
	def email
		if params[:content].nil?
			if params[:preview].nil?
				@evenements = Evenement.find_by_sql("SELECT client_id, clients.nom, clients.id, description, solution, resolu, responsable_id, facturation, tarif, heures
													 FROM evenements, clients WHERE to_char(evenements.updated_at,'DD.MM.YYYY') = '#{params[:date_email].to_s}'
													 AND evenements.client_id = clients.id AND responsable_id = #{params[:responsable_id]} ORDER BY clients.nom;")
	
				respond_to do |format|
					format.html
				end
			else
				respond_to do |format|
					format.js
				end
			end
		else
			ResponsableMailer.resume(params[:responsable_id],params[:sujet],params[:content]).deliver
						
			respond_to do |format|
				format.html	{ redirect_to evenements_path }			
			end
		end
	end
	
	def print
		if params[:commit].present?
			@responsable = params[:responsable] == "" ? "tout le monde" : Responsable.find(params[:responsable]).prenom
			@du = params[:date_du].blank? ? Date.new(1900,01,01) : Date.new(params[:date_du][6..10].to_i,params[:date_du][3..4].to_i,params[:date_du][0..1].to_i)
			@au = params[:date_au].blank? ? Date.new(2099,12,31) : Date.new(params[:date_au][6..10].to_i,params[:date_au][3..4].to_i,params[:date_au][0..1].to_i)
			
			query=""
			query+= "client_id = #{params[:client_id]} AND " if !params[:client_id].blank?
			query+= "resolu = #{params[:statut]} AND " if !params[:statut].blank?
			query+= "responsable_id = #{params[:responsable]} AND " if !params[:responsable].blank?
			query+= "tag_id = #{params[:tag_id]} AND " if !params[:tag_id].blank?
			query+= "date_evenement >= ? AND date_evenement <= ?"
			
			@evenements = Evenement.where(query, @du, @au).order("resolu, date_evenement DESC, responsable_id")
			
			if @evenements.length > 0
				@du = @evenements.last.date_evenement if @du.strftime("%Y") == "1900"
				@au = @evenements.first.date_evenement if @au.strftime("%Y") == "2099"
			end
			
			respond_to do |format|
				format.html { render :layout => "print" }
			end
		else
			@responsables = Responsable.all
			@tags = Tag.all
			respond_to do |format|
				format.js
			end
		end
	end
	
	def print_facturation
		if params[:commit].present?
			@responsable = params[:responsable] == "" ? "tout le monde" : Responsable.find(params[:responsable]).prenom
			@du = params[:date_du].blank? ? Date.new(1900,01,01) : Date.new(params[:date_du][6..10].to_i,params[:date_du][3..4].to_i,params[:date_du][0..1].to_i)
			@au = params[:date_au].blank? ? Date.new(2099,12,31) : Date.new(params[:date_au][6..10].to_i,params[:date_au][3..4].to_i,params[:date_au][0..1].to_i)
			@statut = params[:statut] == "" ? " > 0" : " = #{params[:statut]}"
			
			query=""
			query+= "facturation #{@statut} AND "
			query+= "responsable_id = #{params[:responsable]} AND " if !params[:responsable].blank?
			query+= "date_evenement >= ? AND date_evenement <= ?"
			
			@evenements = Evenement.where(query, @du, @au).order("facturation, date_evenement DESC, responsable_id")
			
			if @evenements.length > 0
				@du = @evenements.last.date_evenement if @du.strftime("%Y") == "1900"
				@au = @evenements.first.date_evenement if @au.strftime("%Y") == "2099"
			end
			
			respond_to do |format|
				format.html { render :layout => "print" }
			end
		else
			@responsables = Responsable.all
			respond_to do |format|
				format.js
			end
		end
	end
	
	def check_remote_ip
		if !local_ip
			redirect_to clients_path
		end
	end
end