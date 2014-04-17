class SuivisController < ApplicationController
	def new
		if params[:mailing_id].present?
			@suivi = Suivi.new(:date_suivi => Date.today, :client_id => params[:client_id], :mailing_id => params[:mailing_id])
			@envoi = Envoi.find(params[:envoi_id])
			@last_suivis = Suivi.where(:client_id => params[:client_id], :mailing_id => params[:mailing_id]).order("date_suivi DESC").limit(3)
		else
			@suivi = Suivi.new(:date_suivi => Date.today, :client_id => params[:client_id])
			@last_suivis = Suivi.where(:client_id => params[:client_id]).order("date_suivi DESC").limit(3)
		end
	end
	
	def create
		@suivi = Suivi.new(params[:suivi])
		
		if @suivi.save
			@mailing = @suivi.mailing
			if params[:envoi].present?
				@envoi = Envoi.find(params[:envoi])
				envois_client = EnvoisClient.where(:envoi_id => @envoi.id, :client_id => @suivi.client_id).first
				envois_client.update_attributes(:etat_id => @suivi.etat_id, :last_suivi => @suivi.date_suivi)
		
				redirect_to mailing_envoi_path(@mailing,@envoi)
			else
				redirect_to client_path(@suivi.client, :page => "suivis")
			end
		else
			render :new
		end
	end
end