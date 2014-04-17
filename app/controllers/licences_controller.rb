#encoding: UTF-8
class LicencesController < ApplicationController
	def index
		@client = Client.find(params[:client_id])
		@licences = @client.licences_logs.order("date_licence DESC")
		@currents = @client.licences
	end
	
	def destroy
		@client = Client.find(params[:client_id])
		@licence = Licence.find(params[:id])
		@client.licences_logs.create(:poste_id => @licence.poste_id, :granted => nil, :date_licence => DateTime.now,
									 :message => "Licence supprimee manuellement par l'administrateur.")
		@licence.destroy
		
		respond_to do |format|
			format.html { redirect_to client_licences_path(@client) }
		end
	end
	
	# ACTIONS PERSONNALISEES
	
	def check
		@client = Client.where(:serial => params[:key]).first
		
		if @client.nil? or !params[:key].present?
			@client = nil
			@success = false
			@message = (params[:lng] == "fr" or !params[:lng].present?) ? "Cette clé ne correspond à aucun client valide." : ""
		else
			if (@client.nb_licences > @client.licences.length) or (@client.enneascanning_ts and @client.licences.length == 0)
				@success = true
				@client.licences.create(:poste_id => params[:poste_id])
				@message = "Licence acceptée. Licences disponibles : #{@client.nb_licences}, licences utilisées : #{@client.licences.length}"
			else
				@success = false
				@message = "Licence refusée, trop de licence enregistrée pour ce client. Licences disponibles : #{@client.nb_licences}, licences utilisées : #{@client.licences.length}"
			end
			@client.licences_logs.create(:poste_id => params[:poste_id], :granted => @success, :date_licence => DateTime.now, :message => @message)
		end
		
		respond_to do |format|
			format.xml
		end
	end
	
	def uncheck
		@licence = Licence.where(:poste_id => params[:poste_id]).first
		@message = ""
		
		if !@licence.nil?
			@licence.destroy
			@message = "Licence supprimée avec succès. Licences disponibles : #{@licence.client.nb_licences}, licences utilisées : #{@licence.client.licences.length}"
			@licence.client.licences_logs.create(:poste_id => params[:poste_id], :granted => nil, :date_licence => DateTime.now, :message => @message)
		end
		
		respond_to do |format|
			format.xml
		end
	end
end