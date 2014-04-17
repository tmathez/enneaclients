Enneaclients::Application.routes.draw do
	resources :clients do
		collection do
			get :print
			get :print_excel
			post :update_enneascanning
		end
		resources :evenements
		resources :licences do
			collection do
				get :create_licence
			end			
		end
		resources :offres
		resources :suivis		
	end
	
	resources :evenements do
		collection do
			get :facturation
			get :email
			get :search
			get :print
			get :print_facturation
			get :refresh
		end
	end
	resources :responsables
	resources :licences do
		post :check, :on => :collection
		post :uncheck, :on => :collection		
	end
	
	resources :offres do
		get :textes, :on => :collection
		get :change_client, :on => :collection
	end
	
	resources :software_modules
	resources :custom_services
	resources :textes_standards
	resources :societes
	
	resources :mailings do
		resources :envois
		resources :suivis
	end
	resources :envois do
		post :refresh_clients, :on => :collection # Permet d'afficher la liste des clients de l'envoi en fonction du filtre défini		
		post :add_client, :on => :collection	  # Permet d'ajouter un ou plusieurs clients séléctionnés à l'envoi en cours
	end
	resources :suivis
	
	resources :prospects do
		get :add_client, :on => :collection # Affiche la fenêtre d'ajout d'un client ou ajoute le client depuis la liste des clients trouvés sur tel.search.ch		
	end
	
	# Routes de l'api
	namespace :api, defaults: {format: 'json'} do
		namespace :v1 do
			resources :evenements do
				get :pending, :on => :collection
				get :solved, :on => :collection						
			end	
		end
	end

  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  root :to => "evenements#index"

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id(.:format)))'
end
