class MailingsController < ApplicationController
	def index
		@pendings = Mailing.order("created_at").where(:termine => false)
		@done = Mailing.order("created_at").where(:termine => true)
	end
	
	def show
		@mailing = Mailing.find(params[:id])		
	end
	
	def new
		@mailing = Mailing.new(:termine => false)
		@mailing.envois.build(:date_envoi => Date.today)
		@clients = {}
		@filtres = {}
	end
	
	def create
		@mailing = Mailing.new(params[:mailing])
		
		if @mailing.save
			redirect_to mailing_path(@mailing)
		else
			render :new			
		end		
	end
	
	def edit
		@mailing = Mailing.find(params[:id])	
	end
	
	def update
		if params[:done].present?
			@mailing = Mailing.find(params[:id])
			@mailing.update_attribute(:termine, params[:done])
		else		
			@mailing = Mailing.find(params[:id])
			
			if @mailing.update_attributes(params[:mailing])
				redirect_to mailing_path(@mailing)
			else
				render :new			
			end
		end
	end
	
	def destroy
		@mailing = Mailing.find(params[:id])
		@mailing.destroy
		
		redirect_to mailings_path		
	end
end