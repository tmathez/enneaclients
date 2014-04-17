require 'nokogiri'
require 'open-uri'
require 'htmlentities'

class ProspectsController < ApplicationController
	def index
		if params[:was].present? || params[:who].present?
			encoder = HTMLEntities.new
			@was = encoder.encode(params[:was], :named).to_s.gsub(" ","+")
			@who = encoder.encode(params[:who], :named).to_s.gsub(" ","+")
			
			url =  "http://tel.search.ch/api/?was=#{@was}&who=#{@who}&maxnum=200&lang=fr&key=#{TEL_SEARCH_KEY}"
			result = Nokogiri::XML(open(url)) #Nokogiri::XML(open("D:\\enneaclients\\app\\views\\prospects\\index.xml")) #
			
			@clients = []
			secteurs = ""
			
			entries = result.xpath("//xmlns:entry")
						
			result.xpath("//xmlns:entry").each do |entry|
				# Par défaut on affiche la première catégorie, mais on récupère quand même toutes les catégories du client
				secteurs = entry.xpath(".//tel:category").map {|node| node.text }
				# Application des champs standards
				client = Client.new(
						:adresse_tel_search => entry.css("link").first.get_attribute("href"),
						:secteur_activite => secteurs,
						:rue => "#{entry.xpath(".//tel:street").text} #{entry.xpath(".//tel:streetno").text}".strip,
						:npa => entry.xpath(".//tel:zip").text,
						:lieu => entry.xpath(".//tel:city").text,
						:canton => entry.xpath(".//tel:canton").text,
						:tel => format_tel(entry.xpath(".//tel:phone").text)
				)
				
				if entry.xpath(".//tel:type").text == "Person" # S'il s'agit d'une personne
					client.nom = "#{entry.xpath(".//tel:name").text} #{entry.xpath(".//tel:firstname").text}".strip
					client.contact_nom = entry.xpath(".//tel:name").text
					client.contact_prenom = entry.xpath(".//tel:firstname").text
				else
					client.nom = entry.xpath(".//tel:name").text
				end
				
				entry.xpath(".//tel:extra").each do |extra|
					case extra.get_attribute("type")
						when "Fax"
							client.fax = format_tel(extra.text)
						when "Mobile"
							client.natel = format_tel(extra.text)
						when "email"
							client.email = extra.text
						when "website"
							client.web = extra.text
					end				
				end
				
				@clients << client
			end
			
			@total_results = result.xpath("//openSearch:totalResults").text
			
			
		end
	end
	
	def add_client
		
	end
	
	private 
	
	def format_tel(tel)
		if tel.blank?
			''
		else
			tel.gsub!("+41","0")
			'%s %s %s %s' % [tel[0..2],tel[3..5],tel[6..7],tel[8..9]]
		end
	end
end