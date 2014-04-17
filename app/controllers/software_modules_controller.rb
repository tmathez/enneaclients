class SoftwareModulesController < ApplicationController
	def update
		@module = SoftwareModule.find(params[:id])
		@module.update_attributes(params[:software_module])
		
		render :nothing => true
	end
end