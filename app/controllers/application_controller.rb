# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.

class ApplicationController < ActionController::Base
  before_filter :authenticate_if_not_api
  
  I18n.locale = "fr-CH"
	
  helper :all # include all helpers, all the time
  protect_from_forgery # See ActionController::RequestForgeryProtection for details

  # Scrub sensitive parameters from your log
  # filter_parameter_logging :password
  
  # Clé unique pour l'api tel.search.ch
  TEL_SEARCH_KEY = "90f8e9b09ca98d09a936f74ef962ffd7"
  
  private

  def authenticate_if_not_api
    if !request.fullpath.include?('/api/')
	  authenticate_or_request_with_http_basic 'development' do |name, password|
        name == "enneasoft" && password == "Ecl-2@11*httpC"
      end
    end
  end
  
  def local_ip
    	return true
  	#ip = request.remote_ip #env["HTTP_X_FORWARDED_FOR"]
 	#return (ip[0..9] != "192.168.1." and ip != "178.192.18.139" and ip != "127.0.0.1") ? false : true
  end

  # Renvoit, en fonction de la page en cours et du subdomain, la requête à ajouter
  def query_by_subdomain(path)
  	case path
  	  when "clients#index"
  	    return prospect ? "interesse = TRUE" : "interesse = FALSE"
  	  #when
  	  #else
  	end
  end

  # Renvoit true si on est en prospect et false si on est en client - subdomain
  def prospect
  	return request.subdomain == "prospect" ? true : false		
  end
end