class TextesStandardsController < ApplicationController
	def edit
		@textes_standard = TextesStandard.where(:societe_id => params[:id]).first
	end
	
	def update
		@texte = TextesStandard.find(params[:id])
		@texte.update_attributes(params[:textes_standard])
		
		render :nothing => true
	end
end