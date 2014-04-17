include ApplicationHelper

class Client < ActiveRecord::Base
	has_many :societes
	has_many :evenements
	has_many :licences
	has_many :licences_logs
	has_many :clients_secteurs, :dependent => :destroy
	has_many :secteurs, :through => :clients_secteurs
	has_many :clients_interets, :dependent => :destroy
	has_many :interets, :through => :clients_interets
	has_many :envois_clients, :dependent => :destroy
	has_many :envois, :through => :envois_clients
	has_many :offres, :dependent => :destroy
	has_many :suivis, :dependent => :destroy
	
	validates_presence_of :nom
	before_save :encode_serial
	
	accepts_nested_attributes_for :secteurs, :interets
	
	def self.search(search,lng="")
		if search
			if lng == "de"
				where("UPPER(nom) LIKE UPPER(?) AND langue = 'de'", "%#{search}%")
			else
				where("UPPER(nom) LIKE UPPER(?)", "%#{search}%")
			end
		else
			if lng == "de"
				where("langue = 'de'")
			else
				scoped
			end
		end
	end
	
	# Accessors
	attr_reader :sorba_programme, :enneascanning, :autres_produits, :enneasoft_client
	attr_accessor :adresse_tel_search, :secteur_activite
	
	def sorba_programme
		numero.nil? ? false : (inactif ? false : true)		
	end
	
	def enneascanning
		enneascanningPdf || enneascanningSorba ? true : false		
	end
	
	def autres_produits
		autre.nil? || autre == "" ? false : true		
	end
	
	def enneasoft_client
		numero_enneasoft.nil? ? false : (inactif ? false : true)			
	end
	
	# Retourne le nom complet du contact
	def contact
		"#{small_title(titre.to_s)} #{contact_prenom.to_s} #{contact_nom.to_s}".strip		
	end
	
	# Retourne le dernier suivi pour le client en cours et le mailing spécifié (par défaut, aucun mailing n'est spécifié)
	def last_suivi(mailing_id = nil)
		suivi = Suivi.where(:mailing_id => mailing_id, :client_id => self.id).order("date_suivi DESC").first
		if suivi.nil? # Si on ne trouve aucun suivi, on renvoi le premier état
			Suivi.new(:etat_id => 1)
		else # Sinon on renvoi l'état du suivi trouvé
			suivi
		end
	end	
	
	# Renseigne si le client a déjà un suivi pour le mailing actuel
	def has_suivi_for?(mailing_id)
		return Suivi.where(:client_id => self.id, :mailing_id => mailing_id).count > 0	
	end
	
	def encode_serial
		if numero_enneasoft	and version_epdf.to_i >= 3 and serial.nil?
			s = generate_serial(numero_enneasoft)
			# On contrôle que le serial généré n'existe pas encore
			while Client.where(:serial => s).length > 0 do
				# Tant que le serial généré existe déjà dans la liste, on en génère un autre
				s = generate_serial(numero_enneasoft)
			end
			self.serial = s
		end
	end

  
	def blocked_support
	  not_sorba = !sorba && sorba_programme
	  not_enneasoft = !enneasoft && enneasoft_client
	  
    if no_support
      1
    elsif not_sorba && not_enneasoft
      4
    elsif not_sorba
      2
    elsif not_enneasoft
      3
    else
      0
    end  
	end
	
	private
	
	def generate_serial(id)
		# ordre des nombres
		ordre = Random.new.rand(1..9)
		i_s = id.to_s
		id_s = [ (i_s.length < 6 ? "0" : i_s[5]), (i_s.length < 5 ? "0" : i_s[4]), i_s[0], i_s[1], i_s[2], i_s[3] ]
		id_str = get_final_numbers(get_order(ordre,id_s))
		serial = ""
		(0..18).each do |i|
			letter = Random.new.rand(0..1)
			if letter == 1
				ascii = Random.new.rand(65..90)
				serial += ascii.chr
			else
				serial += Random.new.rand(0..9).to_s
			end
		end
		
		serial[2] = id_str[0]
		serial[4] = "-"
		serial[6] = id_str[1]
		serial[8] = id_str[2]
		serial[9] = "-"
		serial[11] = id_str[3]
		serial[12] = ordre.to_s
		serial[14] = "-"
		serial[15] = id_str[4]
		serial[16] = id_str[5]
		
		return serial
	end
	# Met dans le bon ordre en fonction de l'ordre défini
	def get_order(ordre,id)
		o = []
		case ordre
			when 1
				o = [ id[5],id[0],id[1],id[2],id[3],id[4] ]
			when 2
				o = [ id[5],id[4],id[3],id[0],id[1],id[2] ]
			when 3
				o = [ id[0],id[1],id[2],id[3],id[4],id[5] ]
			when 4
				o = [ id[4],id[5],id[0],id[2],id[1],id[3] ]
			when 5
				o = [ id[3],id[4],id[5],id[0],id[1],id[2] ]	
			when 6
				o = [ id[4],id[5],id[3],id[2],id[0],id[1] ]
			when 7
				o = [ id[1],id[5],id[0],id[3],id[4],id[2] ]
			when 8
				o = [ id[4],id[3],id[2],id[5],id[0],id[1] ]
			when 9
				o = [ id[0],id[5],id[1],id[4],id[2],id[3] ]
		end
		
		return o
	end
	# Renvois les valeurs avec le calcul appliqué à chaque position
	def get_final_numbers(id)
		return [ calc(id[0].to_i,8),calc(id[1].to_i,-7),calc(id[2].to_i,3),calc(id[3].to_i,-5),calc(id[4].to_i,9),calc(id[5].to_i,-1) ]	
	end
	# Effectue le calcul sur chaque position
	def calc(number,calcul)
		val = calcul + number
		val = val > 9 ? val - 10 : (val < 0 ? (number + 10 + calcul) : val)
		return val.to_s
	end
end
