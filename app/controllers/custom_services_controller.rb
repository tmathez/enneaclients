class CustomServicesController < ApplicationController
	def update
		@service = CustomService.find(params[:id])
		@service.update_attributes(params[:custom_service])
		
		render :nothing => true
	end
end