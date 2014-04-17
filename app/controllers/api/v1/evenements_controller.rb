module Api
	module V1
		class EvenementsController < ApplicationController
			respond_to :json
			
			def index
				query = params[:responsable_id].present? ? "responsable_id = #{params[:responsable_id].to_s}" : ""
				respond_with Evenement.where(query).order('resolu, date_evenement')				
			end
			
			def pending
				query = params[:responsable_id].present? ? "responsable_id = #{params[:responsable_id].to_s}" : ""
				respond_with Evenement.where(:resolu => false).where(query).order('date_evenement')
			end
			
			def solved
				query = params[:responsable_id].present? ? "responsable_id = #{params[:responsable_id].to_s}" : ""
				respond_with Evenement.where(:resolu => true).where(query).order('date_evenement')
			end
		end
	end
end