#encoding:UTF-8

class OffresController < ApplicationController
  def index
  	@offres = Offre.order("created_at DESC")
  	
	respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @offres }
      format.js
    end
  end

  def show
    @offre = Offre.find(params[:id])
	
    respond_to do |format|
      format.html { render :layout => "offre" } # show.html.erb
      format.xml  { render :xml => @offre }
      format.js
      format.pdf do
			render :pdf => "Offre ##{params[:id].to_s}", :layout => "offre.html.erb", :print_media_type => true, :show_as_html => params[:debug], 
				   :margin => { :top => 25, :bottom => 17, :left => 10, :right => 10 },  
				   :header => {:html => { :template => 'shared/offre_header.pdf.erb', :layout => "offre.html.erb", :locals => { :offre => @offre } } },
				   :footer => {:html => { :template => 'shared/offre_footer.pdf.erb', :layout => "offre.html.erb", :locals => { :offre => @offre } } }
	  end
    end
  end

  def new
    @offre = Offre.new(:client_id => params[:client_id])
    @offre.societe_id = 1
    
    textes_standard = TextesStandard.where(:societe_id => 1).first
    
    @offre.texte_string = textes_standard.texte_string
    @offre.texte_rabais = textes_standard.texte_rabais
    @offre.texte_installation = textes_standard.texte_installation
    @offre.texte_final = textes_standard.texte_final
    
    @offre.contrat_nom = textes_standard.contrat_nom
    @offre.contrat_description = textes_standard.contrat_description
    
    @offre.date_offre = Date.today.strftime("%d.%m.%Y")
    @offre.date_valide = (Date.today+31).strftime("%d.%m.%Y")
    
    @offre.licences = 0
    @offre.rabais_logiciel = 0
    
    for mod in SoftwareModule.order("id")
    	@offre.offres_modules.build(:module_id => mod.id, :nom => mod.nom, :description => mod.description, :prix => mod.prix)    	
    end
    
    for serv in CustomService.order("id")
    	@offre.offres_services.build(:service_id => serv.id, :description => serv.description,
    	                             :prix_jour => serv.prix_jour, :prix_heure => serv.prix_heure)    	
    end
    
    for can in Catalogue.order("membre,analyses,id")
    	@offre.offres_catalogues.build(:catalogue_id => can.id, :nom => can.nom, :prix => can.prix)
    end

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @offre }
    end
  end

  def edit
    @offre = Offre.find(params[:id])
    
    for mod in SoftwareModule.order("id")
    	@offre.offres_modules.build(:module_id => mod.id, :nom => mod.nom, :description => mod.description, :prix => mod.prix) if @offre.offres_modules.where(:module_id => mod.id).length == 0	
    end
    
    for serv in CustomService.order("id")
    	@offre.offres_services.build(:service_id => serv.id, :description => serv.description,
    	                             :prix_jour => serv.prix_jour, :prix_heure => serv.prix_heure) if @offre.offres_services.where(:service_id => serv.id).length == 0
    end
    
    for can in Catalogue.order("membre,analyses,id")
    	@offre.offres_catalogues.build(:catalogue_id => can.id, :nom => can.nom, :prix => can.prix) if @offre.offres_catalogues.where(:catalogue_id => can.id).length == 0
    end
  end

  def create
    @offre = Offre.new(params[:offre])

    respond_to do |format|
      if @offre.save
        format.html { redirect_to(offres_path) }
        format.xml  { render :xml => @offre, :status => :created, :location => @offre }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @offre.errors, :status => :unprocessable_entity }
      end
    end
  end

  def update
    @offre = Offre.find(params[:id])

    respond_to do |format|
      if @offre.update_attributes(params[:offre])
        format.html { redirect_to(offres_path) }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @offre.errors, :status => :unprocessable_entity }
      end
    end
  end

  def destroy
    @offre = Offre.find(params[:id])
    @offre.destroy

    respond_to do |format|
      format.html { redirect_to(offres_url) }
      format.xml  { head :ok }
    end
  end
  
  # ACTIONS PERSONNALISEES

  def textes
  	@modules = SoftwareModule.order("id")
  	@services = CustomService.order("id")
  end
  
  def change_client
  	@client = !params[:id].blank? ? Client.find(params[:id]) : Client.new
  end
end
