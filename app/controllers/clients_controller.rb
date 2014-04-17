class ClientsController < ApplicationController
  before_filter :set_language	
	
  # GET /clients
  # GET /clients.xml
  def index
  	@clients = Client.search(params[:search],"fr").order('nom, inactif').where(query_by_subdomain("clients#index"))
  	
	respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @clients }
      format.js
    end
  end

  # GET /clients/1
  # GET /clients/1.xml
  def show
    @client = Client.find(params[:id])
	@pending = @client.evenements.where(:resolu => false).order("updated_at DESC")
	@solved  = @client.evenements.where(:resolu => true).order("updated_at DESC")
	@page = params[:page].present? ? params[:page] : "infos"

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @client }
      format.js
    end
  end

  # GET /clients/new
  # GET /clients/new.xml
  def new
  	@clients = {}
  	if params[:client].present?
    	@client = Client.new(params[:client])
    	@clients = Client.where("tel LIKE '%#{@client.tel}%' AND tel IS NOT NULL")
  	else
    	@client = Client.new
  	end
  	
  	@client.interesse = prospect
    @numero_enneasoft = Client.where("numero_enneasoft > 0").order("numero_enneasoft DESC").first.numero_enneasoft + 1

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @client }
    end
  end

  # GET /clients/1/edit
  def edit
    @client = Client.find(params[:id])
    @numero_enneasoft = Client.where("numero_enneasoft > 0").order("numero_enneasoft DESC").first.numero_enneasoft + 1 if @client.numero_enneasoft.nil?
  end

  # POST /clients
  # POST /clients.xml
  def create
    @client = Client.new(params[:client])

    respond_to do |format|
      if @client.save
        format.html { redirect_to(clients_path) }
        format.xml  { render :xml => @client, :status => :created, :location => @client }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @client.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /clients/1
  # PUT /clients/1.xml
  def update
  	params[:client][:secteur_ids] ||= []
  	params[:client][:interet_ids] ||= []
  	
    @client = Client.find(params[:id])

    respond_to do |format|
      if @client.update_attributes(params[:client])
        format.html { redirect_to(@client) }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @client.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /clients/1
  # DELETE /clients/1.xml
  def destroy
    @client = Client.find(params[:id])
    @client.destroy

    respond_to do |format|
      format.html { redirect_to(clients_url) }
      format.xml  { head :ok }
    end
  end
  
  # Actions personnalisées
  
  def print
  	sort = params[:sort]
  	sort = "nom" if sort.nil? || sort == ""
  	
  	@clients = Client.search(params[:search]).order(sort)
  	
  	respond_to do |format|
  		format.html { render :layout => "print" }
  	end
  end
  
  def print_excel
  	if params[:commit].present?
  		where = ""
  		if params[:filter_contrats].present?
  			where += "sorba = #{params[:contrat_sorba].present? ? "TRUE" : "FALSE"} AND "
  			where += "enneasoft = #{params[:contrat_enneasoft].present? ? "TRUE" : "FALSE"} AND "
  		end
  		if params[:filter_products].present?
  			version = (params[:enneascanning_version].include?(">") || params[:enneascanning_version].include?("<") ? params[:enneascanning_version] : "= #{params[:enneascanning_version]}")
  			where += "numero #{params[:sorba].present? ? "> 0" : "IS NULL"} AND "
  			where += "\"enneascanningSorba\" = #{params[:enneascanning].present? ? "TRUE" : "FALSE"} AND "
  			where += "\"enneascanningPdf\" = #{params[:enneascanning_pdf].present? ? "TRUE" : "FALSE"} AND "
  			where += "autre #{params[:autres].present? ? "<>" : "="} '' AND "
  			where += "version_epdf #{version} AND " if !params[:enneascanning_version].blank?
  		end
  		where = where[0..where.length-6]
  		@clients = Client.where(where).order('nom')
  	end
  	
  	respond_to do |format|
  		format.html
  		format.js
  		format.xls do
	      render :xls => @clients,
	                     :columns => [ :nom, :contact, :rue, :npa, :lieu ],
	                     :headers => %w[ Nom Contact Rue NPA Lieu ]
	    end
  	end
  end
  
  def update_enneascanning
  	@client = Client.find(params[:id])
  	@client.update_attribute(:enneascanning_pdf_build,params[:build]) if params[:build].present?
  	
  	render :nothing => true
  end
  
  def set_language
  	session[:langue] ||= "fr"
  	#session[:langue] ||= local_ip ? "fr" : "de"
  end
end
