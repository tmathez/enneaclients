#encoding: UTF-8
module ClientsHelper
	def up_to_date(client)
		ev = EnneascanningVersion.where(:version => @client.version_epdf.to_f.to_s).first
		if ev.nil?
			"Ce client ne dispose pas d'une version d'enneascanning référencée dans les mise à jour."
		else
			if client.enneascanning_pdf_build.nil?
				"Aucune information de mise à jour n'existe pour ce client."
			else
				if client.enneascanning_pdf_build != ev.build
					"Ce client n'est pas à jour, il dispose de la version du #{client.enneascanning_pdf_build.strftime('%d.%m.%Y')}, la version #{ev.version} du serveur de mise à jour date du #{ev.build.strftime('%d.%m.%Y')}"
				else
					"Ce client est à jour, il dispose de la version du #{client.enneascanning_pdf_build.strftime('%d.%m.%Y')}"
				end
			end
		end
	end
	
	def client_to_hash(client)
		hash = {}
		hash[:nom] = client.nom
		hash[:contact_nom] = client.contact_nom
		hash[:contact_prenom] = client.contact_prenom
		hash[:rue] = client.rue
		hash
	end
end
